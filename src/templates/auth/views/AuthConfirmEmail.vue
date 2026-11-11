<template>
  <!-- confirm-email-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <!-- Heading -->
      <!-- Back button (popup only) -->
      <button v-if="popupGoBack" @click="popupGoBack" type="button"
        class="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit mb-2 group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span class="text-sm font-medium">{{ t('auth.common.back') }}</span>
      </button>
      <Heading :text="t('auth.confirmEmail.title')" tag="h2" theme="AuthHeading" />

      <div v-if="usesEmailVerifyLink" class="flex flex-col gap-6">
        <p class="text-base font-medium text-white">
          {{ t('auth.confirmEmail.auth0LinkSubtitle') }}
        </p>
        <p class="text-sm text-white/80">
          {{ t('auth.confirmEmail.auth0LinkHelp') }}
        </p>
        <button
          type="button"
          @click="handleResendCode"
          :disabled="isResending || isLoading"
          class="text-sm text-white/80 hover:text-white underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-fit"
        >
          {{ resendButtonText }}
        </button>
        <p v-if="resendSuccessMessage"
          class="text-sm text-green-300 bg-green-900/30 border border-green-500/40 rounded-md px-3 py-2">
          {{ resendSuccessMessage }}
        </p>
        <DashboardPrimaryButton
          :text="t('auth.confirmEmail.backToLogin')"
          variant="authPink"
          size="lg"
          @click="goToLogin"
        />
      </div>

      <form v-else @submit.prevent="handleConfirm" class="flex flex-col gap-8">
        <!-- <Paragraph :text="t('auth.confirmEmail.subtitle')" font-size="text-base" font-weight="font-medium"
          font-color="text-white" /> -->

        <!-- Email input -->
        <div v-if="isEmailMissing">
          <AuthTextInput :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.confirmEmail.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.confirmEmail.emailLabel')" data-required="true" required-display="italic-text"
            type="email" :show-errors="emailErrors.length > 0" :errors="emailErrors" />
        </div>

        <!-- Confirmation Code input -->
        <div class="flex flex-col gap-2">
          <AuthCodeInput ref="codeInputRef" id="confirmEmailCode" :model-value="code"
            @update:model-value="handleCodeInput" @update:is-valid="handleCodeValidityChange"
            @auto-submit="handleAutoSubmit" show-label :label-text="t('auth.confirmEmail.codeLabel')"
            data-required="true" required-display="italic-text" :show-errors="codeErrors.length > 0"
            :errors="codeErrors" :disabled="isSubmitting" :is-submitting="isSubmitting" />

          <!-- Resend Code Button -->
          <div class="flex justify-start">
            <button type="button" @click="handleResendCode" :disabled="isResending || isLoading || isSubmitting"
              class="text-sm text-white/80 hover:text-white underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ resendButtonText }}
            </button>
          </div>

          <!-- Resend Success Message -->
          <p v-if="resendSuccessMessage"
            class="text-sm text-green-300 bg-green-900/30 border border-green-500/40 rounded-md px-3 py-2">
            {{ resendSuccessMessage }}
          </p>
        </div>

        <!-- Confirm button -->
        <DashboardPrimaryButton :text="buttonText" variant="authPink" size="lg"
          :disabled="isLoading || isSubmitting || !isAuthFormReady || !isCodeValid" type="submit" />
      </form>

      <!-- Error message -->
      <p v-if="errorMessage" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount, inject, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/systems/i18n/localeManager.js"
import { authHandler } from "@/dev/utils/auth/authHandler"
import { loadAuthPageAssets, usesEmailLinkVerification } from '@/dev/utils/auth/authPageAssets.js'
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon } from "@heroicons/vue/24/outline"
import AuthTextInput from "@/components/forms/inputs/AuthTextInput.vue"
import AuthCodeInput from "@/components/forms/inputs/AuthCodeInput.vue"
import Heading from "@/components/ui/typography/Heading.vue"
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const { t, locale: i18nLocale } = useI18n()
const email = ref("")
const code = ref("")
const errorMessage = ref("")
const isLoading = ref(false)
const isSubmitting = ref(false)
const isCodeValid = ref(false)
const isResending = ref(false)
const resendSuccessMessage = ref("")
const isAuthFormReady = ref(false)
const isEmailMissing = ref(false)
const router = useRouter()
const route = useRoute()
const assetHandler = ref(null)
const codeInputRef = ref(null)
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)
const usesEmailVerifyLink = usesEmailLinkVerification()

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes
watch(i18nLocale, (newLocale, oldLocale) => {
  console.log(`[CONFIRM_EMAIL] Locale changed from '${oldLocale}' to '${newLocale}'`)
}, { immediate: true })

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const getLoadingText = () => {
    return t('auth.common.loading')
  }

  if (isLoading.value || isSubmitting.value) {
    return getLoadingText()
  }
  if (!isAuthFormReady.value) {
    return getLoadingText()
  }
  return t('auth.confirmEmail.button')
})

