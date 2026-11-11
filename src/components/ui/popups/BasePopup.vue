<!-- ====================== BasePopup.vue ======================
A single, reusable Vue 3 SFC that handles BOTH centered popups and slide-ins.
- Teleports to <body>
- Shared overlay (singleton) with stacking
- Responsive width/height maps using your schema
- Effects: instant, fade, scale, slideTopFade (popup); translate for slide-in
- Focus trap, Esc-to-close, body scroll lock
- Events: DOM CustomEvents + Vue emits, with detailed flags in event.detail
- Data-attribute close buttons: [data-popup-close], [data-slideIn-close]
- Loader via CONFIG-SPECIFIED COMPONENT (no built-in loader markup)
- Allows custom classes and attributes on the container
- Defaults per your specs (close is instant; popup default height is 500px; slide-in from left)
- NEW: Optional scrollable content with hidden scrollbar
================================================================= -->
<template>
  <Teleport :to="props.teleportTo || 'body'" :disabled="mergedPopupConfig.isAbsolute">
    <!-- Local overlay for absolute popups to avoid dimming whole screen -->
    <div 
      v-if="isPanelVisible && mergedPopupConfig.isAbsolute && mergedPopupConfig.shouldShowOverlay"
      class="absolute inset-0 bg-black/5 backdrop-blur-[7.5px] z-[1999] cursor-pointer"
      @click="handleEscapeKey"
    ></div>

    <!-- Panel wrapper (modal container) -->
    <div
      v-show="isPanelVisible"
      ref="popupPanelRef"
      :role="ariaRole"
      :aria-modal="isModal ? 'true' : undefined"
      :tabindex="isModal ? -1 : undefined"
      :class="containerClassList"
      v-bind="containerBindAttrs"
      @keydown.esc.prevent.stop="handleEscapeKey"
      @click.stop
    >
      <!--
        Sticky loader pins to the VISIBLE scrollport of this panel.
        So if the user scrolls to the bottom, the spinner stays dead-center
        of what they currently see (not stuck at the top of the tall content).
      -->
      <div
        v-if="isLoading"
        class="sticky top-0 z-[9999] w-full overflow-visible"
        style="height: 0"
        :data-loader-position="loaderPosition"
      >
        <div
          class="pointer-events-auto flex w-full"
          :class="loaderOverlayClass"
          :style="loaderStickyInnerStyle"
        >
          <component
            v-if="loaderComponent"
            :is="loaderComponent"
            v-bind="loaderProps"
          />
          <div
            v-else
            class="animate-spin w-4 h-4 border border-emerald-600 border-t-transparent rounded-full"
            aria-hidden="true"
          ></div>
        </div>
      </div>

      <!-- Content slot — keep white shell / chrome painted while loading (do not hide panel) -->
      <div
        ref="popupContentRef"
        :class="contentClassList"
        :aria-busy="isLoading ? 'true' : undefined"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

/**
 * BasePopup.vue
 * Requirements satisfied:
 *  - Vue 3 + <script setup>, JS
 *  - Shared overlay & stacking via composable
 *  - Config schema preserved (width/height maps with "<", "A-B", ">", "default")
 *  - Popup positions: center-center (default), top-center, or full page (when width/height resolve to 100%)
 *  - Slide-in: default from left; respects offset; pins to edge unless offset set
 *  - Close on outside clicks closes the MOST RECENT panel (top of stack), subsequent outside clicks close lower ones in turn
 *  - Default close is INSTANT; popup default height 500px; slide-in height 100%
 *  - Data-attribute close buttons supported inside content
 *  - Custom classes & attributes on container via config.containerClass / config.containerAttrs
 *  - Validate presence before acting; throw with clear console error (as requested)
 *  - Events carry flags and metadata for custom logic
 *  - NEW: Optional scrollable content with hidden scrollbar (default: true)
 */

import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { usePopupStack } from '@/composables/usePopupStack.js';
import {
  getEmbedViewportHeight,
  getEmbedViewportOffsetTop,
  onEmbedViewportChange,
} from '@/systems/embed/embedViewport.js';

const PANEL_EVENT_PHASE_OPEN = "open";
const PANEL_EVENT_PHASE_CLOSE = "close";

const props = defineProps({
  /**
   * Full config object (schema preserved)
   * Example keys:
   * {
   *   actionType: "popup" | "slideIn",
   *   speed, effect, customEffect, closeSpeed, closeEffect,
   *   shouldShowOverlay, shouldCloseOnOutsideClick, shouldLockBodyScroll, zIndex, forceZIndex,
   *   width: {...}, height: {...},
   *   from: "left" | "right" | "top" | "bottom",
   *   offset: "0px" | "30px" | number,
   *   resetOnClose, customClass, containerClass, containerAttrs,
   *   shouldCloseOnEscape, onOpen, onClose,
   *   position: "center" | "top-center" | "full" (popup only),
   *   loader: { component: <VueComponent>, props: {...}, position: "center"|"top-center"|... },
   *   scrollable: true | false (NEW: makes content scrollable with hidden scrollbar)
   * }
   */
  popupConfig: {
    type: Object,
    required: true
  },
  /**
   * v-model control for visibility
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * Optional loading state to show loader component
   */
  isLoading: {
    type: Boolean,
    default: false
  },
  /**
   * Target for teleportation. Defaults to body.
   */
  teleportTo: {
    type: String,
    default: 'body'
  }
});

