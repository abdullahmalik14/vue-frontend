<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  link: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();
const { assets } = usePlanAssets();
const copied = ref(false);

const copyLink = async () => {
  if (!props.link) return;
  try {
    await navigator.clipboard.writeText(props.link);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    /* clipboard may be unavailable in some embeds */
  }
};
</script>

<template>
  <div
    data-component="plan-copy-invite-link"
    class="w-full h-10 flex gap-3.5 bg-white/75 border-b border-[#D0D5DD] rounded-t-sm
      shadow-[0px_1px_2px_0px_#1018280D] sm:h-12 dark:bg-[#181a1bbf]
      dark:border-[#3b4043] overflow-hidden"
  >
    <input
      type="text"
      :placeholder="t('plan.sharing.inviteLinkPlaceholder')"
      class="w-full text-base bg-transparent border-none outline-none truncate flex-1
        min-w-0 pl-3.5 text-[#101828] placeholder:text-[#667085]
        pointer-events-none dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]"
      :value="link"
      readonly
    />

    <button type="button" @click="copyLink" class="flex items-center gap-1 px-3.5 shrink-0 cursor-pointer">
      <img v-if="assets.copy" :src="assets.copy" :alt="t('plan.sharing.alt.copy')" class="w-5 h-5" />
      <span class="text-sm font-semibold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
        {{ copied ? t('plan.sharing.copied') : t('plan.sharing.copyLink') }}
      </span>
    </button>
  </div>
</template>
