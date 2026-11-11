<template>
  <!-- reset-password-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <div class="flex flex-col gap-4">
        <button
          type="button"
          @click="onBackToLogin"
          class="opacity-70 inline-flex justify-start items-center gap-2 w-fit cursor-pointer"
        >
          <img
            v-if="backToLoginIconUrl"
            :src="backToLoginIconUrl"
            :alt="t('auth.reset.backToLogin')"
            class="w-2 h-3 object-contain"
          />
          <span class="justify-start text-white text-base font-normal font-['Poppins'] leading-6 tracking-tight">
            {{ t('auth.reset.backToLogin') }}
          </span>
        </button>

        <Heading :text="t('auth.reset.title')" tag="h2" theme="AuthHeading" />
      </div>

      <!-- Success step: after submit -->
      <div v-if="isResetComplete" class="flex flex-col gap-8 w-full">
        <div class="text-white text-lg font-normal leading-7">
          {{ t('auth.reset.successDone') }}
        </div>
        <DashboardPrimaryButton
          :text="t('auth.reset.backToLoginButton')"
          variant="authPink"
          size="lg"
          type="button"
          @click="onBackToLogin"
        />
      </div>

      <form
        v-else
        @submit.prevent="handleResetPasswordSubmit"
        class="flex flex-col gap-8"
        novalidate
      >
        <div class="flex flex-col gap-4">
          <AuthTextInput
            :model-value="newPassword"
            @update:model-value="handleNewPasswordInput"
            :placeholder="t('auth.fields.newPasswordPlaceholder')"
            id="newPassword"
            show-label
            :label-text="t('auth.fields.newPasswordLabel')"
            data-required="true"
            required-display="italic-text"
            :type="passwordInputType"
            :right-icon="passwordEyeIcon"
            @click:right-icon="togglePasswordVisibility"
            :show-errors="passwordErrors.length > 0"
            :errors="passwordErrors"
            :success="passwordSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
          />

          <AuthTextInput
            :model-value="confirmPassword"
            @update:model-value="handleConfirmPasswordInput"
            :placeholder="t('auth.fields.confirmNewPasswordPlaceholder')"
            id="confirmPassword"
            show-label
            :label-text="t('auth.fields.confirmNewPasswordLabel')"
            data-required="true"
            required-display="italic-text"
            :type="confirmPasswordInputType"
            :right-icon="confirmPasswordEyeIcon"
            @click:right-icon="toggleConfirmPasswordVisibility"
            :show-errors="confirmPasswordErrors.length > 0"
            :errors="confirmPasswordErrors"
            :success="confirmPasswordSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
          />
        </div>

        <CloudflareSuccess :show="true" />

        <p v-if="errorMessage" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <DashboardPrimaryButton
          :text="buttonText"
          variant="authPink"
          size="lg"
          :disabled="isLoading || !isAuthFormReady"
          type="submit"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, inject } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { authHandler } from "@/dev/utils/auth/authHandler"
import { loadAuthPageAssets } from '@/dev/utils/auth/authPageAssets.js'
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { useAssetUrl } from "@/composables/useAssetUrl.js"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"
import Heading from "@/components/ui/typography/Heading.vue"
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue"
import AuthTextInput from "@/components/forms/inputs/AuthTextInput.vue"
import CloudflareSuccess from "@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue"

const { t, locale: i18nLocale } = useI18n()
const route = useRoute()
const router = useRouter()
const { url: backToLoginIconUrl } = useAssetUrl('auth.icon.backToLogin')
const { url: validationSuccessIconUrl } = useAssetUrl('auth.icon.validationSuccess')
const { url: validationErrorIconUrl } = useAssetUrl('auth.icon.validationError')

const props = defineProps({
  prefilledEmail: { type: String, default: '' }
})

/** Email only for API (query / popup) — no email field in UI */
const emailForReset = computed(() =>
  route.query.email ? String(route.query.email) : (props.prefilledEmail || "")
)

const newPassword = ref("")
const confirmPassword = ref("")
const errorMessage = ref("")
const isResetComplete = ref(false)
const isLoading = ref(false)
const isAuthFormReady = ref(false)
const assetHandler = ref(null)
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

const onBackToLogin = () => {
  if (popupNavHandler) {
    popupNavHandler('/log-in')
    return
  }
  if (popupGoBack) {
    popupGoBack()
    return
  }
  router.push('/log-in')
}

const SCOPE_ID = 'resetPasswordForm'
const hasAttemptedSubmit = ref(false)

const passwordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'newPassword',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.passwordRequired'),
    rules: [
      { type: 'minLength', param: 8, message: t('auth.validation.passwordMinLength') },
      { type: 'hasLower', message: t('auth.validation.passwordHasLower') },
      { type: 'hasUpper', message: t('auth.validation.passwordHasUpper') },
      { type: 'hasNumber', message: t('auth.validation.passwordHasNumber') },
      { type: 'hasSpecial', message: t('auth.validation.passwordHasSpecial') },
    ]
  },
  validateOnInput: true,
  ui: {
    dynamicType: 'password',
    visibilityMetaKey: 'passwordVisible',
  },
}))

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'confirmPassword',
  dependsOn: ['newPassword'],
  validation: {
    required: true,
    requiredMessage: t('auth.validation.confirmPasswordRequired'),
    rules: [
      {
        type: 'matchValue',
        param: 'newPassword',
        message: t('auth.validation.confirmPasswordMatch'),
      },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: 'password',
    visibilityMetaKey: 'confirmPasswordVisible',
  },
}))

const passwordState = computed(() => interactionsEngine.getFieldState(passwordConfig.value))
const confirmPasswordState = computed(() => interactionsEngine.getFieldState(confirmPasswordConfig.value))

const passwordVisibilityTick = ref(0)
const confirmPasswordVisibilityTick = ref(0)
const passwordInputType = computed(() => {
  passwordVisibilityTick.value
  return interactionsEngine.getInputType(passwordConfig.value, 'password')
})
const confirmPasswordInputType = computed(() => {
  confirmPasswordVisibilityTick.value
  return interactionsEngine.getInputType(confirmPasswordConfig.value, 'password')
})
const passwordEyeIcon = computed(() =>
  passwordInputType.value === 'text' ? EyeIcon : EyeSlashIcon
)
const confirmPasswordEyeIcon = computed(() =>
  confirmPasswordInputType.value === 'text' ? EyeIcon : EyeSlashIcon
)
function togglePasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: 'toggleFieldMeta', metaKey: 'passwordVisible' }],
    passwordConfig.value
  )
  passwordVisibilityTick.value += 1
}
function toggleConfirmPasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: 'toggleFieldMeta', metaKey: 'confirmPasswordVisible' }],
    confirmPasswordConfig.value
  )
  confirmPasswordVisibilityTick.value += 1
}

const getValidationMessages = (fieldState, fieldConfig) => {
  if (!fieldState || !fieldConfig) return { errors: [], success: [] }

  const rules = (fieldState.validationConfig || fieldConfig.validation || {}).rules || []
  const failedTypes = new Set((fieldState.failedRules || []).map(r => r.type))
  const errors = [], success = []
  const successIcon = validationSuccessIconUrl.value
  const errorIcon = validationErrorIconUrl.value

  rules.forEach(rule => {
    const isFailed = failedTypes.has(rule.type)
    if (isFailed && (rule.type !== 'required' || hasAttemptedSubmit.value)) {
      errors.push({
        error: rule.message,
        icon: errorIcon,
      })
    } else if (!isFailed) {
      success.push({
        message: rule.message,
        icon: successIcon,
        iconColor: 'text-white',
        textColor: 'text-white',
      })
    }
  })

  return { errors, success }
}

const passwordErrors = computed(() => getValidationMessages(passwordState.value, passwordConfig.value).errors)
const passwordSuccess = computed(() => {
  if (!newPassword.value?.trim()) return []
  return getValidationMessages(passwordState.value, passwordConfig.value).success
})

/** Confirm errors from interactionsEngine.failedRules only */
const confirmPasswordErrors = computed(() => {
  if (!confirmPassword.value?.trim()) {
    if (!hasAttemptedSubmit.value) return []
    return [{
      error: t('auth.validation.confirmPasswordRequired'),
      icon: validationErrorIconUrl.value,
    }]
  }
  if (!confirmPasswordState.value || confirmPasswordState.value.isValid) return []
  return (confirmPasswordState.value.failedRules || [])
    .filter((rule) => rule.type !== 'required' || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: validationErrorIconUrl.value,
    }))
})

/** Success only when engine says confirm field is valid */
const confirmPasswordSuccess = computed(() => {
  if (!confirmPassword.value?.trim() || !newPassword.value?.trim()) return []
  if (!confirmPasswordState.value?.isValid) return []
  return [{
    message: t('auth.validation.confirmPasswordMatchSuccess'),
    icon: validationSuccessIconUrl.value,
    iconColor: 'text-white',
    textColor: 'text-white',
  }]
})