const emit = defineEmits([
  'update:modelValue',
  'popup-opened',
  'popup-closed'
]);

// -------------------- Defaults (per your spec) --------------------
const DEFAULT_POPUP_CONFIG = {
  actionType: 'popup',
  speed: '200ms',
  effect: 'ease',
  customEffect: 'scale', // popup default
  closeSpeed: '0ms',     // default close is INSTANT
  closeEffect: 'instant',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockScroll: true,
  zIndex: 2000,
  forceZIndex: null,
  width: { default: 'auto' },
  height: { default: 'auto' }, // popup default height
  from: 'left', // slide-in default
  offset: '0px',
  resetOnClose: true,
  customClass: '',
  containerClass: '',
  containerAttrs: {},
  shouldCloseOnEscape: true,
  position: 'center', // popup: center | top-center | full (inferred if width/height=100%)
  scrollable: true ,// NEW: default scrollable with hidden scrollbar
  verticalAlign: 'stretch',
  isAbsolute: false // NEW: Support for absolute positioning within relative parent
};

// -------------------- State & Refs --------------------
const popupPanelRef = ref(null);
const popupContentRef = ref(null);
const isPanelVisible = ref(false);
const currentZIndex = ref(DEFAULT_POPUP_CONFIG.zIndex);

const {
  registerPanel,
  unregisterPanel,
  bringToFront,
  setOverlayActive,
  setOverlayVisible,
  setOverlayZ,
  popupOverlayClick,
  bodyScrollLock,
} = usePopupStack();

// -------------------- Helpers --------------------
const mergedPopupConfig = computed(() => ({ ...DEFAULT_POPUP_CONFIG, ...(props.popupConfig || {}) }));

function assertPopupShellInvariant(msg) {
  console.error(`[BasePopup] ${msg}`);
  throw new Error(msg);
}

function resolveResponsive(value) {
  if (value == null) return value;
  if (typeof value !== 'object') {
    return (typeof value === 'string') ? value.trim().toLowerCase() : value;
  }
  const viewportWidth = window.innerWidth;
  const fallback = value.default ?? Object.values(value)[0];
  let matchedBreakpointValue = null;

  for (const key in value) {
    if (key === 'default') continue;
    if (key.startsWith('<')) {
      const breakpointWidthLimit = parseInt(key.slice(1), 10);
      if (viewportWidth < breakpointWidthLimit) matchedBreakpointValue = value[key];
    } else if (key.startsWith('>')) {
      const breakpointWidthLimit = parseInt(key.slice(1), 10);
      if (viewportWidth > breakpointWidthLimit) matchedBreakpointValue = value[key];
    } else if (key.includes('-')) {
      const [min, max] = key.split('-').map(n => parseInt(n, 10));
      if (viewportWidth >= min && viewportWidth <= max) matchedBreakpointValue = value[key];
    }
  }
  const resolved = (matchedBreakpointValue ?? fallback);
  return (typeof resolved === 'string') ? resolved.trim().toLowerCase() : resolved;
}

function isInstantOpen() {
  // open animation considered instant if speed === "0ms" OR customEffect === "instant"
  return mergedPopupConfig.value.speed === '0ms' || mergedPopupConfig.value.customEffect === 'instant';
}
function isInstantClose() {
  // close animation considered instant if closeSpeed === "0ms" OR closeEffect === "instant"
  return (mergedPopupConfig.value.closeSpeed ?? mergedPopupConfig.value.speed) === '0ms' || (mergedPopupConfig.value.closeEffect ?? mergedPopupConfig.value.effect) === 'instant';
}

function dispatchDomEvent(name, detail) {
  // Include a "flag" payload for custom logic as requested
  // detail will include: type, mode, isPopup, isSlideIn, zIndex, id (if containerAttrs has data-* id), timestamps, etc.
  const el = popupPanelRef.value;
  if (!el) return;
  const ev = new CustomEvent(name, { bubbles: true, cancelable: false, detail });
  el.dispatchEvent(ev);
}

// -------------------- Derived styles & classes --------------------
const isPopup = computed(() => (mergedPopupConfig.value.actionType || 'popup') === 'popup');
const isSlideIn = computed(() => !isPopup.value);

const ariaRole = computed(() => {
  // Use dialog semantics for modal popups; slide-ins default to complementary unless overlay makes them modal
  if (isPopup.value) return 'dialog';
  return mergedPopupConfig.value.shouldShowOverlay ? 'dialog' : 'complementary';
});
const isModal = computed(() => !!mergedPopupConfig.value.shouldShowOverlay);

// container class: minimal Tailwind; visual decisions mostly from config / inline transforms
const containerClassList = computed(() => {
  const base = [
    'isolate',
    'text-base',
    'antialiased',
    'pointer-events-auto',
    'outline-none'
  ];
  // Hide scrollbar via CSS (for Chrome/Safari — inline styles can't target ::webkit-scrollbar)
  if (mergedPopupConfig.value.scrollable !== false) {
    base.push('scrollbar-hide');
  }
  if (mergedPopupConfig.value.containerClass) {
    if (Array.isArray(mergedPopupConfig.value.containerClass)) base.push(...mergedPopupConfig.value.containerClass);
    else base.push(mergedPopupConfig.value.containerClass);
  }
  if (mergedPopupConfig.value.customClass) base.push(mergedPopupConfig.value.customClass);
  // Stay out of document flow from first paint so iframe height reports do not
  // include the popup (position:fixed is also applied inline on open).
  base.push(mergedPopupConfig.value.isAbsolute ? 'absolute' : 'fixed');
  return base;
});

