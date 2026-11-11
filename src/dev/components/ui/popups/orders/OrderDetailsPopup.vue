<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue'
import CustomDropdown from '@/components/ui/dropdowns/CustomDropdown.vue'
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue'
import CancelUploadPopup from '@/components/ui/popups/CancelUploadPopup.vue'
import { createDashboardSidebarSlideInConfig } from '@/systems/dashboard/createDashboardSidebarSlideInConfig.js'
import { useOrdersAssets } from '@/dev/composables/useOrdersAssets.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const { assets } = useOrdersAssets()

const showAddTracking = ref(false)
const activeTab = ref('upload-screenshot')
const courierData = ref('')
const trackingNumber = ref('')
const isShippingDetailsAdded = ref(false)
const shippingMethod = ref('')
const showNotification = ref(false)

const fanHandle = computed(() => t('dashboard.orders.popup.mock.fanHandle'))

const courierOptions = computed(() =>
  ['dhl', 'fedex', 'ups'].map((value) => ({
    value,
    label: t(`dashboard.orders.popup.couriers.${value}`),
  })),
)

const handleUpdateDetails = () => {
  if (activeTab.value === 'upload-screenshot' && !uploader.state.thumbnailUrl) return
  if (activeTab.value === 'enter-input' && (!courierData.value || !trackingNumber.value)) return

  isShippingDetailsAdded.value = true
  shippingMethod.value =
    activeTab.value === 'upload-screenshot' ? 'screenshot' : 'manual'
  showAddTracking.value = false
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 4000)
}

const handleEditShippingDetails = () => {
  isShippingDetailsAdded.value = false
  showAddTracking.value = true
}

const uploader = reactive({
  state: {
    uploadedThumbnailFile: null,
    thumbnailUrl: null,
  },
  setState(key, value) {
    this.state[key] = value
  },
})

const deleteImage = () => {
  uploader.state.thumbnailUrl = null
  uploader.state.uploadedThumbnailFile = null
}

const cancelUploadPopupOpen = ref(false)
const confirmAction = ref('')
const cancelUploadMessage = ref('')

const handlePopupConfirm = () => {
  if (confirmAction.value === 'delete') {
    deleteImage()
  } else if (confirmAction.value === 'leave') {
    deleteImage()
    showAddTracking.value = false
  }
}

const triggerDeletePopup = () => {
  confirmAction.value = 'delete'
  cancelUploadMessage.value = t('dashboard.orders.popup.cancelUpload.deleteScreenshot')
  cancelUploadPopupOpen.value = true
}

const triggerLeavePopup = () => {
  if (uploader.state.thumbnailUrl) {
    confirmAction.value = 'leave'
    cancelUploadMessage.value = t('dashboard.orders.popup.cancelUpload.leaveWithoutSaving')
    cancelUploadPopupOpen.value = true
  } else {
    showAddTracking.value = false
  }
}

function handleScreenshotSelected({ objectUrl, file }) {
  uploader.state.thumbnailUrl = objectUrl
  uploader.state.uploadedThumbnailFile = file
}

const popupConfig = createDashboardSidebarSlideInConfig({
  from: 'right',
  offset: '0px',
  width: { default: '30rem', '<768': '100%' },
  height: '100%',
  scrollable: true,
  shouldShowOverlay: false,
  shouldLockBodyScroll: false,
  containerClass: 'flex flex-col min-h-full h-full',
})
</script>

