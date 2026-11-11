<template>
  <div :class="[
    'flex flex-col relative',
    variant === 'latest' ? 'bg-[#f2f2f2] rounded w-[17.5rem] sm:w-[19.3rem] p-0' : 'w-full gap-2',
    variant === 'grid' ? 'relative z-0 hover:z-30 focus-within:z-30 overflow-visible xl:hover:z-30 min-w-0' : '',
  ]">

    <div class="video-container cursor-pointer w-full transition-all duration-300 ease-out" :class="[
      variant === 'latest' ? 'relative aspect-video rounded-t max-h-[9.9rem] sm:max-h-[unset] overflow-hidden' : '',
      variant === 'resume' ? 'relative aspect-video w-[25.75rem] overflow-hidden' : '',
      variant === 'purchased' || variant === 'default' ? 'relative aspect-video overflow-hidden rounded-sm' : '',
      variant === 'grid' ? 'group/image relative aspect-video overflow-visible origin-center transition-transform duration-300 ease-out hover:scale-125 hover:z-10 hover:shadow-xl after:content-[\'\'] after:absolute after:inset-0 after:w-full after:h-full after:rounded-none after:bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)] after:z-[-1] after:pointer-events-none' : ''
    ]" @mouseenter="playVideo" @mouseleave="pauseVideo">
      <div v-if="variant === 'latest'"
        class="absolute inset-0 w-full h-full pointer-events-none z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_-100%,rgba(0,0,0,0)_67.92%,rgba(0,0,0,0.02)_75.57%)]">
      </div>
      <div v-else-if="variant === 'resume' || variant === 'purchased'"
        class="absolute inset-0 w-full h-full pointer-events-none z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)]">
      </div>

      <div v-if="variant === 'grid' && media.type === 'gallery'" class="absolute w-full h-full z-[2]">
        <div class="flex relative w-full h-full justify-end items-end">
          <div class="w-1/2 h-full flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm">
            <span class="text-xl leading-6 md:text-3xl md:leading-9 text-center text-[#EAECF0]">{{ media.galleryCount || 7 }}+</span>
            <span class="text-sm leading-normal md:text-lg md:leading-normal text-center text-[#EAECF0]">{{ t('mediaCard.galleryImages') }}</span>
          </div>
        </div>
      </div>

      <div class="absolute inset-0 w-full h-full overflow-hidden">
          <video
            v-if="media.type === 'video' || !media.type"
            ref="videoRef"
            :poster="videoPoster || undefined"
            class="absolute inset-0 object-cover w-full h-full"
            muted
            loop
            playsinline
            preload="metadata"
            :style="mediaBlurStyle"
            @loadedmetadata="onVideoLoadedMetadata"
          >
            <source :src="media.videoUrl" type="video/mp4">
          </video>

          <img v-else :src="media.poster || media.videoUrl" alt="sample-bg-image" class="absolute inset-0 w-full h-full object-cover" :style="mediaBlurStyle" />
      </div>

      <div class="flex justify-between items-center w-full absolute left-0 top-0 p-1"
        :class="variant === 'grid' ? 'z-20' : 'z-[20]'">
        <div v-if="variant === 'grid'" class="px-1 py-[0.0625rem] rounded bg-[#18223080]">
          <span class="flex items-center gap-1">
            <span class="pb-[0.0625rem]">
              <img :src="mediaTypeIcon" alt="icon" class="w-4 h-4" />
            </span>
            <span v-if="overlayDuration" class="text-xs text-[#FFFFFF] leading-normal tracking-[0.0075rem]">{{
              overlayDuration }}</span>
          </span>
        </div>

        <div v-else
          class="flex justify-center items-center gap-[0.188rem] px-1 py-0.5 rounded bg-[#18223080] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <img v-if="defaultTypeIconUrl" :src="defaultTypeIconUrl" alt="" class="w-4 h-4" />
          <span v-if="overlayDuration" class="text-xs text-[#FFFFFF] leading-[1rem] tracking-[0.008rem]">{{ overlayDuration }}</span>
        </div>

        <div class="flex items-center gap-[0.813rem] px-1 py-0.5 rounded bg-[#18223080]">
          <span class="flex justify-center items-center gap-[0.1875rem]">
            <span class="text-xs leading-normal font-medium text-[#FFFFFF] tracking-[0.0075rem]">{{ media.timeAgo }}</span>
          </span>

          <span class="flex justify-center items-center gap-[0.1875rem]">
            <img v-if="heartIconUrl" :src="heartIconUrl" alt="" class="w-[0.75rem] [filter:brightness(0)_invert(1)]" />
            <span class="text-xs leading-normal font-medium text-[#FFFFFF] tracking-[0.0075rem]">{{ media.likes }}</span>
          </span>

          <span class="flex justify-center items-center gap-[0.1875rem]">
            <img v-if="eyeIconUrl" :src="eyeIconUrl" alt="" class="w-[0.75rem] [filter:brightness(0)_invert(1)]" />
            <span class="text-xs leading-normal font-medium text-[#FFFFFF] tracking-[0.0075rem]">{{ media.views }}</span>
          </span>
        </div>
      </div>

      <div v-if="variant === 'default'" class="flex absolute left-0 bottom-0 z-[20]">
        <span
          class="flex justify-center items-center py-[3px] px-[6px]"
          :class="statusIconWrapClass"
        >
          <img v-if="statusIconUrl" :src="statusIconUrl" alt="" class="w-4 h-4 object-contain" />
        </span>
        <span
          class="text-xs font-medium leading-[1.125rem] flex justify-center items-center px-[6px] py-[3px] bg-black"
          :class="statusLabelClass"
        >{{ libraryStatusLabel }}</span>
      </div>

      <template v-if="variant === 'resume' || variant === 'purchased'">
        <div class="flex justify-center items-center absolute top-0 left-0 w-full h-full overflow-hidden z-[10]">
          <div class="flex justify-center items-center bg-black/10 rounded-full backdrop-blur-[5px] w-20 h-20">
            <img v-if="playIconUrl" :src="playIconUrl" alt=""
              class="w-9 h-9 opacity-60 filter brightness-0 saturate-100 invert-[68%] sepia-[3%] hue-rotate-[317deg] contrast-[101%]" />
          </div>
        </div>
        <div class="absolute bottom-0 right-0 z-[20]">
          <img v-if="siteLogoUrl" :src="siteLogoUrl" alt=""
            class="flex w-16 h-16 pointer-events-none filter brightness-0 saturate-100 invert-[100%] sepia-[11%] hue-rotate-[341deg] contrast-[95%]" />
        </div>
        <div v-if="variant === 'resume'" class="absolute bottom-0 left-0 z-[20]">
          <div
            class="flex justify-center items-center gap-[0.188rem] px-[0.625rem] py-0.5 bg-[#ff4848] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
            <img v-if="playIconUrl" :src="playIconUrl" alt=""
              class="w-3 h-3 [filter:brightness(100)_saturate(0)]" />
            <span class="text-sm text-white leading-normal tracking-[0.008rem]">{{ t('mediaCard.resume') }}</span>
          </div>
        </div>
      </template>

      <template v-if="variant === 'latest'">
        <div
          class="flex flex-col justify-end absolute bottom-0 left-0 w-full h-max overflow-hidden z-[20] gap-2 [background:linear-gradient(180deg,rgba(255,255,255,0)_50%,rgba(0,0,0,.80)_100%)]">
          <div class="flex flex-col gap-2 p-2">
            <h3 class="text-base text-[#edeff3] font-medium line-clamp-1">{{ media.title }}</h3>
            <div class="flex items-center gap-1">
              <div class="flex items-center relative w-5 h-5">
                <span class="flex justify-center items-center rounded-full relative w-5 h-5 overflow-hidden opacity-80">
                  <img :src="media.avatar" class="w-full h-full object-cover" />
                </span>
              </div>
              <span class="text-xs leading-normal text-[#edeff3]">{{ media.creatorName }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-if="variant === 'grid'">
        <div class="flex group-hover/image:hidden absolute left-0 bottom-0 z-20">
          <!-- Buy Label -->
          <span v-if="buyLabel"
            class="flex justify-center items-center px-2.5 py-1 gap-1 backdrop-filter backdrop-blur-[20px]"
            :style="{ backgroundColor: buyBgColor }">
            <span class="text-white text-xs font-medium leading-[.875rem]">{{ buyLabel }}</span>
          </span>
          <!-- Action Label -->
          <span class="flex justify-center items-center px-[0.4rem] gap-1 backdrop-filter backdrop-blur-[20px]"
            :style="{ backgroundColor: actionBgColor }">
            <span class="text-black text-[0.58rem] font-medium leading-[.875rem]">{{ displayActionLabel }}</span>
          </span>
        </div>

        <div class="hidden group-hover/image:flex flex-col items-start gap-3 absolute left-0 bottom-0 z-20 pb-2 pl-2">
          <div class="flex items-center">
            <!-- Buy Label -->
            <span v-if="buyLabel"
              class="flex justify-center items-center px-2.5 py-1 gap-1 backdrop-filter backdrop-blur-[20px]"
              :style="{ backgroundColor: buyBgColor }">
              <span class="text-white text-xs   backdrop-blur-[10px] font-medium leading-[.875rem]">{{ buyLabel
                }}</span>
            </span>
            <!-- Action Label -->
            <span class="flex justify-center items-center px-[0.4rem] gap-1 backdrop-filter backdrop-blur-[20px]"
              :style="{ backgroundColor: actionBgColor }">
              <span class="text-black text-[0.58rem] font-medium leading-[.875rem]">{{ displayActionLabel }}</span>
            </span>
          </div>
          <span class="text-[0.58rem] font-medium flex-grow line-clamp-1 text-white">{{ media.title }}</span>
        </div>

        <div class="absolute bottom-0 right-0 z-20">
          <img v-if="siteLogoUrl" :src="siteLogoUrl" alt=""
            class="flex w-16 h-16 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(11%)_saturate(3489%)_hue-rotate(341deg)_brightness(93%)_contrast(95%)]" />
        </div>
      </template>

    </div>

    <div v-if="variant === 'default' || variant === 'purchased'" class="flex flex-col gap-1 w-full">
      <div class="flex items-start gap-1">
        <div class="min-w-0 flex-grow">
          <span
            class="text-sm font-semibold break-all [overflow-wrap:anywhere]"
            :style="{ color: titleColor }"
            :class="variant === 'purchased' ? 'font-medium line-clamp-1' : 'line-clamp-2'"
          >
            {{ media.title }}
          </span>
        </div>
        <div class="relative shrink-0">
          <div ref="menuAnchor" tabindex="0" :class="menuTriggerClass" @click="onMenuTriggerClick">
            <img v-if="menuTriggerIconUrl" :src="menuTriggerIconUrl" alt="" :class="menuTriggerIconClass" />
          </div>
          <DropdownMenu
            v-if="menuAnchor && !isMobileViewport"
            ref="menuDropdownRef"
            :anchor="menuAnchor"
            :config="menuDropdownConfig"
            @close="onMenuClose"
          >
            <div v-if="menuView === 'tiers'" class="flex max-h-[min(22rem,calc(100vh-2rem))] flex-col py-1">
              <button
                type="button"
                class="flex w-full shrink-0 items-center gap-1 px-3 py-2 text-left text-sm font-medium text-[#98A2B3]"
                @click="menuView = 'root'"
              >
                <ChevronLeftIcon class="w-4 h-4 shrink-0" />
                {{ t('mediaCard.menu.back') }}
              </button>

              <div class="min-h-0 overflow-y-auto">
                <p
                  v-if="!subscriptionTiers.length"
                  class="px-3 py-2.5 text-sm font-normal text-[#667085]"
                >
                  {{ t('mediaCard.menu.noTiersYet') }}
                </p>
                <button
                  v-for="plan in subscriptionTiers"
                  :key="plan.id"
                  type="button"
                  class="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-[#f2f4f7]"
                  @click="toggleTier(plan)"
                >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0C111D]">
                  <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white" aria-hidden="true">
                    <circle cx="12" cy="10" r="3.25" stroke="currentColor" stroke-width="1.8" />
                    <path d="M12 13.25V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  </svg>
                </span>
                <span class="min-w-0 flex-1 text-sm font-semibold leading-5 text-[#0C111D] [overflow-wrap:anywhere]">{{ plan.label }}</span>
                <span
                  v-if="plan.status === 'published'"
                  class="shrink-0 rounded-full bg-[#D1E0FF] px-2 py-0.5 text-[11px] font-medium leading-normal text-[#155EEF]"
                >
                  {{ t('mediaCard.menu.publishedTier') }}
                </span>
                <span
                  v-else
                  class="shrink-0 text-xs font-medium leading-normal text-[#98A2B3]"
                >
                  {{ t('mediaCard.menu.draft') }}
                </span>
                <CheckCircleIcon
                  v-if="isTierSelected(plan)"
                  class="mt-0.5 w-5 h-5 shrink-0 text-[#155EEF]"
                />
              </button>
              </div>
            </div>
            <div v-else class="py-1 md:py-0">
              <button v-for="option in menuOptions" :key="option.value" type="button"
                class="flex w-full items-center gap-[0.75rem] hover:bg-[#f2f4f7] px-[0.625rem] md:px-2 py-[0.625rem] text-left"
                :class="[
                  'h-[4.25rem] md:h-max',
                  { 'border-t border-[#dee5ec]': option.divider }
                ]"
                @click="handleMenuSelect(option.value)">
                <CloudArrowUpIcon
                  v-if="option.value === 'publish'"
                  class="w-4 h-4 shrink-0 text-[#0c111d]"
                  :class="variant === 'default' ? 'md:w-6 md:h-6' : ''"
                />
                <img
                  v-else
                  :src="option.icon"
                  alt=""
                  class="w-4 h-4 shrink-0 object-cover"
                  :class="[{ 'md:w-6 md:h-6': variant === 'default' }, option.value === 'profile' ? 'rounded-full' : '']"
                />
                <div class="flex flex-1 items-center justify-between md:justify-start gap-[0.625rem] min-w-0">
                  <span class="font-medium capitalize text-balance break-words"
                    :class="[option.danger ? 'text-[#ff4405]' : 'text-[#0c111d]', variant === 'purchased' || variant === 'grid' ? 'text-[0.875rem]' : 'text-base']">
                    {{ option.label }}
                  </span>
                  <img v-if="option.hasArrow && menuArrowIconUrl" :src="menuArrowIconUrl" alt="" class="w-6 h-6 shrink-0" />
                </div>
              </button>
            </div>
          </DropdownMenu>
          <BasePopup
            v-if="isMobileViewport"
            :modelValue="mobileMenuOpen"
            :popup-config="mobileMenuPopupConfig"
            @update:modelValue="onMobileMenuOpenChange"
          >
            <div
              class="flex w-full max-h-[min(85dvh,40rem)] flex-col overflow-hidden rounded-t-[0.625rem] bg-white shadow-[0px_-8px_24px_#10182824]"
            >
              <div v-if="menuView === 'tiers'" class="flex min-h-0 flex-col py-1">
                <button
                  type="button"
                  class="flex w-full shrink-0 items-center gap-1 px-4 py-3 text-left text-sm font-medium text-[#98A2B3]"
                  @click="menuView = 'root'"
                >
                  <ChevronLeftIcon class="w-4 h-4 shrink-0" />
                  {{ t('mediaCard.menu.back') }}
                </button>
                <div class="min-h-0 overflow-y-auto">
                  <p
                    v-if="!subscriptionTiers.length"
                    class="px-4 py-3 text-sm font-normal text-[#667085]"
                  >
                    {{ t('mediaCard.menu.noTiersYet') }}
                  </p>
                  <button
                    v-for="plan in subscriptionTiers"
                    :key="`mobile-${plan.id}`"
                    type="button"
                    class="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-[#f2f4f7]"
                    @click="toggleTier(plan)"
                  >
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0C111D]">
                      <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white" aria-hidden="true">
                        <circle cx="12" cy="10" r="3.25" stroke="currentColor" stroke-width="1.8" />
                        <path d="M12 13.25V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                      </svg>
                    </span>
                    <span class="min-w-0 flex-1 text-sm font-semibold leading-5 text-[#0C111D] [overflow-wrap:anywhere]">{{ plan.label }}</span>
                    <span
                      v-if="plan.status === 'published'"
                      class="shrink-0 rounded-full bg-[#D1E0FF] px-2 py-0.5 text-[11px] font-medium leading-normal text-[#155EEF]"
                    >
                      {{ t('mediaCard.menu.publishedTier') }}
                    </span>
                    <span
                      v-else
                      class="shrink-0 text-xs font-medium leading-normal text-[#98A2B3]"
                    >
                      {{ t('mediaCard.menu.draft') }}
                    </span>
                    <CheckCircleIcon
                      v-if="isTierSelected(plan)"
                      class="mt-0.5 w-5 h-5 shrink-0 text-[#155EEF]"
                    />
                  </button>
                </div>
              </div>
              <div v-else class="py-1">
                <button
                  v-for="option in menuOptions"
                  :key="`mobile-${option.value}`"
                  type="button"
                  class="flex h-[4.25rem] w-full items-center gap-[0.75rem] px-4 text-left hover:bg-[#f2f4f7]"
                  :class="{ 'border-t border-[#dee5ec]': option.divider }"
                  @click="handleMenuSelect(option.value)"
                >
                  <CloudArrowUpIcon
                    v-if="option.value === 'publish'"
                    class="w-6 h-6 shrink-0 text-[#0c111d]"
                  />
                  <img
                    v-else
                    :src="option.icon"
                    alt=""
                    class="w-6 h-6 shrink-0 object-cover"
                    :class="option.value === 'profile' ? 'rounded-full' : ''"
                  />
                  <div class="flex min-w-0 flex-1 items-center justify-between gap-[0.625rem]">
                    <span
                      class="text-base font-medium capitalize break-words"
                      :class="option.danger ? 'text-[#ff4405]' : 'text-[#0c111d]'"
                    >
                      {{ option.label }}
                    </span>
                    <img v-if="option.hasArrow && menuArrowIconUrl" :src="menuArrowIconUrl" alt="" class="w-6 h-6 shrink-0" />
                  </div>
                </button>
              </div>
            </div>
          </BasePopup>
        </div>
      </div>
      <div v-if="variant === 'purchased'" class="flex items-end gap-1 flex-grow">
        <div class="flex justify-center items-center gap-2 py-1">
          <div class="w-6 h-6 overflow-hidden rounded-full">
            <img :src="media.avatar" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col">
            <a class="flex items-center gap-1 outline-none">
              <span class="text-xs leading-normal font-medium truncate text-[#667085]">{{ media.creatorName }}</span>
              <img v-if="verifiedIconUrl" :src="verifiedIconUrl" alt="" class="h-[0.625rem]" />
            </a>
            <div class="flex items-start gap-3 flex-grow">
              <div class="flex items-center gap-1">
                <img v-if="eyeIconUrl" :src="eyeIconUrl" alt="" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.views }}</span>
              </div>
              <div class="flex items-center gap-1 cursor-pointer">
                <img v-if="heartIconUrl" :src="heartIconUrl" alt="" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="variant === 'grid' && showFooter" class="h-20 flex flex-col gap-1 w-full">
      <div class="flex items-start gap-1">
        <span class="text-sm font-medium flex-grow line-clamp-2" :style="{ color: titleColor }">
          {{ media.title }}
        </span>
        <div class="relative shrink-0">
          <div ref="menuAnchor" tabindex="0" :class="menuTriggerClass">
            <img v-if="menuTriggerIconUrl" :src="menuTriggerIconUrl" alt="" :class="menuTriggerIconClass" />
          </div>
          <DropdownMenu v-if="menuAnchor" ref="menuDropdownRef" :anchor="menuAnchor" :config="menuDropdownConfig">
            <div class="py-1 md:py-0">
              <button v-for="option in menuOptions" :key="option.value" type="button"
                class="flex w-full items-center gap-[0.75rem] hover:bg-[#f2f4f7] h-[4.25rem] md:h-max px-[0.625rem] md:px-2 py-[0.625rem] text-left"
                :class="{ 'border-t border-[#dee5ec]': option.divider }"
                @click="handleMenuSelect(option.value)">
                <img :src="option.icon" alt="" class="w-4 h-4 shrink-0 object-cover"
                  :class="option.value === 'profile' ? 'rounded-full' : ''" />
                <span class="text-[0.875rem] leading-[1.5rem] text-[#0c111d] capitalize text-balance font-medium">
                  {{ option.label }}
                </span>
              </button>
            </div>
          </DropdownMenu>
        </div>
      </div>

      <div class="flex items-end gap-1 flex-grow">
        <div class="flex justify-center items-center gap-2 py-1">
          <div class="w-6 h-6 overflow-hidden rounded-full">
            <img :src="media.avatar" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col">
            <a class="flex items-center gap-1">
              <span class="text-xs leading-normal font-medium truncate text-[#667085]">{{ media.creatorName }}</span>
              <img v-if="verifiedIconUrl" :src="verifiedIconUrl" alt="" class="h-[0.625rem]" />
            </a>
            <div class="flex items-start gap-3 flex-grow">
              <div class="flex items-center gap-1">
                <img v-if="eyeIconUrl" :src="eyeIconUrl" alt="" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.views }}</span>
              </div>
              <div class="flex items-center gap-1">
                <img v-if="heartIconUrl" :src="heartIconUrl" alt="" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckCircleIcon, ChevronLeftIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import breakpoints from '@/composables/breakpoints.js';