const contentClassList = computed(() => {
  // Never hide the popup shell while loading — empty chrome + spinner is the approved UX.
  return ['w-full h-full', 'relative'];
});

const containerBindAttrs = computed(() => {
  // Add any data-* or aria-* attributes the caller wants
  const attrs = mergedPopupConfig.value.containerAttrs || {};
  return attrs;
});

// Loader component from config (defaults: small thin global spinner look)
const loaderComponent = computed(() => (mergedPopupConfig.value.loader && mergedPopupConfig.value.loader.component) ? mergedPopupConfig.value.loader.component : null);
const loaderProps = computed(() => {
  const configured = (mergedPopupConfig.value.loader && mergedPopupConfig.value.loader.props)
    ? mergedPopupConfig.value.loader.props
    : {};
  return {
    size: 'md',
    thickness: 1.5,
    color: 'text-success',
    trackColor: 'text-gray-200',
    showTrack: true,
    ...configured,
  };
});
const loaderPosition = computed(() => (mergedPopupConfig.value.loader && mergedPopupConfig.value.loader.position) ? mergedPopupConfig.value.loader.position : 'center');

const loaderShowsOverlay = computed(() => {
  const loader = mergedPopupConfig.value.loader;
  return !loader || loader.showOverlay !== false;
});

const loaderOverlayClass = computed(() => {
  if (!loaderShowsOverlay.value) return '';
  return [
    'bg-white/80 dark:bg-[#181a1b]/80',
    'backdrop-blur-[7.5px]',
    'shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)]',
  ].join(' ');
});

/** center | center-center | top-center | top center | bottom-center | ... */
const loaderOverlayStyle = computed(() => {
  const raw = String(loaderPosition.value || 'center').toLowerCase().replace(/\s+/g, '-');
  const style = {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '0',
    paddingBottom: '0',
  };
  if (raw === 'top-center' || raw === 'top' || raw === 'center-top') {
    style.alignItems = 'flex-start';
    style.paddingTop = '3rem';
  } else if (raw === 'bottom-center' || raw === 'bottom' || raw === 'center-bottom') {
    style.alignItems = 'flex-end';
    style.paddingBottom = '3rem';
  } else if (raw === 'left-center' || raw === 'left' || raw === 'center-left') {
    style.justifyContent = 'flex-start';
    style.paddingLeft = '3rem';
  } else if (raw === 'right-center' || raw === 'right' || raw === 'center-right') {
    style.justifyContent = 'flex-end';
    style.paddingRight = '3rem';
  }
  // center / center-center / default → flex center
  return style;
});

/** Visible scrollport height — sticky loader centers in what the user currently sees. */
const loaderViewportHeightPx = ref(0);

function syncLoaderViewportHeight() {
  const panel = popupPanelRef.value;
  loaderViewportHeightPx.value = panel ? Math.round(panel.clientHeight) : 0;
}

const loaderStickyInnerStyle = computed(() => ({
  ...loaderOverlayStyle.value,
  display: 'flex',
  width: '100%',
  height: loaderViewportHeightPx.value > 0
    ? `${loaderViewportHeightPx.value}px`
    : '100%',
}));

watch(
  () => props.isLoading,
  async (loading) => {
    if (!loading) return;
    await nextTick();
    syncLoaderViewportHeight();
  },
);

// -------------------- Open/Close mechanics --------------------
async function openPanel() {
  validateBeforeOpen();
  isPanelVisible.value = true;

  await nextTick();

  const panel = popupPanelRef.value;
  if (!panel) return;

  // z-index calc & overlay
  const baseZIndex = (mergedPopupConfig.value.forceZIndex != null) ? mergedPopupConfig.value.forceZIndex : (mergedPopupConfig.value.zIndex ?? DEFAULT_POPUP_CONFIG.zIndex);
  
  // Register with stack after nextTick ensures popupPanelRef.value is not null
  registerPanel(popupPanelRef, {
    onPanelBecameTopMost: () => { 
      registerOverlayClickHandler();
    },
    onPopupStackEmptied: () => {
      setOverlayVisible(false);
      setOverlayActive(false);
      bodyScrollLock(false);
    }
  });

  currentZIndex.value = bringToFront(panel, baseZIndex);
  // Position as fixed/absolute before the overlay lock reports iframe height,
  // otherwise the panel is still `relative` in document flow and inflates it.
  applyPanelInitialStyles(panel);
  if (mergedPopupConfig.value.shouldShowOverlay && !mergedPopupConfig.value.isAbsolute) {
    setOverlayZ(currentZIndex.value - 1);
    setOverlayActive(true);
    setOverlayVisible(true);
    registerOverlayClickHandler();
  } else if (mergedPopupConfig.value.shouldCloseOnOutsideClick) {
    // Even without global overlay, set up outside click detection
    registerOverlayClickHandler();
  }


  // Body scroll lock
  if (mergedPopupConfig.value.shouldLockBodyScroll) bodyScrollLock(true);

  // Wire data-close buttons
  attachCloseButtonListeners();

  // Focus handling
  focusPopupPanelElement();

  // Animate open
  requestAnimationFrame(() => {
    applyPanelEnterStyles(panel);
    const completePanelOpen = () => {
      // Capture-phase outside click: works with shared overlay AND when nested under a
      // parent BasePopup that uses @click.stop (bubble never reaches document).
      if (mergedPopupConfig.value.shouldCloseOnOutsideClick) {
        setTimeout(() => {
          document.addEventListener('click', handleDocumentClick, true);
        }, 100);
      }

      // Dispatch events with flags
      const detail = buildEventDetail(PANEL_EVENT_PHASE_OPEN);
      const domName = isPopup.value ? (mergedPopupConfig.value.openDomEventName || 'popup-open') : (mergedPopupConfig.value.openDomEventName || 'slidein-open');
      dispatchDomEvent(domName, detail);
      emit('popup-opened', detail);
    };
    if (isInstantOpen()) completePanelOpen();
    else panel.addEventListener('transitionend', completePanelOpen, { once: true });
  });
}

