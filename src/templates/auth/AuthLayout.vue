<template>
  <div
    class="bg-container w-full flex justify-between items-center h-[100vh] bg-cover bg-no-repeat bg-lightgray xl:bg-center lg:bg-center md:bg-left sm:bg-[position:-100px] max-[479px]:bg-[position:-290px]"
    :style="{ backgroundImage: bgUrl || undefined }">
    <!-- Left column (background image area) -->
    <div></div>

    
  <!-- Right column (content area) — gap-4 = 16px under header -->
  
  <div
      class="right-column relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full h-full flex flex-col items-start gap-4 px-2 pt-6 pb-0 md:px-4 md:pt-8 lg:px-8 lg:pt-12 bg-black/50 lg:w-1/2 after:content-[''] after:fixed after:right-0 after:top-0 after:w-1/2 after:h-full backdrop-blur-xl after:z-[1] lg:after:w-1/2 max-lg:after:w-full">
      <div class="relative z-20 flex flex-col items-start gap-4 w-full min-w-0">
        <!-- Header Container -->
        <div class="flex justify-between items-start w-full">
          <slot name="header">
            <AuthHeader />
          </slot>
        </div>

        <!-- Signed-out banner (logout → /log-in?signedOut=1) — visibility via interactionsEngine -->
        <NotificationCard
          v-if="showSignedOutBanner"
          :model-value="showSignedOutBanner"
          theme="authSignedOut"
          variant="info"
          :title="t('auth.login.signedOutBanner')"
          :icon="signedOutInfoIconUrl"
          closable
          class="w-full"
          @close="onSignedOutBannerClose"
          @update:model-value="onSignedOutBannerModel"
        />

        <!-- Main Content Slot -->
        <slot />
      </div>

      <div class="relative z-20 mt-auto w-full shrink-0">
        <slot name="footer">
          <AuthFooter />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getAssetUrlForCss } from '@/systems/assets/assetLibrary'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js'
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue'
import AuthHeader from './AuthHeader.vue'
import AuthFooter from './AuthFooter.vue'

const SIGNED_OUT_BANNER_KEY = 'auth.signedOutBanner'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const bgUrl = ref('')
const { url: signedOutInfoIconUrl } = useAssetUrl('auth.icon.signedOutInfo')

const showSignedOutBanner = computed(
  () => !!interactionsEngine.elementVisibility[SIGNED_OUT_BANNER_KEY],
)

watch(
  () => route.query.signedOut,
  (val) => {
    const shouldShow = String(val || '') === '1'
    interactionsEngine.runInteractions([
      {
        type: shouldShow ? 'showElement' : 'hideElement',
        elementKey: SIGNED_OUT_BANNER_KEY,
      },
    ])
  },
  { immediate: true },
)

const onSignedOutBannerClose = () => {
  interactionsEngine.runInteractions([
    { type: 'hideElement', elementKey: SIGNED_OUT_BANNER_KEY },
  ])
  const nextQuery = { ...route.query }
  delete nextQuery.signedOut
  router.replace({ path: route.path, query: nextQuery })
}

const onSignedOutBannerModel = (open) => {
  if (!open) onSignedOutBannerClose()
}

onMounted(async () => {
  bgUrl.value = await getAssetUrlForCss('auth.background')
})
</script>
