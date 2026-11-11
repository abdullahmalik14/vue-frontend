<template>
  <!-- Nested over SubscriptionTierPopup slide-in: shared BasePopup overlay stays under the slide-in. -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[21999] bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
    />
  </Teleport>

  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div class="w-full flex flex-col bg-[#FFFFFFBF] backdrop-blur-[100px]">
      <div class="p-4 flex flex-col gap-6">
        <!-- Header -->
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex justify-between items-center">
            <h2 class="text-lg font-semibold leading-7 text-[#0C111D] dark:text-[#9e9689]">
              {{ t('plan.luckyDraw.popup.title') }}
            </h2>
            <div
              class="cursor-pointer p-1"
              data-popup-close
              role="button"
              tabindex="0"
              :aria-label="t('plan.luckyDraw.popup.closeAlt')"
              @click="emit('update:modelValue', false)"
            >
              <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 1L1 17M1 1L17 17"
                  stroke="#98A2B3"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <p class="text-sm font-normal text-[#667085] dark:text-[#9e9689]">
            {{ t('plan.luckyDraw.popup.pendingDescription') }}
          </p>
        </div>

        <!-- Title -->
        <BaseInput
          type="text"
          v-model="eventTitle"
          :show-controls="false"
          :placeholder="t('plan.luckyDraw.popup.titlePlaceholder')"
          wrapperClass="w-full"
          :inputClass="planInputClass"
        />

        <!-- Description -->
        <BaseInput
          type="textarea"
          v-model="eventDescription"
          :rows="3"
          :placeholder="t('plan.luckyDraw.popup.descriptionPlaceholder')"
          wrapperClass="w-full"
          :inputClass="planTextareaClass"
        />

        <!-- Start and end date -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.luckyDraw.popup.dateRange') }}
          </h3>
          <div
            ref="eventDateFieldRef"
            class="relative w-full"
            :class="openPicker === 'event' ? 'z-30' : 'z-0'"
          >
            <div
              class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
              role="button"
              tabindex="0"
              @click="togglePicker('event')"
              @keydown.enter.prevent="togglePicker('event')"
              @keydown.space.prevent="togglePicker('event')"
            >
              <img
                v-if="assets.calendar"
                :src="assets.calendar"
                alt=""
                class="w-5 h-5 shrink-0"
              />
              <span
                class="flex-1 min-w-0 truncate text-base"
                :class="hasCompleteRange(dateRange)
                  ? 'text-[#101828] dark:text-[#d6d3cd]'
                  : 'text-[#667085] dark:text-[#9e9689]'"
              >
                {{ eventDateDisplay }}
              </span>
            </div>
            <div
              v-if="openPicker === 'event'"
              data-date-picker-panel
              class="relative mt-1 w-full z-30"
              @click.stop
            >
              <VueDatePicker
                v-model="dateRange"
                :config="datePickerConfig"
                class="w-full block"
                @range-selected="openPicker = null"
              />
            </div>
          </div>
        </div>

        <!-- Who can enter -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.luckyDraw.popup.whoCanEnter') }}
          </h3>
          <BasePlanDropdown v-model="whoCanEnter" :options="audienceOptions" widthClass="w-full" />
          <CheckboxGroup
            v-model="guaranteePrize"
            :label="t('plan.luckyDraw.popup.guaranteePrize')"
            :checkboxClass="checkboxClass"
            labelClass="text-sm font-normal text-[#0C111D] dark:text-[#dbd8d3]"
            wrapperClass="flex items-center gap-2"
          />
        </div>

        <!-- Spending requirement (same as SubscriptionPlanVariationsPopup) -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.luckyDraw.popup.spendingRequirement') }}
              </h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.luckyDraw.popup.spendingRequirementHelp') }}
            </p>
          </div>

          <DashboardPrimaryButton
            v-if="!showSpendingRequirement"
            :text="t('plan.luckyDraw.popup.addMinimumSpending')"
            variant="none"
            :leftIcon="assets.plusBlueSquare || assets.plusSquare"
            leftIconClass="w-5 h-5"
            customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1] uppercase"
            @click="openSpendingRequirement"
          />

          <div
            v-else
            class="w-full flex flex-col gap-4 p-4 rounded-[10px] bg-[#FFFFFF80]"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 min-w-0">
                <h4 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.variation.popup.minimumSpending') }}
                </h4>
                <span class="text-xs font-normal italic text-[#667085] dark:text-[#9e9689]">
                  {{ t('mediaUploader.addTier.optional') }}
                </span>
              </div>
              <DashboardPrimaryButton
                :text="t('plan.variation.popup.removeSpendingRequirement')"
                variant="none"
                customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#FF0066] dark:text-[#ff1a76] shrink-0"
                @click="removeSpendingRequirement"
              >
                <template #leftIcon>
                  <span
                    class="inline-block w-5 h-5 shrink-0 bg-[#FF0066] dark:bg-[#ff1a76]"
                    :style="minusMaskStyle"
                    aria-hidden="true"
                  />
                </template>
              </DashboardPrimaryButton>
            </div>

            <div class="flex w-full min-w-0">
              <div
                class="w-1/2 min-w-0 h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
              >
                <span class="text-base font-bold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
                  {{ t('mediaUploader.addTier.usd') }}
                </span>
                <BaseInput
                  type="number"
                  v-model="minSpendingAmount"
                  :show-controls="false"
                  wrapperClass="flex-1 min-w-0"
                  :inputClass="planInputInnerClass"
                  placeholder="1000"
                />
              </div>

              <div ref="spendingCategoryRef" class="relative w-1/2 min-w-0 h-11">
                <div
                  class="h-11 flex items-center justify-between w-full px-3.5 border-b border-b-[#EAECF0] rounded-t-sm bg-[#FFFFFFE5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer dark:border-b-[#353a3c]"
                  role="button"
                  tabindex="0"
                  @click.stop="toggleSpendingCategoryMenu"
                  @keydown.enter.prevent="toggleSpendingCategoryMenu"
                  @keydown.space.prevent="toggleSpendingCategoryMenu"
                >
                  <div class="flex flex-col min-w-0 truncate">
                    <span class="text-xs font-normal text-[#667085] dark:text-[#9e9689]">
                      {{ t('plan.variation.popup.spendingCategoryLabel') }}
                    </span>
                    <span
                      class="text-sm font-semibold truncate"
                      :class="spendingCategories.length
                        ? 'text-[#0c111d] dark:text-[#dbd8d3]'
                        : 'text-[#667085] dark:text-[#9e9689]'"
                    >
                      {{ spendingCategoryTriggerLabel }}
                    </span>
                  </div>
                  <div
                    class="select-arrow h-5 w-5 shrink-0 bg-[#98A2B3] transition-transform duration-300 ease-in-out"
                    :class="{ 'rotate-180': spendingCategoryOpen }"
                    :style="arrowsMaskStyle"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-1">
                <h4 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.variation.popup.spendingPeriod') }}
                </h4>
                <p class="text-sm font-normal text-[#475467] dark:text-[#b1aba0]">
                  {{ t('plan.variation.popup.spendingPeriodHelp') }}
                </p>
              </div>
              <div
                ref="spendingDateFieldRef"
                class="relative w-full"
                :class="openPicker === 'spending' ? 'z-30' : 'z-0'"
              >
                <div
                  class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                  role="button"
                  tabindex="0"
                  @click="togglePicker('spending')"
                  @keydown.enter.prevent="togglePicker('spending')"
                  @keydown.space.prevent="togglePicker('spending')"
                >
                  <img
                    v-if="assets.calendar"
                    :src="assets.calendar"
                    alt=""
                    class="w-5 h-5 shrink-0"
                  />
                  <span
                    class="flex-1 min-w-0 truncate text-base"
                    :class="hasCompleteRange(spendingPeriodRange)
                      ? 'text-[#101828] dark:text-[#d6d3cd]'
                      : 'text-[#667085] dark:text-[#9e9689]'"
                  >
                    {{ spendingPeriodDisplay }}
                  </span>
                </div>
                <div
                  v-if="openPicker === 'spending'"
                  data-date-picker-panel
                  class="relative mt-1 w-full z-30"
                  @click.stop
                >
                  <VueDatePicker
                    v-model="spendingPeriodRange"
                    :config="datePickerConfig"
                    class="w-full block"
                    @range-selected="openPicker = null"
                  />
                </div>
              </div>
            </div>

            <CheckboxGroup
              v-model="allowLifetimeSpending"
              :label="t('plan.variation.popup.allowLifetimeSpending')"
              :checkboxClass="checkboxClass"
              labelClass="text-sm font-normal text-[#0C111D] dark:text-[#dbd8d3]"
              wrapperClass="flex items-center gap-2"
            />
          </div>
        </div>

        <!-- Luck Draw prize -->
        <div class="flex flex-col gap-2">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1 min-w-0">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.luckyDraw.popup.prizeTitle') }}
              </h3>
              <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
                {{ t('plan.luckyDraw.popup.prizeHelp') }}
              </p>
            </div>
            <span
              v-if="prizes.length > 0"
              class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3] shrink-0 pt-1"
            >
              {{ t('plan.luckyDraw.popup.prizesLeft', { count: prizes.length, max: 5 }) }}
            </span>
          </div>

          <div
            v-if="prizes.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div
              v-for="prize in prizes"
              :key="prize.id"
              class="flex flex-col gap-3 p-3 rounded-[8px] bg-[#0C111D]"
            >
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-base font-semibold text-[#07F468] min-w-0 break-words">
                  {{ prize.prizeTitle }}
                </h4>
                <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#07F468] shrink-0">
                  <img
                    v-if="assets.token"
                    :src="assets.token"
                    alt=""
                    class="w-3.5 h-3.5"
                  />
                  <span class="text-xs font-semibold text-[#0C111D] whitespace-nowrap">
                    {{ prizeLeftLabel(prize) }}
                  </span>
                </div>
              </div>

              <p class="text-lg font-semibold text-white">
                {{ formatPrizePrice(prize) }}
              </p>

              <div class="flex items-end justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <img
                    v-if="assets.calendar01 || assets.calendar"
                    :src="assets.calendar01 || assets.calendar"
                    alt=""
                    class="w-4 h-4 shrink-0 brightness-0 invert"
                  />
                  <span class="text-sm font-normal text-white/80 truncate">
                    {{ formatPrizePeriod(prize) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    class="p-0.5 outline-none cursor-pointer"
                    :aria-label="t('plan.luckyDraw.edit')"
                    @click="editPrize(prize)"
                  >
                    <img
                      v-if="assets.pen"
                      :src="assets.pen"
                      alt=""
                      class="w-5 h-5 brightness-0 invert"
                    />
                  </button>
                  <button
                    type="button"
                    class="p-0.5 outline-none cursor-pointer"
                    :aria-label="t('plan.luckyDraw.remove')"
                    @click="removePrize(prize)"
                  >
                    <img
                      v-if="assets.trash"
                      :src="assets.trash"
                      alt=""
                      class="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DashboardPrimaryButton
            v-if="prizes.length < 5"
            :text="t('plan.luckyDraw.popup.addPrize')"
            variant="none"
            :leftIcon="assets.plusBlueSquare || assets.plusSquare"
            leftIconClass="w-5 h-5"
            customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1] uppercase"
            @click="openAddPrizePopup"
          />
        </div>

        <!-- Sharing Options -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.luckyDraw.popup.sharingOptions') }}
          </h3>
          <div class="flex items-center gap-2">
            <CheckboxSwitch
              v-model="postToX"
              :label="t('plan.luckyDraw.popup.postToX')"
              id="lucky-draw-post-to-x"
              theme="plan"
            />
            <BaseTooltip placement="top" :width="220">
              <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">
                {{ t('plan.luckyDraw.popup.postToXTooltip') }}
              </p>
            </BaseTooltip>
          </div>

          <SocialPostToXComposer
            v-if="postToX"
            v-model:post-message="postMessage"
            v-model:social-thumbnail-mode="socialThumbnailMode"
            :attach-media-options="attachMediaOptions"
            radio-name="lucky-draw-social-mode"
            :post-message-label="t('plan.luckyDraw.popup.postMessageLabel')"
            :post-message-placeholder="t('plan.luckyDraw.popup.postMessagePlaceholder')"
            :attach-media-label="t('plan.luckyDraw.popup.attachMedia')"
            :post-preview-label="t('plan.luckyDraw.popup.postPreview')"
            :characters-count-label="
              t('plan.luckyDraw.popup.charactersCount', { used: postMessageCharCount, max: 72 })
            "
            :preview-body="postPreviewMessage"
            :preview-link="t('plan.luckyDraw.popup.previewLink')"
            wrapper-class="mt-2"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="w-full flex flex-col gap-3 px-6 py-4">
        <div class="w-full flex items-center gap-4">
          <DashboardPrimaryButton
            :text="t('plan.luckyDraw.popup.cancel')"
            variant="none"
            customClass="!min-w-0 h-10 px-2 bg-transparent border-none outline-none text-base font-medium uppercase text-[#667085] dark:text-[#9e9689]"
            @click="emit('update:modelValue', false)"
          />
          <DashboardPrimaryButton
            :text="t('plan.luckyDraw.popup.createEvent')"
            variant="mediaBtn"
            :leftIcon="canCreate ? (assets.plusGreenSquare || assets.plusSquare) : (assets.plusGreySquare || assets.plusSquare)"
            :leftIconClass="canCreate ? 'w-5 h-5 brightness-0 group-hover:brightness-100' : 'w-5 h-5'"
            :disabled="!canCreate"
            customClass="!min-w-0 uppercase !bg-[#07F468] !text-black enabled:hover:!bg-black enabled:hover:!text-[#07F468] disabled:!bg-[#FFFFFF40] disabled:!text-[#98A2B3] disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-none"
            @click="onCreate"
          />
        </div>
        <p class="text-xs font-normal text-[#667085] dark:text-[#9e9689]">
          {{ t('plan.luckyDraw.popup.footerNote') }}
        </p>
      </div>
    </div>
  </BasePopup>

  <Teleport to="body">
    <div
      v-if="spendingCategoryOpen"
      ref="spendingCategoryMenuRef"
      data-base-popup-portaled
      class="fixed z-[22100] overflow-hidden max-w-[100vw] shadow-[0px_4px_16px_0px_rgba(16,24,40,0.10)]"
      :style="spendingCategoryMenuStyle"
      @click.stop
    >
      <div class="w-full rounded-[2px] bg-white border border-[#EAECF0] overflow-hidden dark:bg-[#181a1b] dark:border-[#353a3c]">
        <div class="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#EAECF0] dark:border-[#353a3c]">
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-normal text-[#667085] dark:text-[#9e9689]">
              {{ t('plan.variation.popup.spendingCategoryLabel') }}
            </span>
            <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3] truncate">
              {{ spendingCategoryTriggerLabel }}
            </span>
          </div>
          <div
            class="select-arrow h-4 w-4 shrink-0 bg-[#98A2B3] rotate-180"
            :style="arrowsMaskStyle"
            aria-hidden="true"
          />
        </div>

        <CheckboxGroup
          :modelValue="isAllSpendingCategoriesSelected"
          :label="t('plan.variation.popup.selectAll')"
          :checkboxClass="spendingCheckboxClass"
          wrapperClass="flex items-center w-full min-w-0 px-3.5 py-3 border-b border-[#EAECF0] bg-[#F2F4F7] cursor-pointer dark:bg-[#222526] dark:border-[#353a3c]"
          labelClass="order-1 flex-1 min-w-0 text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]"
          @update:modelValue="toggleAllSpendingCategories"
        />

        <CheckboxGroup
          v-for="option in spendingCategoryOptions"
          :key="option.value"
          :modelValue="spendingCategories.includes(option.value)"
          :label="option.label"
          :checkboxClass="spendingCheckboxClass"
          wrapperClass="flex items-center w-full min-w-0 px-3.5 py-3 border-b border-[#EAECF0] last:border-b-0 bg-white cursor-pointer hover:bg-[#F9FAFB] dark:bg-[#181a1b] dark:hover:bg-[#222526] dark:border-[#353a3c]"
          labelClass="order-1 flex-1 min-w-0 text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
          @update:modelValue="(checked) => toggleSpendingCategory(option.value, checked)"
        />
      </div>
    </div>
  </Teleport>

  <LuckyDrawAddPrizePopup
    v-model="showAddPrizePopup"
    :initial-values="prizeEditValues"
    @add="onPrizeAdded"
  />
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import BaseInput from '@/components/forms/inputs/BaseInput.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import VueDatePicker from '@/components/forms/date-picker/VueDatePicker.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import LuckyDrawAddPrizePopup from '@/dev/components/ui/popups/plan/LuckyDrawAddPrizePopup.vue';
import SocialPostToXComposer from '@/dev/components/ui/social/SocialPostToXComposer.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialValues: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'create',
]);

