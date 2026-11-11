<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import MerchListingPopup from '@/dev/components/ui/popups/shops/MerchListingPopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: emptyCartUrl } = useAssetUrl('shops.icon.emptyCart');
const { url: newMerchPlusUrl } = useAssetUrl('plan.icon.newTierPlus');

const listingOpen = ref(false);

function onNewMerch() {
  listingOpen.value = true;
}
</script>

<template>
  <DashboardSharedTwoColLayout>
    <div
      data-component="shops-merch-page"
      class="relative flex min-h-screen flex-col"
    >
      <div class="relative z-[1] flex flex-1 flex-col px-5 py-6 md:px-10 md:py-8">
        <header class="relative z-[1] shrink-0">
          <Heading
            tag="h1"
            theme="custom"
            no-wrap
            add-class="text-[16px] font-normal leading-[24px] text-[#344054] md:text-[1.75rem] dark:text-[#bdb8af]"
            :text="t('shops.merch.title')"
          />
        </header>

        <div class="relative z-[1]  flex flex-1 flex-col items-center justify-center gap-2 py-16">
          <div class="p-2 h-[140px]">
            <img
              v-if="emptyCartUrl"
              :src="emptyCartUrl"
              :alt="t('shops.merch.alt.emptyCart')"
              class="h-[106px] w-[106px] object-contain"
            />
          </div>

          <Paragraph
            theme="custom"
            no-wrap
            add-class="text-center text-[16px] font-normal leading-5 text-[#344054] dark:text-[#98a2b3]"
            :text="t('shops.merch.emptyMessage')"
          />

          <DashboardPrimaryButton
            :text="t('shops.merch.newMerch')"
            variant="mediaBtn"
            :leftIcon="newMerchPlusUrl"
            leftIconClass="!w-[14px] !h-[14px] object-contain group-hover:brightness-0"
            textClass="!text-[18px] !font-medium !leading-normal"
            customClass="!min-w-0 !gap-1 !px-3 uppercase"
            type="button"
            @click="onNewMerch"
          />

          <button
            type="button"
            class="text-[16px] font-normal leading-5 text-[#344054] underline underline-offset-2 transition-colors hover:text-[#344054] dark:text-[#98a2b3] dark:hover:text-[#bdb8af]"
          >
            {{ t('shops.merch.faq') }}
          </button>
        </div>
      </div>
    </div>

    <MerchListingPopup v-model="listingOpen" />
  </DashboardSharedTwoColLayout>
</template>
