<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CatalogSearchSelect from '@/dev/components/ui/search/CatalogSearchSelect.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  results: {
    type: Array,
    default: () => [],
  },
  maxItems: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(['update:modelValue', 'send']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const invitedProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<template>
  <div data-component="plan-invite-fans-bar" class="flex items-end w-full">
    <CatalogSearchSelect
      :subtitle="t('plan.sharing.inviteListSubtitle')"
      :placeholder="t('plan.sharing.searchFanPlaceholder')"
      type="performer"
      :results="results"
      v-model="invitedProxy"
      :max-items="maxItems"
      parentClass="w-full"
      searchWrapperClass="bg-white/75 dark:bg-[#181a1b]/75"
      inputClass="h-7"
      subTitleClass="text-[#0C111D] dark:text-[#dbd8d3] text-base font-medium"
    />
    <DashboardPrimaryButton
      :text="t('plan.sharing.sendInvite')"
      variant="simpleBtn"
      type="button"
      :leftIcon="assets.send"
      leftIconClass="w-6 h-6 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(74%)_sepia(36%)_saturate(5644%)_hue-rotate(95deg)_brightness(111%)_contrast(94%)]"
      btnBg="#07f468"
      btnHoverBg="black"
      btnText="black"
      btnHoverText="#07f468"
      @click="emit('send')"
    />
  </div>
</template>