const props = defineProps({
  media: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'default'
  },
  titleColor: {
    type: String,
    default: '#0c111d'
  },
  actionLabel: {
    type: String,
    default: undefined
  },
  actionBgColor: {
    type: String,
    default: '#fb0464'
  },
  buyLabel: {
    type: String,
    default: null
  },
  buyBgColor: {
    type: String,
    default: '#ffffff'
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  subscriptionTiers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['menu-action', 'toggle-tier']);
const { t } = useI18n();

const { url: videoIconUrl } = useAssetUrl('icon.media.video');
const { url: imageIconUrl } = useAssetUrl('icon.media.image');
const { url: heartIconUrl } = useAssetUrl('icon.media.heart');
const { url: eyeIconUrl } = useAssetUrl('icon.media.eye');
const { url: uploadIconUrl } = useAssetUrl('icon.media.upload');
const { url: reviewingIconUrl } = useAssetUrl('mediaUploader.icon.reviewing');
const { url: draftIconUrl } = useAssetUrl('mediaUploader.icon.draft');
const { url: playIconUrl } = useAssetUrl('icon.media.play');
const { url: siteLogoUrl } = useAssetUrl('icon.media.siteLogo');
const { url: verifiedIconUrl } = useAssetUrl('icon.media.verified');
const { url: threeDotsUrl } = useAssetUrl('icon.media.threeDots');
const { url: threeDotsVerticalUrl } = useAssetUrl('icon.media.threeDotsVertical');
const { url: menuEditIconUrl } = useAssetUrl('icon.media.menu.edit');
const { url: menuTierIconUrl } = useAssetUrl('icon.media.menu.subscriptionTier');
const { url: menuArrowIconUrl } = useAssetUrl('icon.media.menu.arrow');
const { url: menuUnpublishIconUrl } = useAssetUrl('icon.media.menu.unpublish');
const { url: menuDeleteIconUrl } = useAssetUrl('icon.media.menu.delete');
const { url: menuShareIconUrl } = useAssetUrl('icon.media.menu.share');
const { url: menuReportIconUrl } = useAssetUrl('icon.media.menu.report');

const videoRef = ref(null);
const menuAnchor = ref(null);
const menuDropdownRef = ref(null);
const menuView = ref('root');
const mobileMenuOpen = ref(false);
const isMobileViewport = computed(() => breakpoints.state.mobile);

/** <video poster> only accepts images — data:video / empty poster leave the card blank until hover-play. */
function isImagePosterUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('data:')) return false;
  if (url.startsWith('blob:')) return false;
  return true;
}

