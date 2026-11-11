<template>
  <!-- kyc-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <Heading
        :text="kycTitle"
        tag="h2"
        theme="AuthHeading"
        add-class="!text-4xl !leading-10 !tracking-tight"
      />

      <div class="flex flex-col gap-4">
        <Paragraph
          :text="t('auth.register.kyc.description1')"
          font-size="text-base"
          font-weight="font-normal"
          font-color="text-[#ffffff]"
        />
        <Paragraph
          :text="t('auth.register.kyc.description2')"
          font-size="text-base"
          font-weight="font-normal"
          font-color="text-[#ffffff]"
        />
        <Paragraph
          :text="t('auth.register.kyc.description3')"
          font-size="text-base"
          font-weight="font-normal"
          font-color="text-[#ffffff]"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <DashboardPrimaryButton :text="isLoading ? t('auth.common.loading') : t('auth.register.kyc.button')" variant="authPink"
          size="lg" :disabled="isLoading" @click="completeKyc" />

        <DashboardPrimaryButton :text="t('auth.register.kyc.logout')" variant="authTransparent" size="lg" type="button"
          @click="handleLogout" />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { authHandler } from "@/dev/utils/auth/authHandler"
import {
  buildKycCompleteProfileAttributes,
  buildKycLocalUpdates,
} from '@/dev/utils/auth/authProfileAttributes.js'
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/systems/i18n/localeManager.js"
import Heading from "@/components/ui/typography/Heading.vue"
import Paragraph from "@/components/ui/typography/Paragraph.vue"
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const errorMessage = ref("")
const isLoading = ref(false)

const locale = computed(() => getActiveLocale())

const usernameLabel = computed(() => {
  const raw = authStore.currentUser?.username || 'username'
  return String(raw).replace(/^@/, '')
})

const kycTitle = computed(() =>
  t('auth.register.kyc.title', { username: `@${usernameLabel.value}` })
)

onMounted(() => {
  console.log(`[KYC] Component mounted, current locale: ${locale.value}`)
})

function handleLogout() {
  authStore.logout()
  router.push("/log-in")
}

async function completeKyc() {
  try {
    isLoading.value = true

    const kycPayload = [
      { type: "document", name: "passport", status: "uploaded" }
    ]

    const userId = await userIdUtility.getUserId()
    const profileAttributes = buildKycCompleteProfileAttributes()
    const localUpdates = buildKycLocalUpdates()

    // Dirty state: mark KYC complete locally before remote sync
    authStore.updateUserAttributesLocally(localUpdates)

    await Promise.all([
      authHandler.updateProfileAttributes(profileAttributes),
      apiWrapper.post('/users/sign-up/kyc', {
        userId: userId,
        kycPayload: kycPayload,
        action: 'kycSuccess'
      })
    ])

    await authStore.syncWithAuthToken()
    router.push("/dashboard")
  } catch (err) {
    errorMessage.value = t('auth.errors.kycFailed', { error: err.message || t('auth.errors.unknown') })
  } finally {
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-bg.jpg"],
}
</script>