const { t } = useI18n();
const { assets } = usePlanAssets();

const eventTitle = ref('');
const eventDescription = ref('');
const dateRange = ref({ start: null, end: null });
const whoCanEnter = ref('everyone');
const guaranteePrize = ref(false);
const postToX = ref(false);
const postMessage = ref('');
const socialThumbnailMode = ref('none');
const prizes = ref([]);
const showAddPrizePopup = ref(false);
const prizeEditValues = ref(null);
const editingPrizeId = ref(null);

const showSpendingRequirement = ref(false);
const minSpendingAmount = ref('');
const spendingCategories = ref([]);
const spendingCategoryOpen = ref(false);
const spendingCategoryRef = ref(null);
const spendingCategoryMenuRef = ref(null);
const spendingCategoryMenuStyle = ref({});
const spendingPeriodRange = ref({ start: null, end: null });
const allowLifetimeSpending = ref(false);

const openPicker = ref(null);
const eventDateFieldRef = ref(null);
const spendingDateFieldRef = ref(null);

const planInputClass =
  'w-full h-11 flex px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const planInputInnerClass =
  'w-full h-full text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const planTextareaClass =
  'w-full min-h-[6.5rem] px-3.5 py-2.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const checkboxClass =
  "appearance-none border rounded-[4px] w-4 min-w-4 h-4 min-h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 box-border bg-white border-[#D0D5DD] checked:bg-[#07f468] checked:border-[#07f468] checked:accent-[#07f468] checked:[background-image:url('/dev/cdn/remote/plan-check.svg')] checked:[background-position:center] checked:[background-repeat:no-repeat] checked:[background-size:55%]";