const videoPoster = computed(() => {
  const poster = props.media?.poster || '';
  return isImagePosterUrl(poster) ? poster : '';
});

function showVideoPreviewFrame(video) {
  if (!video) return;
  try {
    const duration = Number(video.duration);
    const t = Number.isFinite(duration) && duration > 0
      ? Math.min(0.1, duration * 0.05)
      : 0.1;
    if (video.currentTime !== t) video.currentTime = t;
  } catch {
    /* ignore seek errors before ready */
  }
}

const playVideo = () => {
  if (videoRef.value && (props.media.type === 'video' || !props.media.type)) {
    videoRef.value.play();
  }
};

const pauseVideo = () => {
  if (videoRef.value && (props.media.type === 'video' || !props.media.type)) {
    videoRef.value.pause();
    if (videoPoster.value) {
      videoRef.value.currentTime = 0;
    } else {
      showVideoPreviewFrame(videoRef.value);
    }
  }
};

const mediaTypeIcon = computed(() => {
  if (props.media.type === 'video' || !props.media.type) return videoIconUrl.value;
  return imageIconUrl.value;
});

const defaultTypeIconUrl = computed(() => {
  if (props.media.type === 'video' || !props.media.type) return videoIconUrl.value;
  return imageIconUrl.value;
});

const detectedDuration = ref('');

function formatOverlayDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function onVideoLoadedMetadata(event) {
  const video = event?.target;
  detectedDuration.value = formatOverlayDuration(video?.duration);
  if (!videoPoster.value) {
    showVideoPreviewFrame(video);
  }
}

const overlayDuration = computed(() => {
  if (props.media?.type && props.media.type !== 'video') return props.media.duration || '';
  return props.media?.duration || detectedDuration.value;
});

const mediaBlurStyle = computed(() => {
  if (!props.media?.blurThumbnail) return {};
  const map = { '20px': '8px', '50px': '20px', '100px': '40px' };
  const blurValue = map[props.media.blurThumbnailLevel] || '8px';
  return {
    filter: `blur(${blurValue})`,
    WebkitFilter: `blur(${blurValue})`,
    transform: 'scale(1.12)',
  };
});

const displayActionLabel = computed(() => props.actionLabel ?? t('mediaCard.subscribeOrBuy'));

const libraryStatus = computed(() => props.media?.status || 'published');

const libraryStatusLabel = computed(() => {
  if (libraryStatus.value === 'reviewing') return t('mediaUploader.library.status.reviewing');
  if (libraryStatus.value === 'draft') return t('mediaUploader.library.status.draft');
  return t('mediaCard.published');
});

const statusIconUrl = computed(() => {
  if (libraryStatus.value === 'published') return uploadIconUrl.value;
  if (libraryStatus.value === 'draft') return draftIconUrl.value;
  return reviewingIconUrl.value;
});

