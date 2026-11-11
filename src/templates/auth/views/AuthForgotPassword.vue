<template>
  <!-- forgot-password-container -->
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

        <Heading :text="t('auth.reset.forgotTitle')" tag="h2" theme="AuthHeading" />
      </div>

      <form @submit.prevent="handleForgotPasswordSubmit" class="flex flex-col gap-8" novalidate>
        <div class="flex flex-col gap-4">
          <AuthTextInput :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.register.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.register.emailLabel')" data-required="true" required-display="italic-text" type="text"
            :show-errors="emailErrors.length > 0" :errors="emailErrors" />

          </div>
          
          <CloudflareSuccess :show="true" />

        <!-- Error message -->
        <p v-if="errorMessage" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <!-- Success message -->
        <p v-if="successMessage"
          class="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-500/40 rounded-md px-3 py-2">
          {{ successMessage }}
        </p>

        <!-- submit button -->
        <DashboardPrimaryButton :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isAuthFormReady"
          type="submit" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, inject } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/systems/i18n/localeManager.js"
import { authHandler } from "@/dev/utils/auth/authHandler"
import { loadAuthPageAssets } from '@/dev/utils/auth/authPageAssets.js'
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon } from "@heroicons/vue/24/outline"
import { useAssetUrl } from "@/composables/useAssetUrl.js"
import Heading from "@/components/ui/typography/Heading.vue"
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue"
import AuthTextInput from "@/components/forms/inputs/AuthTextInput.vue"
import CloudflareSuccess from "@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue"

const { t, locale: i18nLocale } = useI18n()
const route = useRoute()
const router = useRouter()
const { url: backToLoginIconUrl } = useAssetUrl('auth.icon.backToLogin')

const email = ref("")
const successMessage = ref("")
const errorMessage = ref("")
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

// Validation scope
const SCOPE_ID = 'forgotPasswordForm'

// Track if form has been submitted to control when to show errors
const hasAttemptedSubmit = ref(false)

// Field configuration with translated validation messages
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

// Get field state from the engine
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value))

// Map validation errors to AuthTextInput format
// Only show errors after submit has been attempted
const emailErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!emailState.value || emailState.value.isValid) return []
  return emailState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return // Skip initial or no-op changes

  console.log(`[FORGOT PASSWORD] Locale changed from '${oldLocale}' to '${newLocale}'`)

  // Update validation configs in field states
  const emailState = interactionsEngine.getFieldState(emailConfig.value)

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity('')
    }
    emailState.validationConfig = emailConfig.value.validation
    // Re-validate if field was already validated to update error messages
    if (hasAttemptedSubmit.value && !emailState.isValid) {
      interactionsEngine.validateField(emailConfig.value)
      // Update browser error message if field is still invalid
      if (!emailState.isValid && emailState.element) {
        const firstError = emailState.failedRules?.[0]
        if (firstError?.message && emailState.element.setCustomValidity) {
          emailState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }
})

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const getLoadingText = () => {
    return t('auth.common.loading')
  }

  if (isLoading.value) {
    return getLoadingText()
  }
  if (!isAuthFormReady.value) {
    return getLoadingText()
  }
  return t('auth.reset.submit')
})

// Preload auth section translations and load auth page assets
onMounted(async () => {
  console.log(`[FORGOT PASSWORD] Component mounted, current locale: ${locale.value}`)

  try {
    const { assetHandler: handler, isReady } = await loadAuthPageAssets('AuthForgotPassword')
    assetHandler.value = handler
    isAuthFormReady.value = isReady
  } catch (assetError) {
    console.error('[FORGOT PASSWORD] Asset loading failed:', assetError)
    errorMessage.value = t('auth.errors.assetLoadFailed')
  }

  // Register field with validation engine
  const emailElement = document.getElementById('email')
  interactionsEngine.register(emailConfig.value, email.value, emailElement)

  // Prevent browser's native invalid event from showing popup during typing
  // We only want to show browser validation on submit via showBrowserError
  if (emailElement) {
    // Prevent invalid event from showing browser popup before submit
    emailElement.addEventListener('invalid', (e) => {
      // Only prevent if we haven't attempted submit yet
      // After submit, we want showBrowserError to control the message
      if (!hasAttemptedSubmit.value) {
        e.preventDefault()
        // Clear any browser validation state
        emailElement.setCustomValidity('')
      }
    }, { capture: true })

    // Also prevent browser validation on blur (some browsers validate on blur)
    emailElement.addEventListener('blur', () => {
      if (!hasAttemptedSubmit.value && emailElement.setCustomValidity) {
        emailElement.setCustomValidity('')
      }
    })
  }

  console.log('[FORGOT PASSWORD] Validation engine initialized')
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
  interactionsEngine.clearScope(SCOPE_ID)
})

// Handle input changes - only update values, validation happens on submit
const handleEmailInput = (value) => {
  email.value = value
  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(emailConfig.value)
  if (state) {
    state.value = value
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  // This prevents browser's native HTML5 validation from showing during typing
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value)
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

async function handleForgotPasswordSubmit() {
  if (isLoading.value) return

  errorMessage.value = ""
  successMessage.value = ""

  // Mark that submit has been attempted (this will show validation errors)
  hasAttemptedSubmit.value = true

  // Validate entire form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log('[FORGOT PASSWORD] Form validation failed - blocking API call:', validationResult?.invalidFields || 'No validation result')

    // Find first invalid field - check fields in order, only move to next if current is fully valid
    let firstInvalidField = null
    const fieldOrder = ['email'] // Check fields in this order

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
        const allFields = ['email']
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
        // Use the custom message from the validation rule
        const fieldErrorMessage = firstError?.message || t('auth.validation.fixField')

        // Clear any existing browser validation before showing our custom error
        // This ensures our custom message is shown instead of browser's default
        if (element.setCustomValidity) {
          element.setCustomValidity('')
        }

        // Use interactionsEngine's showBrowserError action to show custom message
        // This function handles changing type to text, setting custom validity, and showing popup
        interactionsEngine.runInteractions(
          [{
            type: 'showBrowserError',
            message: fieldErrorMessage
          }],
          emailConfig.value
        )

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()

        console.log('[FORGOT PASSWORD] First invalid field:', firstInvalidFieldId, element, 'Custom message:', fieldErrorMessage)
      }
    }

    // Validation errors are shown under each input field, no need for general error message
    // Ensure we don't set loading state if validation fails
    isLoading.value = false
    return // Exit early - do NOT call authHandler.forgotPassword
  }

  // Only proceed if validation passed - set loading state
  console.log('[FORGOT PASSWORD] Form validation passed, proceeding with forgot password')
  isLoading.value = true

  try {
    await authHandler.forgotPassword(email.value)
    successMessage.value = t('auth.reset.codeSent')
    // Redirect to reset-password with prefilled email
    if (popupNavHandler) {
      popupNavHandler(`/reset-password?email=${encodeURIComponent(email.value)}`)
    } else {
      setTimeout(() => router.push({ path: "/reset-password", query: { email: email.value } }), 600)
    }
  } catch (err) {
    console.error("[FORGOT PASSWORD] Forgot password failed:", err)
    errorMessage.value = err.message || t('auth.reset.sendCodeError')
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
