<script setup>
/**
 * Plan settings list — hover overlay on TierCard (draft + published actions).
 * Disabled Publish/Delete tips: DropdownMenu anchored to the button (Figma).
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';

const props = defineProps({
  /** Controlled by tier card menu click (not hover). */
  open: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'draft',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  /** False → draft Publish disabled + tooltip */
  hasMedia: {
    type: Boolean,
    default: false,
  },
  /** False → draft Publish disabled (1 free / 3 paid slots full for this type) */
  canPublishSlot: {
    type: Boolean,
    default: true,
  },
  /** > 0 → published Delete disabled + tooltip */
  followers: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'edit',
  'publish',
  'add-media',
  'delete',
  'feature',
  'unfeature',
  'unpublish',
  'close',
]);

function runAction(name) {
  emit(name);
  emit('close');
}

const { t } = useI18n();
const { assets } = usePlanAssets();
const { url: unpublishIconUrl } = useAssetUrl('icon.media.menu.unpublish');
const { url: deleteIconUrl } = useAssetUrl('icon.media.menu.delete');
const { url: featureIconUrl } = useAssetUrl('orders.icon.stars');

const isDraft = computed(() => props.status === 'draft');
const isPublished = computed(() => props.status === 'published');
const canPublish = computed(() => props.hasMedia && props.canPublishSlot);
const canDelete = computed(() => Number(props.followers) <= 0);
const publishBlockedTip = computed(() =>
  !props.hasMedia
    ? t('plan.page.hover.cannotPublishNoMedia')
    : t('plan.page.hover.cannotPublishAtLimit'),
);
const publishLabel = computed(() =>
  canPublish.value
    ? t('plan.page.hover.publishTier')
    : t('plan.page.hover.publish'),
);

const publishAnchorRef = ref(null);
const publishTipPlacement = ref('bottom');

function onPublishTipRepositioned(event) {
  if (event?.placement) publishTipPlacement.value = event.placement;
}

/** DropdownMenu tooltip — anchored to the hovered button, centered below. */
const tierHoverTipConfig = {
  trigger: 'hover',
  hoverIntentMs: 80,
  layer: 'tooltip',
  theme: 'generic',
  width: 240,
  offset: 8,
  positionMode: 'below',
  align: 'center',
  flipOnOverflow: true,
  ariaRole: 'tooltip',
  scrollEnabled: false,
  closeOnScroll: false,
  animation: 'fade',
  zIndexBase: 30000,
  style: {
    class: 'bg-transparent shadow-none border-none p-0',
    inline: { zIndex: 30001, background: 'transparent' },
  },
};

/** Keep base flex wrappers; only force full width (removeClass wipes addClass). */
const wrapperOverrides = [
  { target: 'wrapper1', addClass: '!w-full' },
  { target: 'wrapper2', addClass: '!w-full' },
];
</script>