const statusIconWrapClass = computed(() => {
  if (libraryStatus.value === 'published') return 'bg-[#07f468]';
  if (libraryStatus.value === 'draft') return 'bg-[#D0D5DD]';
  return 'bg-[#FDB022]';
});

const statusLabelClass = computed(() => {
  if (libraryStatus.value === 'published') return 'text-[#07f468]';
  if (libraryStatus.value === 'draft') return 'text-[#D0D5DD]';
  return 'text-[#FDB022]';
});

const menuTriggerIconUrl = computed(() =>
  props.variant === 'purchased' ? threeDotsUrl.value : threeDotsVerticalUrl.value
);

const menuTriggerClass = computed(() =>
  props.variant === 'grid'
    ? 'cursor-pointer w-6 h-6 flex justify-center items-center'
    : 'cursor-pointer w-6 h-6 rounded-[0.313rem] flex justify-center items-center hover:bg-[rgba(41,112,255,0.2)]'
);

const menuTriggerIconClass = computed(() =>
  props.variant === 'grid' ? 'w-full h-full' : 'w-4 h-4'
);

const mobileMenuPopupConfig = {
  actionType: 'slideIn',
  from: 'bottom',
  position: 'center',
  offset: '0px',
  speed: '300ms',
  effect: 'ease-in-out',
  closeSpeed: '300ms',
  closeEffect: 'ease-in-out',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldCloseOnEscape: true,
  shouldLockBodyScroll: true,
  zIndex: 20000,
  forceZIndex: 20000,
  width: '100%',
  height: 'auto',
  scrollable: false,
};