const spendingCheckboxClass =
  "order-2 ml-auto appearance-none bg-white border border-[#D0D5DD] rounded-[4px] w-4 h-4 shrink-0 cursor-pointer checked:bg-black checked:border-black checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-[#07F468] checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border";

const datePickerConfig = computed(() => ({
  mode: 'range',
  layout: 'dual',
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

const audienceOptions = computed(() => [
  { label: t('plan.detail.audienceEveryone'), value: 'everyone' },
  { label: t('plan.detail.audienceInvited'), value: 'invited' },
]);

const attachMediaOptions = computed(() => [
  { value: 'none', label: t('plan.luckyDraw.popup.noMedia') },
  { value: 'useCustom', label: t('plan.luckyDraw.popup.uploadMedia') },
]);

const postMessageCharCount = computed(() => String(postMessage.value ?? '').length);

const postPreviewMessage = computed(() => {
  const msg = String(postMessage.value ?? '').trim();
  return msg || t('plan.luckyDraw.popup.previewBody');
});

const spendingCategoryOptions = computed(() => [
  { label: t('plan.variation.popup.spendingCategories.tips'), value: 'tips' },
  { label: t('plan.variation.popup.spendingCategories.subscriptions'), value: 'subscriptions' },
  { label: t('plan.variation.popup.spendingCategories.payToView'), value: 'payToView' },
  { label: t('plan.variation.popup.spendingCategories.merch'), value: 'merch' },
]);

const spendingCategoryTriggerLabel = computed(() => {
  const count = spendingCategories.value.length;
  if (!count) return t('plan.variation.popup.selectSpendingCategory');
  return t('plan.variation.popup.nSelected', { count });
});

const isAllSpendingCategoriesSelected = computed(() => {
  const opts = spendingCategoryOptions.value;
  return opts.length > 0 && opts.every((opt) => spendingCategories.value.includes(opt.value));
});

function emptyDateRange() {
  return { start: null, end: null };
}

function normalizeDateRange(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { start: value.start ?? null, end: value.end ?? null };
  }
  return emptyDateRange();
}

function hasCompleteRange(range) {
  return Boolean(range?.start && range?.end);
}

function formatDateRangeDisplay(range, emptyKey) {
  if (hasCompleteRange(range)) return `${range.start} - ${range.end}`;
  return t(emptyKey);
}

const eventDateDisplay = computed(() =>
  formatDateRangeDisplay(dateRange.value, 'plan.luckyDraw.popup.datePlaceholder'),
);
const spendingPeriodDisplay = computed(() =>
  formatDateRangeDisplay(spendingPeriodRange.value, 'plan.variation.popup.datePlaceholder'),
);

const canCreate = computed(() => String(eventTitle.value ?? '').trim().length > 0);

const popupConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'instant',
  offset: '0px',
  speed: '0ms',
  effect: 'ease-in-out',
  // Nested overlay Teleport above slide-in; BasePopup closes on outside click.
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  forceZIndex: 22000,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '720px', '<786': '100%' },
  // Mobile: 50vh from mid-screen = bottom half (same open look); panel scrolls via BasePopup.
  // Desktop: content height. Mobile: true full sheet (100% — 90vh + width 100% was half-sheet).
  height: { default: 'auto', '<786': '100%' },
  maxHeight: { default: '90vh', '<786': '100%' },
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
  customClass: 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]',
};