function closePanel() {
  const panel = popupPanelRef.value;
  if (!panel) return;

  applyPanelLeaveStyles(panel);

  const completePanelClose = async () => {
    // Hide first so iframe height restore cannot measure an in-flow panel.
    isPanelVisible.value = false;
    await nextTick();

    if (mergedPopupConfig.value.resetOnClose && panel) {
      panel.removeAttribute('style');
    }
    // resetOnClose wipes v-show's display:none. Keep the closed panel
    // out of the iframe so it cannot paint a white bar at the bottom.
    if (!isPanelVisible.value && panel) {
      panel.style.display = 'none';
    }

    // Unlock scroll if this panel was locking it
    if (mergedPopupConfig.value.shouldLockBodyScroll) bodyScrollLock(false);

    if (mergedPopupConfig.value.shouldCloseOnOutsideClick) {
      document.removeEventListener('click', handleDocumentClick, true);
    }

    // Overlay & scroll unlock managed by stack (only if top-most)
    unregisterPanel(panel);

    // Restore focus to previous element
    restoreFocus();

    // Events
    const detail = buildEventDetail(PANEL_EVENT_PHASE_CLOSE);
    const domName = isPopup.value ? (mergedPopupConfig.value.closeDomEventName || 'popup-close') : (mergedPopupConfig.value.closeDomEventName || 'slidein-close');
    dispatchDomEvent(domName, detail);
    emit('popup-closed', detail);
  };

  if (isInstantClose()) completePanelClose();
  else panel.addEventListener('transitionend', completePanelClose, { once: true });
}


function closeTopMostPanel() {
  // Only close if THIS panel is top-most; otherwise let the real top-most handle it
  const panel = popupPanelRef.value;
  if (!panel) return;
  if (bringToFront.isTop(panel)) {
    emit('update:modelValue', false);
  }
}

function handleDocumentClick(event) {
  const panel = popupPanelRef.value;
  if (!panel || !isPanelVisible.value) return;

  // Clicks inside the panel stay open.
  if (panel.contains(event.target)) return;

  // Teleported menus/tooltips affiliated with this popup (mark with data-base-popup-portaled).
  if (event.target?.closest?.('[data-base-popup-portaled]')) return;

  closeTopMostPanel();
}

// -------------------- Validation --------------------
function validateBeforeOpen() {
  // Always validate presence before performing actions
  // Popup always centers (or top-center/full page per config); slide-in requires direction
  // Ensure we have the element refs
  if (!popupPanelRef.value) assertPopupShellInvariant('Panel element not found.');
  if (!popupContentRef.value) assertPopupShellInvariant('Content element not found.');

  // Validate actionType
  const actionType = mergedPopupConfig.value.actionType || 'popup';
  if (actionType !== 'popup' && actionType !== 'slideIn') assertPopupShellInvariant(`Invalid actionType "${actionType}". Use "popup" or "slideIn".`);

  // Validate effects if provided
  const customEffect = (mergedPopupConfig.value.customEffect || (isPopup.value ? 'scale' : null));
  if (isPopup.value) {
    const allowedCustomEffects = ['instant', 'fade', 'scale', 'slideTopFade'];
    if (customEffect && !allowedCustomEffects.includes(customEffect)) assertPopupShellInvariant(`Unsupported popup customEffect "${customEffect}". Allowed: ${allowedCustomEffects.join(', ')}`);
  }

  // slide-in direction
  if (isSlideIn.value) {
    const slideInDirection = mergedPopupConfig.value.from || 'left';
    const allowedSlideInDirections = ['left', 'right', 'top', 'bottom'];
    if (!allowedSlideInDirections.includes(slideInDirection)) assertPopupShellInvariant(`Invalid slide-in "from"="${slideInDirection}". Allowed: ${allowedSlideInDirections.join(', ')}`);
  }

  // Validate width/height types
  validateSizeValue(mergedPopupConfig.value.width, 'width');
  validateSizeValue(mergedPopupConfig.value.height, 'height');
}