function onMenuTriggerClick() {
  if (!isMobileViewport.value) return;
  mobileMenuOpen.value = true;
}

function onMobileMenuOpenChange(open) {
  mobileMenuOpen.value = open;
  if (!open) menuView.value = 'root';
}

const menuDropdownConfig = computed(() => ({
  trigger: 'click',
  align: 'right',
  width: props.variant === 'default' ? 320 : 280,
  zIndexBase: 10100,
  closeOnOutsideClick: true,
  scrollEnabled: false,
  hideScrollbars: true,
  style: {
    class: 'border border-[rgba(186,188,203,0.5)] rounded-[0.625rem] bg-white overflow-hidden shadow-lg',
  },
}));

const menuOptions = computed(() => {
  if (props.variant === 'purchased' || props.variant === 'grid') {
    return [
      { label: t('mediaCard.menu.goToProfile'), value: 'profile', icon: props.media.avatar },
      { label: t('mediaCard.menu.share'), value: 'share', icon: menuShareIconUrl.value },
      { label: t('mediaCard.menu.report'), value: 'report', icon: menuReportIconUrl.value },
    ];
  }
  return [
    { label: t('mediaCard.menu.editDetails'), value: 'edit', icon: menuEditIconUrl.value },
    { label: t('mediaCard.menu.addToSubscriptionTier'), value: 'subscription-tier', icon: menuTierIconUrl.value, hasArrow: true },
    props.media?.status === 'published'
      ? { label: t('mediaCard.menu.unpublish'), value: 'unpublish', icon: menuUnpublishIconUrl.value }
      : { label: t('mediaCard.menu.publish'), value: 'publish' },
    { label: t('mediaCard.menu.deleteMedia'), value: 'delete', icon: menuDeleteIconUrl.value, danger: true, divider: true },
  ];
});