const arrowsMaskStyle = computed(() => ({
  maskImage: `url('${assets.value.arrowsMask}')`,
  webkitMaskImage: `url('${assets.value.arrowsMask}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const minusMaskStyle = computed(() => ({
  maskImage: `url('${assets.value.minusSquare}')`,
  webkitMaskImage: `url('${assets.value.minusSquare}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

function fieldRefForPicker(key) {
  return key === 'spending' ? spendingDateFieldRef.value : eventDateFieldRef.value;
}

async function togglePicker(key) {
  if (openPicker.value === key) {
    openPicker.value = null;
    return;
  }
  spendingCategoryOpen.value = false;
  openPicker.value = key;
  await nextTick();

  // Picker lives in normal flow inside the main popup — scroll host so it stays visible
  const field = fieldRefForPicker(key);
  field?.scrollIntoView({ block: 'start', inline: 'nearest' });
  await nextTick();
  const panel = field?.querySelector('[data-date-picker-panel]');
  panel?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function positionSpendingCategoryMenu() {
  const field = spendingCategoryRef.value;
  if (!field) return;

  const rect = field.getBoundingClientRect();
  const gap = 4;
  const pad = 8;

  const popupPanel =
    field.closest('[role="dialog"]') ||
    document.querySelector('[role="dialog"][aria-modal="true"]');
  const popupRect = popupPanel?.getBoundingClientRect();

  const minLeft = popupRect ? popupRect.left + pad : pad;
  const maxRight = popupRect ? popupRect.right - pad : window.innerWidth - pad;
  const maxWidth = Math.max(180, maxRight - minLeft);

  let width = Math.min(rect.width, maxWidth);
  let left = rect.left;

  if (left + width > maxRight) {
    left = Math.max(minLeft, maxRight - width);
  }
  if (left < minLeft) left = minLeft;
  if (left + width > maxRight) {
    width = maxRight - left;
  }

  const maxBottom = popupRect ? popupRect.bottom - pad : window.innerHeight - pad;
  const minTop = popupRect ? popupRect.top + pad : pad;
  const estimatedHeight = 280;
  let top = rect.bottom + gap;

  if (top + estimatedHeight > maxBottom) {
    const above = rect.top - gap - estimatedHeight;
    if (above >= minTop) {
      top = above;
    } else {
      top = Math.max(minTop, maxBottom - estimatedHeight);
    }
  }

  spendingCategoryMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxWidth: `${maxWidth}px`,
    maxHeight: `${Math.max(160, maxBottom - top)}px`,
    overflowY: 'auto',
    boxSizing: 'border-box',
  };
}

async function toggleSpendingCategoryMenu() {
  if (spendingCategoryOpen.value) {
    spendingCategoryOpen.value = false;
    return;
  }
  if (openPicker.value) openPicker.value = null;
  spendingCategoryOpen.value = true;
  await nextTick();
  positionSpendingCategoryMenu();
}

function toggleSpendingCategory(value, checked) {
  const next = new Set(spendingCategories.value);
  if (checked) next.add(value);
  else next.delete(value);
  spendingCategories.value = Array.from(next);
}

function toggleAllSpendingCategories(checked) {
  spendingCategories.value = checked
    ? spendingCategoryOptions.value.map((opt) => opt.value)
    : [];
}

function openSpendingRequirement() {
  showSpendingRequirement.value = true;
}

function resetSpendingRequirement() {
  showSpendingRequirement.value = false;
  minSpendingAmount.value = '';
  spendingCategories.value = [];
  spendingCategoryOpen.value = false;
  spendingPeriodRange.value = emptyDateRange();
  allowLifetimeSpending.value = false;
  if (openPicker.value === 'spending') openPicker.value = null;
}

function removeSpendingRequirement() {
  resetSpendingRequirement();
}

function handleWindowResize() {
  if (openPicker.value) openPicker.value = null;
  if (spendingCategoryOpen.value) positionSpendingCategoryMenu();
}

function handleScrollRepositionMenus() {
  if (spendingCategoryOpen.value) positionSpendingCategoryMenu();
}

function prizeLeftLabel(prize) {
  const n = String(prize.winnersCount ?? '0').trim() || '0';
  return t('plan.luckyDraw.popup.prizeQuotaLeft', { current: n, total: n });
}

function formatPrizePrice(prize) {
  const amount = String(prize.subscriptionPrice ?? '').trim();
  const price = amount === '' ? '0' : amount;
  const suffix =
    prize.pricePeriod === 'year'
      ? t('plan.luckyDraw.popup.pricePerYear')
      : prize.pricePeriod === 'day'
        ? t('plan.luckyDraw.popup.pricePerDay')
        : t('plan.luckyDraw.popup.pricePerMonth');
  return `${t('mediaUploader.addTier.usd')}${price}${suffix}`;
}

function formatPrizePeriod(prize) {
  if (prize.unlimitedTime) {
    return t('plan.luckyDraw.popup.lifetimeDiscount');
  }
  const cycles = String(prize.billingCycles ?? '').trim() || '1';
  const count = Number(cycles);
  return t('plan.luckyDraw.popup.discountForCycles', {
    count: Number.isNaN(count) ? cycles : count,
  });
}

function openAddPrizePopup() {
  if (prizes.value.length >= 5) return;
  editingPrizeId.value = null;
  prizeEditValues.value = null;
  showAddPrizePopup.value = true;
}

function editPrize(prize) {
  editingPrizeId.value = prize.id;
  prizeEditValues.value = { ...prize };
  showAddPrizePopup.value = true;
}

function removePrize(prize) {
  prizes.value = prizes.value.filter((p) => p.id !== prize.id);
}

function onPrizeAdded(prize) {
  if (editingPrizeId.value != null) {
    prizes.value = prizes.value.map((p) =>
      p.id === editingPrizeId.value ? { ...p, ...prize } : p,
    );
    editingPrizeId.value = null;
    prizeEditValues.value = null;
    return;
  }
  if (prizes.value.length >= 5) return;
  prizes.value.push({ ...prize, id: Date.now() });
}

function applyInitialValues(values) {
  openPicker.value = null;
  spendingCategoryOpen.value = false;
  showAddPrizePopup.value = false;
  editingPrizeId.value = null;
  prizeEditValues.value = null;
  if (!values) {
    eventTitle.value = '';
    eventDescription.value = '';
    dateRange.value = emptyDateRange();
    whoCanEnter.value = 'everyone';
    guaranteePrize.value = false;
    postToX.value = false;
    postMessage.value = '';
    socialThumbnailMode.value = 'none';
    prizes.value = [];
    resetSpendingRequirement();
    return;
  }
  eventTitle.value = values.eventTitle ?? values.title ?? '';
  eventDescription.value = values.eventDescription ?? values.description ?? '';
  dateRange.value = normalizeDateRange(values.dateRange);
  whoCanEnter.value = values.whoCanEnter ?? 'everyone';
  guaranteePrize.value = Boolean(values.guaranteePrize);
  postToX.value = Boolean(values.postToX);
  postMessage.value = values.postMessage ?? '';
  socialThumbnailMode.value = values.socialThumbnailMode ?? 'none';
  prizes.value = Array.isArray(values.prizes) ? [...values.prizes] : [];
  showSpendingRequirement.value = Boolean(values.showSpendingRequirement);
  minSpendingAmount.value = values.minSpendingAmount ?? '';
  const incomingCategories = values.spendingCategories ?? values.spendingCategory;
  if (Array.isArray(incomingCategories)) {
    spendingCategories.value = incomingCategories.filter(Boolean);
  } else if (incomingCategories) {
    spendingCategories.value = [incomingCategories];
  } else {
    spendingCategories.value = [];
  }
  spendingPeriodRange.value = normalizeDateRange(values.spendingPeriodRange ?? values.spendingPeriodDate);
  allowLifetimeSpending.value = Boolean(values.allowLifetimeSpending);
}

function onCreate() {
  if (!canCreate.value) return;
  emit('create', {
    eventTitle: eventTitle.value,
    eventDescription: eventDescription.value,
    dateRange: { ...dateRange.value },
    whoCanEnter: whoCanEnter.value,
    guaranteePrize: guaranteePrize.value,
    postToX: postToX.value,
    postMessage: postMessage.value,
    socialThumbnailMode: socialThumbnailMode.value,
    prizes: [...prizes.value],
    showSpendingRequirement: showSpendingRequirement.value,
    minSpendingAmount: minSpendingAmount.value,
    spendingCategories: [...spendingCategories.value],
    spendingPeriodRange: { ...spendingPeriodRange.value },
    allowLifetimeSpending: allowLifetimeSpending.value,
  });
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) applyInitialValues(props.initialValues);
    else {
      openPicker.value = null;
      spendingCategoryOpen.value = false;
      showAddPrizePopup.value = false;
      editingPrizeId.value = null;
      prizeEditValues.value = null;
    }
  },
);

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('scroll', handleScrollRepositionMenus, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('scroll', handleScrollRepositionMenus, true);
});
</script>