const buttonText = computed(() => {
  if (isLoading.value || !isAuthFormReady.value) {
    return t('auth.common.loading')
  }
  return t('auth.reset.submit')
})

watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return

  const pwdState = interactionsEngine.getFieldState(passwordConfig.value)
  const confirmState = interactionsEngine.getFieldState(confirmPasswordConfig.value)

  if (pwdState) {
    if (pwdState.element?.setCustomValidity) pwdState.element.setCustomValidity('')
    pwdState.validationConfig = passwordConfig.value.validation
    if (!pwdState.isValid) interactionsEngine.validateField(passwordConfig.value)
  }

  if (confirmState) {
    if (confirmState.element?.setCustomValidity) confirmState.element.setCustomValidity('')
    confirmState.validationConfig = confirmPasswordConfig.value.validation
    if (!confirmState.isValid) interactionsEngine.validateField(confirmPasswordConfig.value)
  }
})

onMounted(async () => {
  try {
    const { assetHandler: handler, isReady } = await loadAuthPageAssets('AuthResetPassword')
    assetHandler.value = handler
    isAuthFormReady.value = isReady
  } catch (assetError) {
    console.error('[RESET PASSWORD] Asset loading failed:', assetError)
    errorMessage.value = t('auth.errors.assetLoadFailed')
  }

  const passwordElement = document.getElementById('newPassword')
  const confirmPasswordElement = document.getElementById('confirmPassword')
  interactionsEngine.register(passwordConfig.value, newPassword.value, passwordElement)
  interactionsEngine.register(confirmPasswordConfig.value, confirmPassword.value, confirmPasswordElement)
})

onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
  interactionsEngine.clearScope(SCOPE_ID)
})

const handleNewPasswordInput = (value) => {
  newPassword.value = value
  interactionsEngine.processFieldChange(passwordConfig.value, value)
  const state = interactionsEngine.getFieldState(passwordConfig.value)
  if (state?.element?.setCustomValidity) state.element.setCustomValidity('')
  if (state?.isValid && state?.element) state.element.classList.remove('first-invalid')

  // Re-check confirm match when new password changes
  const confirmState = interactionsEngine.getFieldState(confirmPasswordConfig.value)
  if (confirmState && confirmPassword.value) {
    interactionsEngine.processFieldChange(confirmPasswordConfig.value, confirmPassword.value)
  }
}

const handleConfirmPasswordInput = (value) => {
  confirmPassword.value = value
  interactionsEngine.processFieldChange(confirmPasswordConfig.value, value)
  const state = interactionsEngine.getFieldState(confirmPasswordConfig.value)
  if (state?.element?.setCustomValidity) state.element.setCustomValidity('')
  if (state?.isValid && state?.element) state.element.classList.remove('first-invalid')
}

async function handleResetPasswordSubmit() {
  if (isLoading.value) return

  errorMessage.value = ""
  hasAttemptedSubmit.value = true

  const validationResult = interactionsEngine.validateScope(SCOPE_ID)
  if (!validationResult || !validationResult.isValid) {
    let firstInvalidField = null
    const fieldOrder = ['newPassword', 'confirmPassword']
    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })
      if (fieldState && !fieldState.isValid) {
        firstInvalidField = { fieldId }
        break
      }
    }

    if (firstInvalidField) {
      const firstInvalidFieldState = interactionsEngine.getFieldState({
        scope: SCOPE_ID,
        id: firstInvalidField.fieldId,
      })
      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element
        ;['newPassword', 'confirmPassword'].forEach((id) => {
          document.getElementById(id)?.classList.remove('first-invalid')
        })
        element.classList.add('first-invalid')

        const nonRequiredError = firstInvalidFieldState.failedRules?.find(rule => rule.type !== 'required')
        const firstError = nonRequiredError || firstInvalidFieldState.failedRules?.[0]
        const fieldErrorMessage = firstError?.message || t('auth.validation.fixField')

        const fieldConfig =
          firstInvalidField.fieldId === 'newPassword'
            ? passwordConfig.value
            : confirmPasswordConfig.value

        interactionsEngine.runInteractions(
          [{ type: 'showBrowserError', message: fieldErrorMessage }],
          fieldConfig,
        )
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    return
  }

  isLoading.value = true
  try {
    await authHandler.confirmPassword(emailForReset.value, '', newPassword.value)
    isResetComplete.value = true
  } catch (err) {
    errorMessage.value = err.message || t('auth.reset.error')
  } finally {
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
}
</script>