// Computed resend button text with proper translation fallback
const resendButtonText = computed(() => {
  if (isResending.value) {
    const text = t('auth.confirmEmail.resending')
    if (text && text !== 'auth.confirmEmail.resending') return text
    return 'Resending...'
  }
  const text = t('auth.confirmEmail.resendCode')
  if (text && text !== 'auth.confirmEmail.resendCode') return text
  return 'Resend Code'
})

// Validation scope
const SCOPE_ID = 'confirmEmailForm'
const hasAttemptedSubmit = ref(false)

// Field configurations
const emailConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'email',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.emailRequired'),
    rules: [
      { type: 'isEmail', message: t('auth.validation.emailInvalid') }
    ]
  },
  validateOnInput: false
}))

const codeConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'confirmEmailCode',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.confirmationCodeRequired'),
    rules: [
      { type: 'minLength', param: 6, message: t('auth.validation.codeSixDigits') },
      { type: 'maxLength', param: 6, message: t('auth.validation.codeSixDigits') }
    ]
  },
  validateOnInput: false
}))

// Get field states
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value))
const codeState = computed(() => interactionsEngine.getFieldState(codeConfig.value))

// Map validation errors
const emailErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!emailState.value || emailState.value.isValid) return []
  return emailState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

const codeErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!codeState.value || codeState.value.isValid) return []
  return codeState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

// Preload auth section translations and load auth page assets
onMounted(async () => {
  console.log(`[CONFIRM_EMAIL] Component mounted, current locale: ${locale.value}`)

  try {
    const { assetHandler: handler, isReady } = await loadAuthPageAssets('AuthConfirmEmail')
    assetHandler.value = handler
    isAuthFormReady.value = isReady
  } catch (assetError) {
    console.error('[CONFIRM_EMAIL] Asset loading failed:', assetError)
    errorMessage.value = t('auth.errors.assetLoadFailed')
  }

  // Pre-fill email from sessionStorage or URL query
  const pendingEmail = sessionStorage.getItem('pendingSignupEmail') || route.query.email
  if (pendingEmail) {
    email.value = pendingEmail
  } else if (!usesEmailVerifyLink) {
    isEmailMissing.value = true
  }

  if (!email.value) {
    email.value = ''
  }

  if (!usesEmailVerifyLink) {
    if (isEmailMissing.value) {
      const emailElement = document.getElementById('email')
      interactionsEngine.register(emailConfig.value, email.value, emailElement)
    }

    await nextTick()
    const codeElement = document.getElementById('confirmEmailCode')
    interactionsEngine.register(codeConfig.value, code.value || '', codeElement)
    console.log('[CONFIRM_EMAIL] Validation engine initialized')
  }
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
  interactionsEngine.clearScope(SCOPE_ID)
})

