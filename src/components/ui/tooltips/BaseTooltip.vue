<template>
  <span
    class="items-center justify-center"
    :class="fullWidth ? 'flex w-full max-w-none' : 'inline-flex shrink-0'"
  >
    <div
      ref="anchorEl"
      class="cursor-pointer"
      :class="fullWidth ? 'flex w-full' : 'inline-flex'"
      tabindex="0"
      role="button"
    >
      <!-- Custom trigger (e.g. tip card / amount) — otherwise default ? icon -->
      <slot v-if="hasTriggerSlot" name="trigger" />
      <template v-else>
        <img
          v-if="tooltipIconUrl"
          :src="tooltipIconUrl"
          alt=""
          class="w-4 h-4"
        />
        <QuestionMarkCircleIcon v-else class="w-4 h-4 text-[#667085]" />
      </template>
    </div>

    <DropdownMenu :anchor="anchorEl" :config="menuConfig" @repositioned="onRepositioned">
      <div
        class="relative flex flex-col items-start w-max max-w-[16rem] sm:max-w-[21.5rem]
          text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
          bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3]
          [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]"
      >
        <div
          v-if="actualPlacement === 'bottom'"
          class="absolute left-1/2 -translate-x-1/2 -top-1.5 w-0 h-0
            border-l-[6px] border-r-[6px] border-b-[6px]
            border-l-transparent border-r-transparent border-b-[rgba(16,24,40,0.7)]"
        />
        <div
          v-else-if="actualPlacement === 'top'"
          class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0
            border-l-[6px] border-r-[6px] border-t-[6px]
            border-l-transparent border-r-transparent border-t-[rgba(16,24,40,0.7)]"
        />
        <div
          v-else-if="actualPlacement === 'right'"
          class="absolute top-1/2 -translate-y-1/2 -left-1.5 w-0 h-0
            border-t-[6px] border-b-[6px] border-r-[6px]
            border-t-transparent border-b-transparent border-r-[rgba(16,24,40,0.7)]"
        />
        <div
          v-else-if="actualPlacement === 'left'"
          class="absolute top-1/2 -translate-y-1/2 -right-1.5 w-0 h-0
            border-t-[6px] border-b-[6px] border-l-[6px]
            border-t-transparent border-b-transparent border-l-[rgba(16,24,40,0.7)]"
        />
        <slot />
      </div>
    </DropdownMenu>
  </span>
</template>

<script setup>
import { computed, ref, useSlots } from 'vue';
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  /** top | bottom | left | right — default top avoids horizontal overflow in narrow popups */
  placement: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
  width: {
    type: Number,
    default: 280,
  },
  /** Stretch trigger (e.g. full-width Delete Tier under settings overlay) */
  fullWidth: {
    type: Boolean,
    default: false,
  },
  /** Gap between trigger and bubble (px). TierCard uses a tight offset under the card. */
  offset: {
    type: Number,
    default: 12,
  },
  /** When false, keep requested placement (e.g. always under TierCard). */
  flipOnOverflow: {
    type: Boolean,
    default: true,
  },
});

const slots = useSlots();
const hasTriggerSlot = computed(() => !!slots.trigger);

const { url: tooltipIconUrl } = useAssetUrl('mediaUploader.icon.tooltip');

const anchorEl = ref(null);
const actualPlacement = ref(props.placement);

const menuConfig = computed(() => {
  const placement = props.placement;
  let positionMode = 'above';
  let tooltipPlacement;

  if (placement === 'bottom') positionMode = 'below';
  else if (placement === 'top') positionMode = 'above';
  else if (placement === 'left' || placement === 'right') {
    positionMode = 'adaptive';
    tooltipPlacement = placement;
  }

  return {
    trigger: 'hover',
    hoverIntentMs: 80,
    layer: 'tooltip',
    // generic = no shell bg; panel chrome lives on the inner bubble only
    // (tooltip-dark adds bg-gray-900 behind the bubble — double box)
    theme: 'generic',
    width: props.width,
    offset: props.offset,
    positionMode,
    ...(tooltipPlacement ? { tooltipPlacement, tooltipFallbackOrder: placement === 'left' ? ['right', 'top', 'bottom'] : ['left', 'top', 'bottom'] } : {}),
    align: 'center',
    flipOnOverflow: props.flipOnOverflow,
    ariaRole: 'tooltip',
    scrollEnabled: false,
    closeOnScroll: false,
    animation: 'fade',
    // Inline z-index required: Tailwind cannot generate dynamic z-[N] classes at runtime.
    // Must sit above AddTierPopup forceZIndex (22000) and its blur overlay (21999).
    zIndexBase: 30000,
    style: {
      class: 'bg-transparent shadow-none border-none p-0',
      inline: { zIndex: 30001, background: 'transparent' },
    },
  };
});

function onRepositioned(event) {
  if (event?.placement) {
    actualPlacement.value = event.placement;
  }
}
</script>