function validateSizeValue(value, name) {
  if (value == null) return; // null/undefined is allowed
  
  if (typeof value === 'string') {
    // String values: px, %, vw, vh, auto
    const validStringPattern = /^(auto|\d+(\.\d+)?(px|%|vw|vh|rem|em))$/i;
    if (!validStringPattern.test(value.trim())) {
      assertPopupShellInvariant(`Invalid ${name} string value "${value}". Use format like "600px", "50%", "100vw", "100vh", "30rem", "2em", or "auto".`);
    }
  } else if (typeof value === 'number') {
    // Number values: treated as pixels
    if (value < 0) {
      assertPopupShellInvariant(`Invalid ${name} number value "${value}". Must be non-negative.`);
    }
  } else if (typeof value === 'object') {
    // Responsive object: validate each key-value pair
    for (const key in value) {
      if (key === 'default') {
        validateSizeValue(value[key], `${name}.default`);
      } else if (key.startsWith('<') || key.startsWith('>')) {
        // Breakpoint keys like "<640", ">1024"
        const num = parseInt(key.slice(1), 10);
        if (isNaN(num) || num <= 0) {
          assertPopupShellInvariant(`Invalid ${name} breakpoint key "${key}". Use format like "<640" or ">1024".`);
        }
        validateSizeValue(value[key], `${name}.${key}`);
      } else if (key.includes('-')) {
        // Range keys like "301-767"
        const [min, max] = key.split('-').map(n => parseInt(n, 10));
        if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min >= max) {
          assertPopupShellInvariant(`Invalid ${name} range key "${key}". Use format like "301-767" where min < max.`);
        }
        validateSizeValue(value[key], `${name}.${key}`);
      } else {
        assertPopupShellInvariant(`Invalid ${name} object key "${key}". Use "default", "<N", ">N", or "N-M" format.`);
      }
    }
  } else {
    assertPopupShellInvariant(`Invalid ${name} type "${typeof value}". Use string, number, or responsive object.`);
  }
}

function toEmbedAwareHeight(resolvedHeight, fallback = '500px') {
  const viewportH = getEmbedViewportHeight();
  if (resolvedHeight == null) return fallback;

  if (typeof resolvedHeight === 'number') {
    return `${Math.min(resolvedHeight, viewportH)}px`;
  }

  const raw = String(resolvedHeight).trim().toLowerCase();
  if (raw === 'auto') return 'auto';

  if (raw.endsWith('%')) {
    const pct = parseFloat(raw);
    if (Number.isFinite(pct)) return `${Math.round((pct / 100) * viewportH)}px`;
  }

  if (raw.endsWith('vh')) {
    const vh = parseFloat(raw);
    if (Number.isFinite(vh)) return `${Math.round((vh / 100) * viewportH)}px`;
  }

  return resolvedHeight;
}

function applyEmbedAwarePopupBox(panel, normalizedW, normalizedH, isFullWidth, isFullHeight) {
  const viewportH = getEmbedViewportHeight();
  const offsetTop = getEmbedViewportOffsetTop();
  const pos = resolveResponsive(mergedPopupConfig.value.position) || 'center';

  panel.style.width = (normalizedW ?? 'auto');
  panel.style.height = toEmbedAwareHeight(normalizedH, '500px');
  // Prefer config maxHeight (supports responsive maps like height/width).
  // Full-width + non-100% height without translate looks like a bottom half-sheet —
  // callers wanting mobile full sheet should use height/maxHeight 100%|<786>.
  const maxH = resolveResponsive(mergedPopupConfig.value.maxHeight);
  if (maxH != null) {
    panel.style.maxHeight =
      typeof maxH === 'string' ? toEmbedAwareHeight(maxH, maxH) : `${maxH}px`;
  } else {
    panel.style.maxHeight = `${viewportH}px`;
  }

  if (isFullWidth) {
    panel.style.left = '0';
    panel.style.right = '0';
  } else {
    panel.style.left = '50%';
  }

  if (isFullHeight) {
    panel.style.top = `${offsetTop}px`;
    panel.style.bottom = 'auto';
  } else if (pos === 'top-center') {
    panel.style.top = `${offsetTop}px`;
    panel.style.bottom = 'auto';
  } else {
    panel.style.top = `${offsetTop + viewportH / 2}px`;
    panel.style.bottom = 'auto';
  }
}