<template>
  <BasePopup
    :model-value="modelValue"
    :popup-config="popupConfig"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div id="orderDetailsContent" class="relative flex flex-col min-h-screen h-full w-full bg-[#F9FAFB]/90 dark:bg-[#1b1d1e]/90 font-sans">
      <div class="flex border-b border-[#D0D5DD] dark:border-[#3b4043] sticky top-0 z-10 bg-inherit backdrop-blur-md">
        <div class="flex justify-center items-center w-14 h-14 bg-black dark:bg-[#181a1b] shrink-0">
          <img
            v-if="assets.merch"
            :src="assets.merch"
            :alt="t('dashboard.orders.popup.merchAlt')"
            class="w-9 h-9"
          />
        </div>

        <div class="flex gap-1 p-2 grow">
          <div class="flex flex-col gap-1 grow">
            <h3 class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">
              {{ t('dashboard.orders.popup.orderTitle', { orderNum: order?.orderNum || '' }) }}
            </h3>
            <p class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
              {{ t('dashboard.orders.popup.receivedOn', { date: order?.date || '' }) }}
            </p>
          </div>

          <button
            class="flex justify-center items-center w-6 h-6 bg-transparent outline-none border-none cursor-pointer"
            @click="emit('update:modelValue', false)"
          >
            <img
              v-if="assets.close"
              :src="assets.close"
              :alt="t('dashboard.orders.popup.closeAlt')"
              class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(71%)_sepia(12%)_saturate(384%)_hue-rotate(179deg)_brightness(90%)_contrast(83%)]"
            />
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex flex-1 flex-col justify-center items-center min-h-[calc(100vh-3.5rem)] w-full py-20">
        <LoadingSpinner size="3xl" />
      </div>

      <div v-else class="flex flex-col flex-1 min-h-0 w-full">
        <section
          v-if="!showAddTracking && !isShippingDetailsAdded"
          class="flex flex-col gap-2 p-2 bg-[#07F468] md:p-4 dark:bg-[#06c454]"
        >
          <h2 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('dashboard.orders.popup.pendingShipping.title') }}
          </h2>
          <p class="text-sm text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('dashboard.orders.popup.pendingShipping.description') }}
          </p>
          <button
            class="flex justify-center items-center gap-2.5 px-2 py-1 bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]"
            @click="showAddTracking = true"
          >
            <img
              v-if="assets.location"
              :src="assets.location"
              :alt="t('dashboard.orders.popup.locationAlt')"
              class="w-5 h-5 group-hover/button:[filter:brightness(0)]"
            />
            <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">
              {{ t('dashboard.orders.popup.pendingShipping.addTracking') }}
            </span>
          </button>
        </section>

        <div
          v-else-if="showAddTracking && !isShippingDetailsAdded"
          class="flex flex-col gap-4 px-2 py-4 border-b border-[#D0D5DD] bg-[#EAECF0] md:p-4 dark:border-[#3b4043] dark:bg-[#222526]"
        >
          <div class="flex justify-between items-center gap-2">
            <span class="text-lg leading-normal font-semibold tracking-[0.01125rem] text-[#303437] dark:text-[#b1aba0]">
              {{ t('dashboard.orders.popup.tracking.title') }}
            </span>
            <img
              v-if="assets.close"
              :src="assets.close"
              :alt="t('dashboard.orders.popup.closeAlt')"
              class="w-6 h-6 cursor-pointer [filter:brightness(0)_saturate(100%)_invert(71%)_sepia(12%)_saturate(384%)_hue-rotate(179deg)_brightness(90%)_contrast(83%)]"
              @click="triggerLeavePopup"
            >
          </div>

          <div class="flex flex-col gap-4">
            <ul
              v-if="!uploader.state.thumbnailUrl"
              class="flex w-full whitespace-nowrap rounded-[0.3125rem] overflow-hidden border border-[#D0D5DD] bg-[#F9FAFB] dark:border-[#3b4043] dark:bg-[#1b1d1e]"
            >
              <li
                :class="{ active: activeTab === 'upload-screenshot' }"
                class="flex flex-1 justify-center items-center gap-2 border-r border-[#D0D5DD] cursor-pointer group/tab [&.active]:bg-[#0C111D] md:min-h-[2.5rem] dark:border-[#3b4043] dark:[&.active]:bg-[#162036]"
                @click="activeTab = 'upload-screenshot'"
              >
                <div class="w-full flex justify-center items-center gap-1 p-2 md:gap-2">
                  <img
                    v-if="assets.upload"
                    :src="assets.upload"
                    :alt="t('dashboard.orders.popup.uploadAlt')"
                    class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)] group-[.active]/tab:[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)] md:w-5 md:h-5"
                  >
                  <span class="text-xs leading-normal font-medium text-[#98A2B3] whitespace-nowrap group-[.active]/tab:text-white group-[.active]/tab:font-semibold md:text-sm dark:text-[#b0a99e] dark:group-[.active]/tab:text-[#e8e6e3]">
                    {{ t('dashboard.orders.popup.tracking.uploadScreenshot') }}
                  </span>
                </div>
              </li>

              <li
                :class="{ active: activeTab === 'enter-input' }"
                class="flex flex-1 justify-center items-center gap-2 cursor-pointer group/tab [&.active]:bg-[#0C111D] md:min-h-[2.5rem] dark:border-[#3b4043] dark:[&.active]:bg-[#162036]"
                @click="activeTab = 'enter-input'"
              >
                <div class="w-full flex justify-center items-center gap-1 p-2 md:gap-2">
                  <img
                    v-if="assets.enterInput"
                    :src="assets.enterInput"
                    :alt="t('dashboard.orders.popup.enterInputAlt')"
                    class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)] group-[.active]/tab:[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)] md:w-5 md:h-5"
                  >
                  <span class="text-xs leading-normal font-medium text-[#98A2B3] whitespace-nowrap group-[.active]/tab:text-white group-[.active]/tab:font-semibold md:text-sm dark:text-[#b0a99e] dark:group-[.active]/tab:text-[#e8e6e3]">
                    {{ t('dashboard.orders.popup.tracking.enterManually') }}
                  </span>
                </div>
              </li>
            </ul>

            <div class="flex flex-col gap-4">
              <div v-if="activeTab === 'upload-screenshot'" class="flex">
                <ThumbnailUploader
                  v-if="!uploader.state.thumbnailUrl"
                  :use-media-store="false"
                  :show-selected-name="false"
                  icon-variant="badge"
                  :title="t('dashboard.orders.popup.tracking.uploadTitle')"
                  :subtitle="t('dashboard.orders.popup.tracking.uploadSubtitle')"
                  :file-info="t('dashboard.orders.popup.tracking.uploadFileInfo')"
                  wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative"
                  inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
                  full-area-click
                  @file-selected="handleScreenshotSelected"
                />

                <div v-else class="w-full h-[11.875rem] rounded-[0.3125rem] relative shadow-[0px_0px_2px_0px_#00000040] overflow-hidden">
                  <img
                    :src="uploader.state.thumbnailUrl"
                    :alt="t('dashboard.orders.popup.uploadedImageAlt')"
                    class="w-full h-full object-cover"
                  >
                  <div
                    class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e] dark:bg-[#c93300] dark:hover:bg-[#b03200]"
                    @click="triggerDeletePopup"
                  >
                    <img
                      v-if="assets.trash"
                      :src="assets.trash"
                      :alt="t('dashboard.orders.popup.trashAlt')"
                      class="w-5 h-5 [filter:brightness(100)_saturate(0)]"
                    />
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'enter-input'" class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                  <span class="text-sm font-medium text-[#667085] dark:text-[#655e53]">
                    {{ t('dashboard.orders.popup.tracking.courierLabel') }}
                  </span>
                  <div class="relative w-full h-10">
                    <CustomDropdown
                      v-model="courierData"
                      :options="courierOptions"
                      :placeholder="t('dashboard.orders.popup.tracking.courierPlaceholder')"
                      button-class="h-10 flex justify-between items-center gap-2 px-3 bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#3b4043] w-full"
                      dropdown-class="absolute right-0 w-full transition-all duration-300 z-10 top-[calc(100%+0.5rem)] shadow-none border-none bg-white/70 backdrop-blur-[25px] rounded-[2px] max-h-[245px] overflow-y-auto dark:bg-[#181a1bb3]"
                    >
                      <template #trigger="{ selected }">
                        <span
                          class="text-sm leading-normal font-medium capitalize tracking-[0.01875rem] whitespace-nowrap"
                          :class="selected ? 'text-[#101828] dark:text-[#d6d3cd]' : 'text-[#667085] dark:text-[#655e53]'"
                        >
                          {{ courierOptions.find((o) => o.value === selected)?.label || t('dashboard.orders.popup.tracking.courierPlaceholder') }}
                        </span>
                      </template>
                      <template #option="{ option, isSelected }">
                        <div
                          class="flex items-center gap-2 h-12 px-3 border-b border-[#EAECF0] cursor-pointer hover:bg-white dark:hover:bg-[#181a1b] dark:border-[#353a3c]"
                          :class="{ 'bg-white dark:bg-[#181a1b]': isSelected }"
                        >
                          <span
                            class="text-sm font-medium"
                            :class="isSelected ? 'text-[#101828] dark:text-[#d6d3cd]' : 'text-[#667085] dark:text-[#655e53]'"
                          >
                            {{ option.label }}
                          </span>
                        </div>
                      </template>
                    </CustomDropdown>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="text-sm font-medium text-[#667085] dark:text-[#655e53]">
                    {{ t('dashboard.orders.popup.tracking.trackingNumberLabel') }}
                  </span>
                  <div class="w-full h-10 flex items-center gap-2 px-3 bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                    <input
                      v-model="trackingNumber"
                      type="text"
                      placeholder=""
                      class="text-base bg-transparent border-none outline-none w-full min-w-0 text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="uploader.state.thumbnailUrl || activeTab === 'enter-input'"
              class="flex flex-col gap-4 text-center mt-2"
            >
              <button
                class="flex justify-center items-center w-full h-10 px-6 bg-[#07F468] group/button hover:bg-[#0c111d] dark:bg-[#0aff78] dark:hover:bg-[#162036]"
                @click="handleUpdateDetails"
              >
                <span class="text-base font-medium text-[#0c111d] group-hover/button:text-[#07F468] dark:text-[#dbd8d3] dark:group-hover/button:text-[#23f97b]">
                  {{ t('dashboard.orders.popup.tracking.updateDetail') }}
                </span>
              </button>
              <p class="text-sm leading-6 text-[#5F6369] dark:text-[#a9a296]">
                {{ t('dashboard.orders.popup.tracking.shareInfo', { fanHandle: fanHandle }) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 px-2 py-4 md:px-4 md:py-6">
          <div class="flex items-start gap-2">
            <img v-if="assets.users" :src="assets.users" :alt="t('dashboard.orders.popup.usersAlt')" class="w-4 h-4" />
            <div class="flex flex-col gap-1">
              <span class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
                {{ t('dashboard.orders.popup.details.from') }}
              </span>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 self-stretch">
                  <img
                    v-if="assets.avatar"
                    :src="assets.avatar"
                    :alt="t('dashboard.orders.popup.usersAlt')"
                    class="w-5 h-5 rounded-full"
                  />
                  <span class="text-sm text-[#344054] dark:text-[#bdb7af]">{{ '@' }}{{ fanHandle }}</span>
                </div>
                <span class="text-xs leading-normal text-[#98A2B3] dark:text-[#b0a993]">
                  {{ t('dashboard.orders.popup.mock.fanEmail') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <img v-if="assets.locationPin" :src="assets.locationPin" :alt="t('dashboard.orders.popup.locationPinAlt')" class="w-4 h-4" />
            <div class="flex flex-col gap-1">
              <span class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
                {{ t('dashboard.orders.popup.details.shipTo') }}
              </span>
              <p class="text-sm text-black dark:text-[#e8e6e3]">
                {{ t('dashboard.orders.popup.mock.shipToAddress') }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <img v-if="assets.filesGreen" :src="assets.filesGreen" :alt="t('dashboard.orders.popup.filesAlt')" class="w-4 h-4" />
            <div class="flex flex-col gap-1 grow">
              <span class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
                {{ t('dashboard.orders.popup.details.notesFromBuyer') }}
              </span>
              <p class="text-sm text-black dark:text-[#e8e6e3]">
                {{ t('dashboard.orders.popup.mock.buyerNotes') }}
              </p>
            </div>
          </div>

          <div v-if="isShippingDetailsAdded && shippingMethod === 'screenshot'" class="flex items-start gap-2">
            <img v-if="assets.filesGreen" :src="assets.filesGreen" :alt="t('dashboard.orders.popup.filesAlt')" class="w-4 h-4">
            <div class="flex flex-col gap-1 grow">
              <span class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
                {{ t('dashboard.orders.popup.details.shippingInformation') }}
              </span>
              <div class="w-full h-[11.875rem] rounded-[0.3125rem] relative shadow-[0px_0px_2px_0px_#00000040] overflow-hidden">
                <img
                  :src="uploader.state.thumbnailUrl"
                  :alt="t('dashboard.orders.popup.uploadedImageAlt')"
                  class="w-full h-full object-cover"
                >
                <div
                  class="flex justify-center items-center gap-2.5 absolute top-0 right-0 z-[3] w-max px-2 py-1 group/button cursor-pointer bg-black hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]"
                  @click="handleEditShippingDetails"
                >
                  <img
                    v-if="assets.editPen"
                    :src="assets.editPen"
                    :alt="t('dashboard.orders.popup.editPenAlt')"
                    class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(77%)_sepia(44%)_saturate(5180%)_hue-rotate(94deg)_brightness(110%)_contrast(95%)] group-hover/button:[filter:brightness(0)]"
                  >
                  <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23597b] dark:group-hover/button:text-[#e8e6e3]">
                    {{ t('dashboard.orders.popup.details.edit') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isShippingDetailsAdded && shippingMethod === 'manual'" class="flex items-start gap-1">
            <img v-if="assets.filesGreen" :src="assets.filesGreen" :alt="t('dashboard.orders.popup.filesAlt')" class="w-4 h-4">
            <div class="flex flex-col gap-1 grow">
              <span class="text-xs leading-normal text-[#667085] dark:text-[#655e53]">
                {{ t('dashboard.orders.popup.details.shippingInformation') }}
              </span>
              <div class="w-full flex items-end gap-2">
                <div class="flex flex-col gap-1 flex-1">
                  <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">
                    {{ t('dashboard.orders.popup.details.courier') }}
                  </span>
                  <span class="text-xs leading-normal text-black dark:text-[#e8e6e3]">
                    {{ courierOptions.find((o) => o.value === courierData)?.label }}
                  </span>
                </div>
                <div class="flex flex-col gap-1 flex-1">
                  <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">
                    {{ t('dashboard.orders.popup.details.trackingNumber') }}
                  </span>
                  <span class="text-xs leading-normal text-black dark:text-[#e8e6e3]">{{ trackingNumber }}</span>
                </div>
                <div
                  class="flex justify-center items-center gap-2.5 w-max px-2 py-1 group/button cursor-pointer bg-black hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]"
                  @click="handleEditShippingDetails"
                >
                  <img
                    v-if="assets.editPen"
                    :src="assets.editPen"
                    :alt="t('dashboard.orders.popup.editPenAlt')"
                    class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(77%)_sepia(44%)_saturate(5180%)_hue-rotate(94deg)_brightness(110%)_contrast(95%)] group-hover/button:[filter:brightness(0)]"
                  >
                  <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23597b] dark:group-hover/button:text-[#e8e6e3]">
                    {{ t('dashboard.orders.popup.details.edit') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 px-2 py-4 bg-white md:px-4 dark:bg-[#181a1b] shrink-0">
          <div class="flex justify-between">
            <div class="flex gap-1 w-1/2">
              <span class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">3x</span>
              <div class="flex flex-col gap-2">
                <span class="text-xs leading-normal font-medium truncate text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('dashboard.orders.popup.mock.itemMerchTaiwan') }}
                </span>
                <div class="flex items-center gap-2 overflow-visible">
                  <div class="flex items-center gap-1 w-max h-5">
                    <img v-if="assets.logoGreen" :src="assets.logoGreen" :alt="t('dashboard.orders.popup.logoGreenAlt')" class="w-3 h-3" />
                    <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#17B26A] dark:text-[#56e9a5]">
                      {{ t('dashboard.orders.popup.pricing.merchDiscount', { percent: 10 }) }}
                    </span>
                  </div>
                  <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]" />
                  <div class="flex items-center gap-1 w-max h-5">
                    <img v-if="assets.tagGreen" :src="assets.tagGreen" :alt="t('dashboard.orders.popup.tagGreenAlt')" class="w-3 h-3" />
                    <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#17B26A] dark:text-[#56e9a5]">
                      {{ t('dashboard.orders.popup.mock.promoCode') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">USD$ 123.45</span>
              <span class="text-[0.625rem] leading-[1.125rem] text-right line-through text-[#667085] dark:text-[#655e53]">USD$ 123.45</span>
            </div>
          </div>

          <div class="flex justify-between">
            <div class="flex gap-1 w-1/2">
              <span class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">3x</span>
              <div class="flex flex-col gap-2">
                <span class="text-xs leading-normal font-medium truncate text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('dashboard.orders.popup.mock.itemMerchPhilippines') }}
                </span>
                <div class="flex items-center gap-2 overflow-visible">
                  <div class="flex items-center gap-1 w-max h-5">
                    <img v-if="assets.logoGreen" :src="assets.logoGreen" :alt="t('dashboard.orders.popup.logoGreenAlt')" class="w-3 h-3" />
                    <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#17B26A] dark:text-[#56e9a5]">
                      {{ t('dashboard.orders.popup.pricing.merchDiscount', { percent: 10 }) }}
                    </span>
                  </div>
                  <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]" />
                  <div class="flex items-center gap-1 w-max h-5">
                    <img v-if="assets.tagGreen" :src="assets.tagGreen" :alt="t('dashboard.orders.popup.tagGreenAlt')" class="w-3 h-3" />
                    <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#17B26A] dark:text-[#56e9a5]">
                      {{ t('dashboard.orders.popup.mock.promoCode') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">USD$ 123.45</span>
              <span class="text-[0.625rem] leading-[1.125rem] text-right line-through text-[#667085] dark:text-[#655e53]">USD$ 123.45</span>
            </div>
          </div>

          <div class="flex justify-between">
            <div class="flex gap-1 w-1/2">
              <span class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">3x</span>
              <div class="flex flex-col gap-2 overflow-hidden">
                <span class="text-xs leading-normal font-medium truncate text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('dashboard.orders.popup.mock.itemP2v') }}
                </span>
                <div class="flex items-center gap-2 overflow-visible">
                  <div class="flex items-center gap-1 w-max h-5">
                    <img v-if="assets.logoGreen" :src="assets.logoGreen" :alt="t('dashboard.orders.popup.logoGreenAlt')" class="w-3 h-3" />
                    <span class="text-xs leading-normal font-medium whitespace-nowrap text-[#17B26A] dark:text-[#56e9a5]">
                      {{ t('dashboard.orders.popup.pricing.p2vDiscount', { percent: 10 }) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1 w-1/2">
              <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 123.45</span>
              <span class="text-[0.625rem] leading-[1.125rem] text-right line-through text-[#667085] dark:text-[#655e53]">USD$ 123.45</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-[#EAECF0] dark:border-[#353a3c] mt-auto">
            <span class="text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">{{ t('dashboard.orders.popup.pricing.subtotal') }}</span>
            <span class="text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">USD$ 370.35</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">{{ t('dashboard.orders.popup.pricing.totalDiscount') }}</span>
            <div class="flex justify-center items-center px-1 h-5 rounded-[1.25rem] bg-[#DCFAE6] dark:bg-[#094226]">
              <span class="text-xs leading-normal font-medium text-[#067647] dark:text-[#7cf8c4]">-USD$ 32.45</span>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-[#EAECF0] dark:border-[#353a3c]">
            <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ t('dashboard.orders.popup.pricing.total') }}</span>
            <span class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">USD$ 337.9</span>
          </div>
        </div>
      </div>

      <CancelUploadPopup
        v-model="cancelUploadPopupOpen"
        :message="cancelUploadMessage"
        nested
        @delete="handlePopupConfirm"
      />
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-[cubic-bezier(1,0.5,0.8,1)]"
      enter-from-class="translate-x-5 opacity-0"
      leave-to-class="translate-x-5 opacity-0"
    >
      <div v-if="showNotification" class="fixed top-2 right-0 w-full max-w-[29rem] md:max-w-[28.8125rem] sm:right-2 z-[9999]">
        <div class="w-full min-h-[4rem] border-b-[0.5px] border-b-[#EAECF0] border-l-[3px] border-l-[#2ED3B7] bg-white shadow-xl">
          <div class="w-full h-full [background:linear-gradient(0deg,rgba(46,211,183,0.15),rgba(46,211,183,0.15))]">
            <div class="flex gap-4 px-2 py-3 w-full h-full [background:linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.9)_100%)]">
              <div class="w-10 h-10 min-w-[2.5rem] flex justify-center items-center overflow-visible bg-[#2ED3B7]/10 rounded-lg relative">
                <img
                  v-if="assets.merch"
                  :src="assets.merch"
                  :alt="t('dashboard.orders.popup.merchAlt')"
                  class="w-7 h-7 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(28%)_saturate(1150%)_hue-rotate(112deg)_brightness(92%)_contrast(79%)]"
                >
                <div class="absolute -bottom-2 -right-3 w-[1.375rem] h-[1.375rem] flex justify-center items-center bg-[#2ED3B7] rounded-lg">
                  <img
                    v-if="assets.location"
                    :src="assets.location"
                    :alt="t('dashboard.orders.popup.locationAlt')"
                    class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(99%)_saturate(0%)_hue-rotate(265deg)_brightness(108%)_contrast(100%)]"
                  >
                </div>
              </div>
              <div class="flex flex-col grow">
                <div class="flex items-start justify-between gap-2 pb-2">
                  <div class="pt-1 pr-1">
                    <h3 class="text-sm font-semibold text-[#107569]">
                      {{ t('dashboard.orders.popup.notification.title', { orderNum: order?.orderNum || '' }) }}
                    </h3>
                  </div>
                  <button
                    class="flex justify-center items-center w-6 h-6 min-w-[1.5rem] bg-transparent outline-none border-none cursor-pointer"
                    @click="showNotification = false"
                  >
                    <img
                      v-if="assets.close"
                      :src="assets.close"
                      :alt="t('dashboard.orders.popup.closeAlt')"
                      class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(95%)_sepia(5%)_saturate(387%)_hue-rotate(185deg)_brightness(87%)_contrast(99%)]"
                    />
                  </button>
                </div>
                <div class="flex">
                  <p class="text-sm text-black">
                    {{ t('dashboard.orders.popup.notification.fanNotified', { fanHandle: fanHandle }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </BasePopup>
</template>