const handleEmailInput = (value) => {
  email.value = value
  const state = interactionsEngine.getFieldState(emailConfig.value)
  if (state) {
    state.value = value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleCodeInput = (value) => {
  code.value = value

  const state = interactionsEngine.getFieldState(codeConfig.value)
  if (state) {
    state.value = value
    if (state.element) {
      state.element.value = value
      state.element.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(codeConfig.value)
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleCodeValidityChange = (isValid) => {
  isCodeValid.value = isValid
}

const handleAutoSubmit = async (codeValue) => {
  if (isSubmitting.value || isLoading.value) return

  console.log('[CONFIRM_EMAIL] Auto-submit triggered with code:', codeValue)
  code.value = codeValue

  // Set submitting state to disable inputs
  isSubmitting.value = true

  // Trigger the confirmation
  await performConfirmation()
}

const handleResendCode = async () => {
  if (isResending.value || isLoading.value || isSubmitting.value) return

  errorMessage.value = ""
  resendSuccessMessage.value = ""

  const targetEmail = email.value?.trim() || sessionStorage.getItem('pendingSignupEmail')?.trim()
  if (!targetEmail) {
    errorMessage.value = t('auth.confirmEmail.emailRequired')
    return
  }

  if (!email.value) {
    email.value = targetEmail
  }

  isResending.value = true

  try {
    console.log('[CONFIRM_EMAIL] Resending confirmation code to:', targetEmail)
    await authHandler.resendConfirmationCode(targetEmail)
    console.log('[CONFIRM_EMAIL] Confirmation email resent successfully')
    resendSuccessMessage.value = t('auth.confirmEmail.resendSuccess')
    setTimeout(() => {
      resendSuccessMessage.value = ""
    }, 5000)
  } catch (err) {
    console.error('[CONFIRM_EMAIL] Resend error:', err)
    errorMessage.value = err?.message || t('auth.confirmEmail.resendError')
  } finally {
    isResending.value = false
  }
}

function goToLogin() {
  const loginQuery = email.value?.trim()
    ? { email: email.value.trim() }
    : undefined

  if (popupNavHandler) {
    popupNavHandler(loginQuery ? `/log-in?email=${encodeURIComponent(loginQuery.email)}` : '/log-in')
    return
  }

  router.push(loginQuery ? { path: '/log-in', query: loginQuery } : '/log-in')
}

async function performConfirmation() {
  errorMessage.value = ""

  // Ensure we have an email address
  if (!email.value || !email.value.trim()) {
    errorMessage.value = t('auth.errors.emailMissing')
    isLoading.value = false
    isSubmitting.value = false
    return
  }

  try {
    console.log("[CONFIRM_EMAIL] Confirming email:", email.value.trim())

    // Get user ID (might need to fetch if not in cookies/local storage yet)
    const userId = await userIdUtility.getUserId()

    // Confirm email with code and track in parallel
    await Promise.all([
      authHandler.confirmSignUp(email.value.trim(), code.value.trim()),
      apiWrapper.post('/users/confirm-email', {
        userId: userId,
        action: 'confirmEmail'
      })
    ])

    console.log("[CONFIRM_EMAIL] Email confirmed and tracked successfully")

    sessionStorage.removeItem('pendingSignupPassword')
    sessionStorage.removeItem('pendingSignupEmail')

    const loginQuery = {
      email: email.value.trim(),
      emailConfirmed: '1',
    }
    console.log("[CONFIRM_EMAIL] Redirecting to login after confirmation")
    isLoading.value = false
    isSubmitting.value = false
    if (popupNavHandler) {
      popupNavHandler(`/log-in?email=${encodeURIComponent(loginQuery.email)}&emailConfirmed=1`)
    } else {
      await router.push({ path: '/log-in', query: loginQuery })
    }
  } catch (err) {
    console.error("[CONFIRM_EMAIL] Confirmation error:", err)

    // Re-enable inputs and clear code
    isLoading.value = false
    isSubmitting.value = false

    // Clear code inputs on error
    if (codeInputRef.value) {
      codeInputRef.value.clearInputs()
    }

    // Show error message
    errorMessage.value = err?.message || t('auth.confirmEmail.error')
  }
}

async function handleConfirm() {
  if (isLoading.value || isSubmitting.value) return

  errorMessage.value = ""
  hasAttemptedSubmit.value = true

  // Validate form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log('[CONFIRM_EMAIL] Form validation failed - blocking API call:', validationResult?.invalidFields || 'No validation result')

    // Find first invalid field - check fields in order, only move to next if current is fully valid
    let firstInvalidField = null
    const fieldOrder = isEmailMissing.value ? ['email', 'code'] : ['code']

    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })
      if (fieldState && !fieldState.isValid) {
        // Found first invalid field - stop checking
        firstInvalidField = { fieldId }
        break
      }
      // If field is valid, continue to next field
    }

    if (firstInvalidField) {
      const firstInvalidFieldId = firstInvalidField.fieldId
      const firstInvalidFieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: firstInvalidFieldId })

      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element

        // Remove 'first-invalid' class from all fields first
        const allFields = isEmailMissing.value ? ['email', 'code'] : ['code']
        allFields.forEach(fieldId => {
          const fieldElement = document.getElementById(fieldId)
          if (fieldElement) {
            fieldElement.classList.remove('first-invalid')
          }
        })

        // Add 'first-invalid' class to first invalid field
        element.classList.add('first-invalid')

        // Get first non-required error if available, otherwise use first error
        const nonRequiredError = firstInvalidFieldState.failedRules?.find(rule => rule.type !== 'required')
        const firstError = nonRequiredError || firstInvalidFieldState.failedRules?.[0]
        // For email validation errors, always use the standard message
        let fieldErrorMessage = firstError?.message || t('auth.validation.fixField')
        if (firstInvalidFieldId === 'email' && firstError?.type === 'isEmail') {
          fieldErrorMessage = 'Please enter a valid email address'
        }

        // Get the correct field config based on fieldId
        const fieldConfig = firstInvalidFieldId === 'email' ? emailConfig.value : codeConfig.value

        // Use interactionsEngine's showBrowserError action
        interactionsEngine.runInteractions(
          [{
            type: 'showBrowserError',
            message: fieldErrorMessage
          }],
          fieldConfig
        )

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()

        console.log('[CONFIRM_EMAIL] First invalid field:', firstInvalidFieldId, element)
      }
    }

    // Ensure we don't set loading state if validation fails
    isLoading.value = false
    return // Exit early
  }

  // Only proceed if validation passed - set loading state
  console.log('[CONFIRM_EMAIL] Form validation passed, proceeding with confirmation')

  // For manual submit, only set loading (not submitting, so inputs stay enabled)
  isLoading.value = true

  await performConfirmation()
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
}
</script>