const handleMenuSelect = (action) => {
  if (action === 'subscription-tier') {
    menuView.value = 'tiers';
    return;
  }
  emit('menu-action', action);
  menuDropdownRef.value?.close();
  mobileMenuOpen.value = false;
  menuView.value = 'root';
};

function onMenuClose() {
  menuView.value = 'root';
}

watch(menuView, async () => {
  if (!menuDropdownRef.value?.isOpen?.()) return;
  await nextTick();
  menuDropdownRef.value?.reposition?.('menu-view');
});

watch(isMobileViewport, (mobile) => {
  if (mobile) {
    menuDropdownRef.value?.close();
    return;
  }
  mobileMenuOpen.value = false;
  menuView.value = 'root';
});

watch(() => props.media?.videoUrl || props.media?.poster, () => {
  detectedDuration.value = '';
});

function isTierSelected(plan) {
  const selected = props.media?.tiers || [];
  const label = String(plan?.label || '').trim();
  const id = String(plan?.id || '').trim();
  return selected.some((entry) => {
    const name = typeof entry === 'string' ? entry.trim() : String(entry?.label || entry?.id || '').trim();
    return Boolean(name) && (name === label || (id && name === id));
  });
}

function toggleTier(plan) {
  emit('toggle-tier', plan);
}

function closeMenu() {
  menuDropdownRef.value?.close();
  mobileMenuOpen.value = false;
  menuView.value = 'root';
}

defineExpose({ closeMenu });
</script>