// -------------------- Style application --------------------
function applyPanelInitialStyles(panel) {
  const resolvedWidth = resolveResponsive(mergedPopupConfig.value.width);
  const resolvedHeight = resolveResponsive(mergedPopupConfig.value.height);
  const normalizedW = (typeof resolvedWidth === 'string') ? resolvedWidth.trim().toLowerCase() : resolvedWidth;
  const normalizedH = (typeof resolvedHeight === 'string') ? resolvedHeight.trim().toLowerCase() : resolvedHeight;
  const isFullWidth = ['100%', '100vw'].includes(normalizedW);
  const isFullHeight = ['100%', '100vh'].includes(normalizedH);

  // Base styles
  panel.style.position = mergedPopupConfig.value.isAbsolute ? 'absolute' : 'fixed';
  panel.style.zIndex = String(currentZIndex.value);
  panel.style.visibility = 'visible';

  // popupPanelRef IS the scroll container. This means:
  // - Mouse wheel fires on popupPanelRef (or its children) → scrolls popupPanelRef ✓
  // - Arrow keys work because popupPanelRef is focused (tabindex=-1) and overflow-y: auto ✓
  // - Touch scroll works naturally ✓
  // - overscroll-behavior: contain prevents scroll chain leaking to the locked body ✓
  if (mergedPopupConfig.value.scrollable !== false) {
    panel.style.overflowY = 'auto';
    panel.style.overflowX = 'hidden';
    panel.style.overscrollBehavior = 'contain';
    panel.style.scrollbarWidth = 'none';       // Firefox: hide scrollbar
    panel.style.msOverflowStyle = 'none';      // IE/Edge: hide scrollbar
  } else {
    panel.style.overflow = 'visible';
  }

  // --- POPUP LOGIC ---
  if (isPopup.value) {
    if (mergedPopupConfig.value.isAbsolute) {
      panel.style.width = (normalizedW ?? 'auto');
      panel.style.height = normalizedH === 'auto' || normalizedH == null ? 'auto' : toEmbedAwareHeight(normalizedH, 'auto');
      const maxH = resolveResponsive(mergedPopupConfig.value.maxHeight);
      if (maxH != null) {
        panel.style.maxHeight = typeof maxH === 'string' ? toEmbedAwareHeight(maxH, maxH) : `${maxH}px`;
      }
      panel.style.transform = 'none';
      panel.style.opacity = '1';
      if (isInstantOpen()) {
        panel.style.transition = 'none';
      }
    } else {
      applyEmbedAwarePopupBox(panel, normalizedW, normalizedH, isFullWidth, isFullHeight);
      
      const pos = resolveResponsive(mergedPopupConfig.value.position) || 'center';

      const effect = mergedPopupConfig.value.customEffect || 'scale';
      if (isInstantOpen()) {
        panel.style.transition = 'none';
        if (!isFullWidth || !isFullHeight) {
          if (effect === 'slideTopFade') { panel.style.opacity = '1'; panel.style.transform = 'translate(-50%, -50%)'; }
          else if (effect === 'fade') { panel.style.opacity = '1'; }
          else { panel.style.transform = 'translate(-50%, -50%)'; }
        }
      } else {
        if (effect === 'fade') {
          panel.style.opacity = '0';
          panel.style.transition = `opacity ${mergedPopupConfig.value.speed} ${mergedPopupConfig.value.effect}`;
        } else if (effect === 'slideTopFade') {
          panel.style.opacity = '0';
          panel.style.transform = isFullWidth || isFullHeight ? 'none' : 'translate(-50%, -150%)';
          panel.style.transition = `transform ${mergedPopupConfig.value.speed} ${mergedPopupConfig.value.effect}, opacity ${mergedPopupConfig.value.speed} ${mergedPopupConfig.value.effect}`;
        } else {
          panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0) scale(0)' : 'translate(-50%, -50%) scale(0)');
          panel.style.transition = `transform ${mergedPopupConfig.value.speed} ${mergedPopupConfig.value.effect}`;
        }
      }
      
      if (!isFullWidth && !isFullHeight && mergedPopupConfig.value.position !== 'top-center') {
        panel.style.transform = panel.style.transform || 'translate(-50%, -50%)';
      }
    }

  } else {
    // --- SLIDE-IN LOGIC (UPDATED FOR BOTTOM ALIGNMENT) ---
    panel.style.width = (normalizedW ?? 'auto');
    panel.style.maxHeight = `${getEmbedViewportHeight()}px`;
    const slideInDirection = mergedPopupConfig.value.from || 'left';
    const offset = (typeof mergedPopupConfig.value.offset === 'number') ? `${mergedPopupConfig.value.offset}px` : (mergedPopupConfig.value.offset || '0px');
    const verticalAlign = mergedPopupConfig.value.verticalAlign || 'stretch'; // Get vertical align config

    // LEFT / RIGHT SLIDE-INS
    if (slideInDirection === 'left' || slideInDirection === 'right') {
      
      // Vertical Alignment Logic
      if (verticalAlign === 'stretch') {
        panel.style.top = '0';
        panel.style.bottom = '0';
        panel.style.height = '100%';
      } else if (verticalAlign === 'bottom') {
        panel.style.top = 'auto';
        panel.style.bottom = '0px'; // Thora gap bottom se
        panel.style.height = (normalizedH ?? 'auto'); // Auto height
      } else if (verticalAlign === 'top') {
        panel.style.top = '20px'; // Thora gap top se
        panel.style.bottom = 'auto';
        panel.style.height = (normalizedH ?? 'auto');
      } else {
        // center
        panel.style.top = '50%';
        panel.style.bottom = 'auto';
        panel.style.height = (normalizedH ?? 'auto');
        // Note: transform will need specific handling below for center, but bottom is priority here
      }

      // Horizontal Logic
      if (slideInDirection === 'left') {
        panel.style.left = offset || '0';
        panel.style.right = 'auto';
        panel.style.transform = (verticalAlign === 'center') ? 'translate(-100%, -50%)' : 'translateX(-100%)';
      } else {
        panel.style.right = offset || '0';
        panel.style.left = 'auto';
        panel.style.transform = (verticalAlign === 'center') ? 'translate(100%, -50%)' : 'translateX(100%)';
      }

    } else {
      // TOP / BOTTOM SLIDE-INS (Standard logic)
      panel.style.left = '0';
      panel.style.right = '0';
      if (slideInDirection === 'top') {
        panel.style.top = offset || '0';
        panel.style.bottom = 'auto';
        panel.style.transform = 'translateY(-100%)';
      } else {
        panel.style.bottom = offset || '0';
        panel.style.top = 'auto';
        panel.style.transform = 'translateY(100%)';
      }
      panel.style.width = (normalizedW ?? '100%');
      panel.style.height = (normalizedH ?? 'auto');
    }

    if (isInstantOpen()) {
      panel.style.transition = 'none';
    } else {
      // Transition apply
      panel.style.transition = `transform ${mergedPopupConfig.value.speed} ${mergedPopupConfig.value.effect}`;
    }
  }
}

