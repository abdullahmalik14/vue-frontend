<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import Paragraph from '@/components/ui/typography/Paragraph.vue';

const summaryCount = 4;

const { t } = useI18n();
const { url: summaryCardUrl } = useAssetUrl('thankyou.summaryCard');
const { url: profileUrl } = useAssetUrl('checkout.demo.creatorAvatar');
const { url: verifiedUrl } = useAssetUrl('icon.media.verified');
</script>

<template>
  <ul class="flex flex-col gap-4 mb-10 lg:mb-0">
    <li v-for="n in summaryCount" :key="n" class="flex items-start gap-3">
      <img
        v-if="summaryCardUrl"
        :src="summaryCardUrl"
        alt=""
        class="h-[75px] w-[80px] shrink-0 object-cover"
      />
      <div class="flex min-w-0 flex-col gap-1">
        <Paragraph
          theme="custom"
          no-wrap
          class="text-[14px] font-medium leading-6 text-[#FFFFFF]"
          :text="t('thankYou.itemTitle')"
        />
        <div class="flex items-center gap-1.5">
          <img
            v-if="profileUrl"
            :src="profileUrl"
            alt=""
            class="h-4 w-4 shrink-0 rounded-full object-cover"
          />
          <span class="text-[10px] font-medium text-[#F2F4F7]">{{ t('thankYou.seller') }}</span>
          <img
            v-if="verifiedUrl"
            :src="verifiedUrl"
            alt=""
            class="h-3 w-3 shrink-0"
          />
        </div>
        <div>
          <Paragraph
            theme="custom"
            no-wrap
            class="inline text-[16px] font-semibold leading-6 text-[#07F468]"
            :text="t('thankYou.price')"
          />
          <Paragraph
            theme="custom"
            no-wrap
            class="ml-1 inline text-[10px] font-normal leading-6 text-[#FFFFFF]"
            :text="t('thankYou.shipping')"
          />
        </div>
      </div>
    </li>
  </ul>
</template>