<template>
  <div
    data-component="tier-card-settings-hover"
    class="absolute inset-0 z-[25] flex flex-col transition-opacity duration-200"
    :class="
      open
        ? 'pointer-events-auto opacity-100'
        : 'pointer-events-none opacity-0'
    "
  >
    <!-- Figma overlay: black stops with mid opacity 0 -->
    <div
      class="absolute inset-0 rounded-[5px] backdrop-blur-[100px] bg-[linear-gradient(180deg,#000000_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,0)_65%,#000000_100%)]"
      aria-hidden="true"
    />
    <div class="absolute inset-0 rounded-[5px] bg-black/50 backdrop-blur-[2px]" aria-hidden="true" />

    <div class="relative z-[1] flex h-full flex-col px-3 pb-4 pt-10">
      <button
        type="button"
        class="mx-auto flex flex-1 flex-col items-center justify-center gap-2 outline-none"
        @click.stop="runAction('edit')"
      >
        <img
          :src="assets.editDetails || assets.pen"
          :alt="t('plan.page.hover.editDetails')"
          class="h-[34px] w-[34px] object-contain mix-blend-screen"
        />
        <span class="text-[20px] font-semibold leading-normal text-white">
          {{ t('plan.page.hover.editDetails') }}
        </span>
      </button>

      <div class="mt-auto flex w-full flex-col gap-2">
        <!-- DRAFT -->
        <template v-if="isDraft">
          <div
            v-if="!canPublish"
            ref="publishAnchorRef"
            class="w-full [&_[data-wrapper]]:!w-full"
          >
            <DashboardPrimaryButton
              :text="publishLabel"
              theme="tierHoverPublish"
              :leftIcon="assets.upload"
              :disabled="true"
              :wrapperOverrides="wrapperOverrides"
              type="button"
            />
            <DropdownMenu
              :anchor="publishAnchorRef"
              :config="tierHoverTipConfig"
              @repositioned="onPublishTipRepositioned"
            >
              <div
                class="relative flex w-max max-w-[15rem] flex-col items-start rounded-lg bg-[#101828B2] px-3 py-2 text-xs font-medium leading-normal text-white [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]"
              >
                <div
                  v-if="publishTipPlacement === 'bottom'"
                  class="absolute left-1/2 -top-1.5 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[rgba(16,24,40,0.7)]"
                  aria-hidden="true"
                />
                <div
                  v-else-if="publishTipPlacement === 'top'"
                  class="absolute left-1/2 -bottom-1.5 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[rgba(16,24,40,0.7)]"
                  aria-hidden="true"
                />
                {{ publishBlockedTip }}
              </div>
            </DropdownMenu>
          </div>
          <DashboardPrimaryButton
            v-else
            :text="publishLabel"
            theme="tierHoverPublish"
            :leftIcon="assets.upload"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('publish')"
          />

          <DashboardPrimaryButton
            v-if="!hasMedia"
            :text="t('plan.page.hover.addMedia')"
            theme="tierHoverAddMedia"
            :leftIcon="assets.plusGreenSquare || assets.plusSquare"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('add-media')"
          />

          <div class="w-full [&_[data-wrapper]]:!w-full [&_button]:!w-full">
            <DashboardPrimaryButton
              :text="t('plan.page.hover.deleteTier')"
              theme="tierHoverDelete"
              :leftIcon="deleteIconUrl || assets.trash"
              :wrapperOverrides="wrapperOverrides"
              type="button"
              @click.stop="runAction('delete')"
            />
          </div>
        </template>

        <!-- PUBLISHED -->
        <template v-else-if="isPublished">
          <DashboardPrimaryButton
            v-if="isFeatured"
            :text="t('plan.page.hover.removeFeatured')"
            theme="tierHoverUnfeature"
            :leftIcon="assets.minusSquare"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('unfeature')"
          />
          <DashboardPrimaryButton
            v-else
            :text="t('plan.page.hover.featureTier')"
            theme="tierHoverFeature"
            :leftIcon="featureIconUrl"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('feature')"
          />

          <DashboardPrimaryButton
            v-if="!hasMedia"
            :text="t('plan.page.hover.addMedia')"
            theme="tierHoverAddMedia"
            :leftIcon="assets.plusGreenSquare || assets.plusSquare"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('add-media')"
          />

          <DashboardPrimaryButton
            :text="t('plan.page.hover.unpublish')"
            theme="tierHoverUnpublish"
            :leftIcon="unpublishIconUrl || assets.upload"
            :wrapperOverrides="wrapperOverrides"
            type="button"
            @click.stop="runAction('unpublish')"
          />

          <div class="relative w-full [&_[data-wrapper]]:!w-full [&_button]:!w-full">
            <DashboardPrimaryButton
              :text="t('plan.page.hover.deleteTier')"
              theme="tierHoverDelete"
              :leftIcon="deleteIconUrl || assets.trash"
              :disabled="!canDelete"
              :wrapperOverrides="wrapperOverrides"
              type="button"
              @click.stop="runAction('delete')"
            />
            <!-- Disabled buttons don't emit click — overlay opens confirm when followers > 0 -->
            <button
              v-if="!canDelete"
              type="button"
              class="absolute inset-0 z-[1] cursor-pointer"
              :aria-label="t('plan.page.hover.deleteTier')"
              @click.stop="runAction('delete')"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