function applyPanelEnterStyles(panel) {
  if (isPopup.value) {
     if (mergedPopupConfig.value.isAbsolute) {
       panel.style.opacity = '1';
       panel.style.transform = 'none';
       return;
     }

     const resolvedWidth = resolveResponsive(mergedPopupConfig.value.width);
     const resolvedHeight = resolveResponsive(mergedPopupConfig.value.height);
     const isFullWidth = ['100%', '100vw'].includes((resolvedWidth || '').toString());
     const isFullHeight = ['100%', '100vh'].includes((resolvedHeight || '').toString());
     const pos = mergedPopupConfig.value.position || 'center';
     const effect = mergedPopupConfig.value.customEffect || 'scale';

     if (effect === 'fade') { panel.style.opacity = '1'; }
     else if (effect === 'slideTopFade') {
       panel.style.opacity = '1';
       panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0)' : 'translate(-50%, -50%)');
     } else {
       panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, -50%) scale(1)');
     }
  } else {
    // --- SLIDE IN ENTER ---
    const verticalAlign = mergedPopupConfig.value.verticalAlign || 'stretch';
    const slideInDirection = mergedPopupConfig.value.from || 'left';

    if ((slideInDirection === 'left' || slideInDirection === 'right') && verticalAlign === 'center') {
       panel.style.transform = 'translate(0, -50%)'; // Keep vertical centering
    } else {
       panel.style.transform = 'translate(0, 0)';
    }
  }
}

function applyPanelLeaveStyles(panel) {
  if (isInstantClose()) {
    panel.style.transition = 'none';
  }
  if (isPopup.value) {
    if (mergedPopupConfig.value.isAbsolute) {
      panel.style.opacity = '0';
      panel.style.transform = 'none';
      return;
    }

    const effect = mergedPopupConfig.value.customEffect || 'scale';
    if (effect === 'fade') {
      panel.style.opacity = '0';
    } else if (effect === 'slideTopFade') {
      panel.style.opacity = '0';
      panel.style.transform = 'translate(-50%, -150%)';
    } else {
      panel.style.transform = 'translate(-50%, -50%) scale(0)';
    }
  } else {
    const slideInDirection = mergedPopupConfig.value.from || 'left';
    if (slideInDirection === 'left') panel.style.transform = 'translateX(-100%)';
    else if (slideInDirection === 'right') panel.style.transform = 'translateX(100%)';
    else if (slideInDirection === 'top') panel.style.transform = 'translateY(-100%)';
    else panel.style.transform = 'translateY(100%)';
  }
}

// -------------------- Focus & keyboard --------------------
let lastActive = null;

function safeFocus(el, options = undefined) {
  if (!el || typeof el.focus !== 'function') return;
  try {
    el.focus(options);
  } catch (err) {
    // iPad / older WebKit can throw when preventScroll option is unsupported.
    // Fallback to a plain focus call, or silently ignore if focus is not possible.
    try {
      el.focus();
    } catch (fallbackErr) {
      // ignore
    }
  }
}

function focusPopupPanelElement() {
  lastActive = document.activeElement;
  const el = popupPanelRef.value;
  if (!el) return;
  // Focus the panel itself (tabindex=-1 for modals).
  // This is critical: when popupPanelRef is focused, arrow keys and Page Up/Down
  // scroll the popupPanelRef (which is overflow-y: auto). If we focused a child
  // button instead, arrow keys would do nothing (buttons don't respond to arrow keys).
  safeFocus(el, { preventScroll: true });
}

function restoreFocus() {
  if (lastActive) {
    safeFocus(lastActive, { preventScroll: true });
  }
}

function handleEscapeKey() {
  if (!mergedPopupConfig.value.shouldCloseOnEscape) return;
  closeTopMostPanel();
}

// -------------------- Close buttons --------------------
function attachCloseButtonListeners() {
  const el = popupPanelRef.value;
  if (!el) return;
  const selector = isPopup.value ? '[data-popup-close]' : '[data-slideIn-close]';
  el.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', handleCloseClick, { once: false });
  });
}
function handleCloseClick() {
  closeTopMostPanel();
}

