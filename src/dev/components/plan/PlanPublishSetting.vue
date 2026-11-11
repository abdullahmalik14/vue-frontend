<template>
  <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
    <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] md:text-2xl dark:text-[#9e9689]" :text="t('plan.publish.title')" />

    <Paragraph theme="custom" no-wrap add-class="text-base text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.publish.description')" />

    <div class="flex flex-col gap-4">
      <div class="relative w-full h-10 sm:hidden">
        <div
          class="cursor-pointer group/dropdown"
          @click.stop="showMobileDropdown = !showMobileDropdown"
        >
          <div class="flex justify-center items-center gap-1.5 h-10 px-3.5 rounded-lg backdrop-blur-[25px] bg-[#0C111D] dark:bg-[#dbd8d3]">
            <img
              :src="currentIcon"
              alt=""
              class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]"
            />
            <span class="text-sm font-semibold text-white dark:text-[#e8e6e3]">
              {{ currentLabel }}
            </span>
            <img
              :src="assets.chevronDown"
              :alt="t('plan.publish.alt.chevron')"
              class="select-arrow w-5 h-5 transition-transform duration-300 ease-in-out transform"
              :class="showMobileDropdown ? 'rotate-180' : ''"
            />
          </div>

          <div
            v-if="showMobileDropdown"
            class="absolute w-full transition-all duration-300 z-10 top-[calc(100%+0.5rem)] shadow-none border-none"
          >
            <div class="p-1 rounded-lg bg-white/50 backdrop-blur-[12.5px] max-h-[200px] overflow-y-auto shadow-[0px_-2px_4px_0px_#0000001A] dark:bg-[#181a1b]/50">
              <div
                @click.stop="handleSubstep('publish-immediately')"
                class="dash-option flex justify-center items-center gap-2 px-2.5 h-10 rounded-md hover:bg-[#EAECF0] dark:hover:bg-[#222526]"
                :class="publishSettingSubstep === 'publish-immediately' ? 'hidden bg-[#EAECF0] dark:bg-[#222526]' : ''"
              >
                <img
                  :src="assets.upload"
                  :alt="t('plan.page.alt.upload')"
                  class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(23%)_sepia(18%)_saturate(885%)_hue-rotate(179deg)_brightness(92%)_contrast(91%)]"
                />
                <span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                  {{ t('plan.publish.immediately') }}
                </span>
              </div>

              <div
                @click.stop="handleSubstep('schedule-publish-time')"
                class="flex justify-center items-center gap-2 px-2.5 h-10 rounded-md hover:bg-[#EAECF0] dark:hover:bg-[#222526]"
                :class="publishSettingSubstep === 'schedule-publish-time' ? 'hidden bg-[#EAECF0] dark:bg-[#222526]' : ''"
              >
                <img
                  :src="assets.time"
                  :alt="t('plan.page.alt.time')"
                  class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(23%)_sepia(18%)_saturate(885%)_hue-rotate(179deg)_brightness(92%)_contrast(91%)]"
                />
                <span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                  {{ t('plan.publish.schedule') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <select class="dash-real-select hidden" name="dash-select" :value="publishSettingSubstep">
          <option :value="'schedule-publish-time'">{{ t('plan.publish.schedule') }}</option>
          <option :value="'publish-immediately'">{{ t('plan.publish.immediately') }}</option>
        </select>
      </div>

      <ul class="hidden sm:flex w-full h-10 whitespace-nowrap rounded-[0.3125rem] overflow-hidden border border-[#D0D5DD] bg-[#F9FAFB] dark:border-[#3b4043] dark:bg-[#1b1d1e]">
        <li
          @click="handleSubstep('publish-immediately')"
          class="flex flex-1 justify-center items-center gap-2 border-r border-[#D0D5DD] cursor-pointer group/tab dark:border-[#3b4043]"
          :class="publishSettingSubstep === 'publish-immediately' ? 'bg-[#0C111D] dark:bg-[#162036] active' : ''"
        >
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <img
              :src="assets.upload"
              :alt="t('plan.page.alt.upload')"
              class="w-5 h-5"
              :class="publishSettingSubstep === 'publish-immediately'
                ? '[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]'
                : '[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)]'"
            />
            <span
              class="text-sm font-medium whitespace-nowrap"
              :class="publishSettingSubstep === 'publish-immediately'
                ? 'text-white font-semibold'
                : 'text-[#98A2B3] dark:text-[#b0a99e]'"
            >
              {{ t('plan.publish.immediately') }}
            </span>
          </div>
        </li>

        <li
          @click="handleSubstep('schedule-publish-time')"
          class="flex flex-1 justify-center items-center gap-2 cursor-pointer group/tab"
          :class="publishSettingSubstep === 'schedule-publish-time' ? 'bg-[#0C111D] dark:bg-[#162036] active' : ''"
        >
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <img
              :src="assets.time"
              :alt="t('plan.page.alt.time')"
              class="w-5 h-5"
              :class="publishSettingSubstep === 'schedule-publish-time'
                ? '[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]'
                : '[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)]'"
            />
            <span
              class="text-sm font-medium whitespace-nowrap"
              :class="publishSettingSubstep === 'schedule-publish-time'
                ? 'text-white font-semibold'
                : 'text-[#98A2B3] dark:text-[#b0a99e]'"
            >
              {{ t('plan.publish.schedule') }}
            </span>
          </div>
        </li>
      </ul>

      <div v-if="publishSettingSubstep === 'publish-immediately'" class="flex flex-col gap-6">
        <Paragraph theme="custom" no-wrap add-class="text-base text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.publish.immediateHelp')" />
      </div>

      <div v-else-if="publishSettingSubstep === 'schedule-publish-time'" class="flex flex-col gap-6">
        <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-bold text-[#667085] dark:text-[#9e9689]" :text="t('plan.publish.scheduleHelp')" />

        <div class="flex flex-col gap-4">
          <!-- Publish Date (start only) -->
          <div class="flex flex-col gap-1.5">
            <Heading tag="h4" theme="custom" no-wrap add-class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]" :text="t('plan.publish.publishDate')" />
            <div
              ref="publishDateFieldRef"
              class="relative w-full"
              :class="openPicker === 'publish' ? 'z-30' : 'z-0'"
            >
              <div
                class="h-11 flex items-center bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                role="button"
                tabindex="0"
                @click="togglePicker('publish')"
                @keydown.enter.prevent="togglePicker('publish')"
                @keydown.space.prevent="togglePicker('publish')"
              >
                <div class="flex items-center gap-2 px-3 w-full min-w-0">
                  <img :src="assets.calendar01" :alt="t('plan.publish.alt.calendar')" class="w-5 h-5 shrink-0" />
                  <span
                    class="flex-1 min-w-0 truncate text-base"
                    :class="publishDateProxy
                      ? 'text-[#0C111D] dark:text-[#dbd8d3]'
                      : 'text-[#667085] dark:text-[#9e9689]'"
                  >
                    {{ publishDateProxy || t('plan.publish.datePlaceholder') }}
                  </span>
                </div>
              </div>
              <div
                v-if="openPicker === 'publish'"
                data-date-picker-panel
                class="relative mt-1 w-full z-30"
                @click.stop
              >
                <VueDatePicker
                  v-model="publishDateProxy"
                  :config="datePickerConfig"
                  class="w-full block"
                  @date-selected="openPicker = null"
                />
              </div>
            </div>
          </div>

          <!-- End Date (end only, optional) -->
          <div class="flex flex-col gap-1.5">
            <h4 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
              {{ t('plan.publish.endDate') }}
              <span class="text-xs leading-normal font-normal italic text-[#344054] dark:text-[#bdb8af]">
                {{ t('plan.publish.optional') }}
              </span>
            </h4>
            <div
              ref="endDateFieldRef"
              class="relative w-full"
              :class="openPicker === 'end' ? 'z-30' : 'z-0'"
            >
              <div
                class="h-11 flex items-center bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                role="button"
                tabindex="0"
                @click="togglePicker('end')"
                @keydown.enter.prevent="togglePicker('end')"
                @keydown.space.prevent="togglePicker('end')"
              >
                <div class="flex items-center gap-2 px-3 w-full min-w-0">
                  <img :src="assets.calendar01" :alt="t('plan.publish.alt.calendar')" class="w-5 h-5 shrink-0" />
                  <span
                    class="flex-1 min-w-0 truncate text-base"
                    :class="publishEndDateProxy
                      ? 'text-[#0C111D] dark:text-[#dbd8d3]'
                      : 'text-[#667085] dark:text-[#9e9689]'"
                  >
                    {{ publishEndDateProxy || t('plan.publish.datePlaceholder') }}
                  </span>
                </div>
              </div>
              <div
                v-if="openPicker === 'end'"
                data-date-picker-panel
                class="relative mt-1 w-full z-30"
                @click.stop
              >
                <VueDatePicker
                  v-model="publishEndDateProxy"
                  :config="datePickerConfig"
                  class="w-full block"
                  @date-selected="openPicker = null"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import VueDatePicker from '@/components/forms/date-picker/VueDatePicker.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  publishFlow: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();
const { assets } = usePlanAssets();
const showMobileDropdown = ref(false);
const openPicker = ref(null);
const publishDateFieldRef = ref(null);
const endDateFieldRef = ref(null);

const datePickerConfig = computed(() => ({
  mode: 'single',
  layout: 'single',
  enableTime: true,
  format: 'MM/DD/YYYY HH:mm:ss',
  alarmIcon: assets.value.alarm || '',
  style: {
    theme: 'pink',
    rounded: 'rounded-none',
    shadow: 'shadow-[0px_4px_20px_0px_rgba(0,0,0,0.10)]',
    border: 'border-0',
  },
}));

const publishSettingSubstep = computed({
  get: () => props.publishFlow.state.publishSettingSubstep,
  set: (val) => props.publishFlow.setState('publishSettingSubstep', val),
});

const publishDateProxy = computed({
  get: () => props.publishFlow.state.publishDate,
  set: (val) => props.publishFlow.setState('publishDate', val ?? ''),
});

const publishEndDateProxy = computed({
  get: () => props.publishFlow.state.publishEndDate,
  set: (val) => props.publishFlow.setState('publishEndDate', val ?? ''),
});

const currentLabel = computed(() =>
  publishSettingSubstep.value === 'schedule-publish-time'
    ? t('plan.publish.schedule')
    : t('plan.publish.immediately'),
);

const currentIcon = computed(() =>
  publishSettingSubstep.value === 'schedule-publish-time'
    ? assets.value.time
    : assets.value.upload,
);

function handleSubstep(val) {
  props.publishFlow.setState('publishSettingSubstep', val);
  showMobileDropdown.value = false;
  openPicker.value = null;
}

function fieldRefForPicker(key) {
  return key === 'end' ? endDateFieldRef.value : publishDateFieldRef.value;
}

async function togglePicker(key) {
  if (openPicker.value === key) {
    openPicker.value = null;
    return;
  }
  openPicker.value = key;
  await nextTick();
  const field = fieldRefForPicker(key);
  field?.scrollIntoView({ block: 'start', inline: 'nearest' });
  await nextTick();
  const panel = field?.querySelector('[data-date-picker-panel]');
  panel?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

</script>
