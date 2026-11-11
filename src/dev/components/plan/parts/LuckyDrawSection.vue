<script setup>
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

defineProps({
  draws: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['create', 'edit', 'remove']);

const { t } = useI18n();
const { assets } = usePlanAssets();
</script>

<template>
  <div
    v-if="draws && draws.length > 0"
    class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:p-4 dark:bg-[#181a1b40]"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-1">
        <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.luckyDraw.title')" />
        <span class="text-xs leading-normal font-medium italic text-[#0C111D] dark:text-[#dbd8d3]">
          {{ t('mediaUploader.addTier.optional') }}
        </span>
      </div>
      <Paragraph theme="custom" no-wrap add-class="text-base text-[#344054] dark:text-[#bdb8af]" :text="t('plan.luckyDraw.descriptionFilled')" />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex gap-1 h-[1.875rem]">
        <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold align-middle text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('plan.luckyDraw.activeTitle')" />
        <span class="text-[0.6em] leading-normal font-semibold align-super text-[#0C111D] dark:text-[#dbd8d3]">
          {{ draws.length }}
        </span>
      </div>

      <div
        v-for="(draw, index) in draws"
        :key="draw.id || index"
        class="rounded-[.3125rem] border border-transparent [background:linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.6))_padding-box,linear-gradient(90deg,rgba(180,84,211,0.1),rgba(254,127,54,0.1),rgba(254,212,47,0.1),rgba(38,201,201,0.1),rgba(41,114,218,0.1))_border-box,linear-gradient(90deg,#B454D3,#FE7F36,#FED42F,#26C9C9,#2972DA)_border-box]"
      >
        <div class="flex flex-col gap-4 p-3 rounded bg-white/50 sm:p-4 md:gap-3">
          <!-- Mobile (<sm): prizes drop below cat+meta at full width. sm+: prizes sit under meta beside cat. -->
          <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-3 sm:items-start md:gap-x-4">
            <img :src="assets.moneyCat" alt="" class="w-32 h-32 shrink-0 sm:row-span-2" />

            <div data-lucky-draw-info-wrapper class="flex min-w-0 flex-col gap-2 sm:gap-3">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.luckyDraw.title')" />

              <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
                <div class="flex items-center gap-1">
                  <img :src="assets.logoBg" alt="" class="w-4 h-4" />
                  <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.audience }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <img :src="assets.calendar01" alt="" class="w-4 h-4" />
                  <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.dateRange }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <img :src="assets.dollar01" alt="" class="w-4 h-4" />
                  <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.minSpending }}</span>
                </div>
              </div>
            </div>

            <div class="col-span-2 flex w-full flex-col gap-1 sm:col-span-1">
              <div
                v-for="(item, i) in draw.items"
                :key="i"
                class="flex items-center w-full h-9 rounded-[3.125rem] overflow-hidden"
              >
                <div class="h-full flex items-center gap-1 px-3 py-[0.0625rem] grow min-w-0 bg-[#0C111D] dark:bg-[#dbd8d3]">
                  <span class="text-base font-semibold text-[#07F468] dark:text-[#06c454] truncate">{{ item.label }}</span>
                </div>

                <div
                  class="h-9 flex justify-center items-center gap-1 px-2 py-[0.0625rem] shrink-0 bg-[#07F468] dark:bg-[#06c454]"
                >
                  <div class="flex justify-center items-center h-5">
                    <img :src="assets.token" alt="" class="w-4 h-4" />
                  </div>
                  <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3] whitespace-nowrap">{{ item.tokens }}</span>
                </div>
              </div>
            </div>
          </div>

          <div data-lucky-draw-bottom-section class="flex flex-col gap-3">
            <div class="flex justify-end items-center gap-4 sm:grow">
              <DashboardPrimaryButton
                :text="t('plan.luckyDraw.edit')"
                variant="none"
                :leftIcon="assets.pen"
                leftIconClass="w-5 h-5"
                customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]"
                @click="$emit('edit', draw)"
              />

              <DashboardPrimaryButton
                :text="t('plan.luckyDraw.remove')"
                variant="none"
                :leftIcon="assets.trash"
                leftIconClass="w-5 h-5"
                customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]"
                @click="$emit('remove', draw)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:p-4 md:gap-6 dark:bg-[#181a1b40]">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1">
        <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.luckyDraw.title')" />
        <span class="text-xs leading-normal font-medium italic text-[#344054] dark:text-[#bdb8af]">
          {{ t('mediaUploader.addTier.optional') }}
        </span>
      </div>

      <Paragraph theme="custom" no-wrap add-class="text-sm text-[#344054] dark:text-[#bdb8af]" :text="t('plan.luckyDraw.descriptionEmpty')" />
    </div>

    <div
      class="rounded-[.3125rem] border border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,rgba(180,84,211,0.5)_0%,rgba(254,127,54,0.5)_20.67%,rgba(254,212,47,0.5)_48.56%,rgba(38,201,201,0.5)_73.08%,rgba(41,114,218,0.5)_100%)_border-box]"
    >
      <div class="flex items-center gap-4 p-4 rounded-[5px] bg-white/50">
        <img :src="assets.moneyCat" alt="" class="w-32 h-32" />

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <Heading tag="h3" theme="custom" no-wrap add-class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.luckyDraw.title')" />
            <Paragraph theme="custom" no-wrap add-class="text-sm text-[#667085] dark:text-[#9e9689]" :text="t('plan.luckyDraw.descriptionPlaceholder')" />
          </div>

          <DashboardPrimaryButton
            :text="t('plan.luckyDraw.createEvent')"
            variant="none"
            :leftIcon="assets.plusBlueSquare || assets.plusSquare"
            leftIconClass="w-5 h-5"
            customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]"
            @click="$emit('create')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