// -------------------- Events detail --------------------
function buildEventDetail(panelEventPhase) {
  return {
    panelEventPhase: panelEventPhase, // "open" | "close"
    actionType: mergedPopupConfig.value.actionType || 'popup',
    isPopup: isPopup.value,
    isSlideIn: isSlideIn.value,
    zIndex: currentZIndex.value,
    timestamp: Date.now(),
    flags: {
      isInstantOpen: isInstantOpen(),
      isInstantClose: isInstantClose(),
      hasOverlay: !!mergedPopupConfig.value.shouldShowOverlay,
      shouldLockScroll: !!mergedPopupConfig.value.shouldLockBodyScroll,
      scrollable: mergedPopupConfig.value.scrollable !== false
    },
    config: { ...mergedPopupConfig.value }
  };
}

// Helper to register the overlay click handler for THIS panel
function registerOverlayClickHandler() {
  if (mergedPopupConfig.value.shouldCloseOnOutsideClick) {
    popupOverlayClick.setHandler(() => closeTopMostPanel());
  } else if (mergedPopupConfig.value.shouldShowOverlay) {
    // If showing overlay but NOT closing on outside, swallow clicks
    popupOverlayClick.setHandler(() => {});
  }
}

// -------------------- Watchers & lifecycle --------------------
watch(() => props.modelValue, (isModelValueOpen) => {
  if (isModelValueOpen) {
    openPanel();
  } else {
    if (isPanelVisible.value) closePanel();
  }
}, { immediate: false });

watch(() => mergedPopupConfig.value.width, () => {
  applyVisiblePanelBox();
});

function settledPopupTransform(isFullWidth, isFullHeight) {
  if (isFullWidth || isFullHeight) return 'none';
  const pos = mergedPopupConfig.value.position || 'center';
  const effect = mergedPopupConfig.value.customEffect || 'scale';
  const shift = pos === 'top-center' ? 'translate(-50%, 0)' : 'translate(-50%, -50%)';
  if (effect === 'fade' || effect === 'slideTopFade') return shift;
  return `${shift} scale(1)`;
}

function applyVisiblePanelBox() {
  if (!isPanelVisible.value) return;
  const panel = popupPanelRef.value;
  if (!panel) return;

  const resolvedWidth = resolveResponsive(mergedPopupConfig.value.width);
  const resolvedHeight = resolveResponsive(mergedPopupConfig.value.height);
  const normalizedW = (typeof resolvedWidth === 'string') ? resolvedWidth.trim().toLowerCase() : resolvedWidth;
  const normalizedH = (typeof resolvedHeight === 'string') ? resolvedHeight.trim().toLowerCase() : resolvedHeight;
  const isFullWidth = ['100%', '100vw'].includes(String(normalizedW || ''));
  const isFullHeight = ['100%', '100vh'].includes(String(normalizedH || ''));

  if (isPopup.value) {
    if (mergedPopupConfig.value.isAbsolute) {
      panel.style.width = (normalizedW ?? 'auto');
      panel.style.height = normalizedH === 'auto' || normalizedH == null
        ? 'auto'
        : toEmbedAwareHeight(normalizedH, 'auto');
      const maxH = resolveResponsive(mergedPopupConfig.value.maxHeight);
      if (maxH != null) {
        panel.style.maxHeight = typeof maxH === 'string' ? toEmbedAwareHeight(maxH, maxH) : `${maxH}px`;
      }
      return;
    }
    applyEmbedAwarePopupBox(panel, normalizedW, normalizedH, isFullWidth, isFullHeight);
    const transform = settledPopupTransform(isFullWidth, isFullHeight);
    if (panel.style.transform !== transform) {
      const previousTransition = panel.style.transition;
      panel.style.transition = 'none';
      panel.style.transform = transform;
      void panel.offsetWidth;
      panel.style.transition = previousTransition;
    }
    return;
  }

  if (mergedPopupConfig.value.width) panel.style.width = resolvedWidth;
  if (mergedPopupConfig.value.height) panel.style.height = toEmbedAwareHeight(resolvedHeight, panel.style.height);
  panel.style.maxHeight = `${getEmbedViewportHeight()}px`;
}

watch(() => mergedPopupConfig.value.height, () => {
  applyVisiblePanelBox();
});

function handleWindowResize() {
  applyVisiblePanelBox();
}

let stopEmbedViewportSync = null;

onMounted(() => {
  window.addEventListener('resize', handleWindowResize, { passive: true });
  stopEmbedViewportSync = onEmbedViewportChange(applyVisiblePanelBox);
  if (props.modelValue) {
    openPanel();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  if (typeof stopEmbedViewportSync === 'function') stopEmbedViewportSync();
  // Remove document click listener if it was added
  if (!mergedPopupConfig.value.shouldShowOverlay && mergedPopupConfig.value.shouldCloseOnOutsideClick) {
    document.removeEventListener('click', handleDocumentClick);
  }
  // Ensure scroll unlocked if this panel was locking it
  bodyScrollLock(false);
  const panel = popupPanelRef.value;
  if (panel) unregisterPanel(panel);
});

// -------------------- v-model methods exposed --------------------
defineExpose({
  openPopup: () => { emit('update:modelValue', true); },
  closePopup: () => { emit('update:modelValue', false); },
  togglePopup: () => { emit('update:modelValue', !props.modelValue); }
});
</script>

<style scoped>
/* No hard-coded visual CSS; Tailwind handles visuals.
   Positioning/transform/opacity are inline because they're dynamic. */
</style>
