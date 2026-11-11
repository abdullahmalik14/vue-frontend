<template>
  <!-- signup-onboarding-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-8">
      <!-- heading -->
      <!-- Back button (popup only) -->
      <button v-if="popupGoBack" @click="popupGoBack" type="button"
        class="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit mb-2 group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span class="text-sm font-medium">{{ t('auth.common.back') }}</span>
      </button>
      <Heading :text="t('auth.register.onboarding.title')" tag="h2" theme="AuthHeading" />
      <Paragraph :text="t('auth.register.onboarding.description')" font-size="text-base" font-weight="font-normal"
        font-color="text-white" />

      <form @submit.prevent="completeOnboarding" class="flex flex-col gap-8">
        <div class="flex flex-col gap-4">
          <!-- Role -->
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center w-full">
              <label for="role" class="text-sm leading-6 tracking-[0.009rem] text-[#ffffff]">
                {{ t('auth.register.onboarding.roleLabel') }}
              </label>
            </div>
            <div class="relative" ref="dropdownContainer">
              <div @click="handleToggleRoleDropdown"
                class="relative rounded-xl border border-dee5ec bg-white/20 min-h-12 gap-2.5 py-3 px-2.5 flex justify-between items-center self-stretch cursor-pointer hover:bg-white/10 transition-colors shadow-sm"
                :class="{ 'border-white/40': isDropdownOpen }">

                <span class="text-white">
                  {{ selectedRole
                    ? getRoleLabel(selectedRole)
                    : t('auth.register.onboarding.rolePlaceholder') }}
                </span>

                <svg class="w-5 h-5 text-white transition-transform duration-200"
                  :class="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div v-if="isDropdownOpen"
                class="absolute z-50 w-full mt-1 overflow-hidden rounded-lg border border-gray-500/30 bg-[#181a1b]/80 backdrop-blur-xl shadow-xl">
                <div class="flex flex-col py-1">
                  <div v-for="role in roles" :key="role.value" @click="handleRoleSelect(role.value)"
                    class="px-4 py-3 text-white cursor-pointer transition-colors hover:bg-white/10 flex items-center justify-between group"
                    :class="{ 'bg-white/5': selectedRole === role.value }">
                    <span class="font-medium">{{ role.label }}</span>
                    <svg v-if="selectedRole === role.value" class="w-4 h-4 text-accent-pink-light" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <select v-show="false" :value="selectedRole" id="role" data-required="true">
                <option value="" disabled>{{ t('auth.register.onboarding.rolePlaceholder') }}</option>
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </div>
            <IconMessageList
              :show-errors="roleErrors.length > 0"
              :errors="roleErrors"
              error-icon-class="w-3.5 h-4"
            />
          </div>

          <!-- Username -->
          <AuthTextInput :model-value="username" @update:model-value="handleUsernameInput"
            :placeholder="t('auth.register.onboarding.usernamePlaceholder')" id="username" show-label
            :label-text="t('auth.register.onboarding.usernameLabel')" data-required="true" required-display="italic-text"
            type="text" placeholder-color="placeholder:text-[#FFFFFFB2]"
            :show-errors="usernameErrors.length > 0" :errors="usernameErrors" :success="usernameSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
            :disabled="isLoading" />

          <!-- Display Name -->
          <AuthTextInput :model-value="displayName" @update:model-value="handleDisplayNameInput"
            :placeholder="t('auth.register.onboarding.displayNamePlaceholder')" id="displayName" show-label
            :label-text="t('auth.register.onboarding.displayNameLabel')" data-required="true" required-display="italic-text"
            type="text" placeholder-color="placeholder:text-[#FFFFFFB2]"
            :show-errors="displayNameErrors.length > 0" :errors="displayNameErrors" :success="displayNameSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
            :disabled="isLoading" />
        </div>

        <CheckboxGroup
          v-model="agreedToTerms"
          :label="t('auth.register.onboarding.termsAgree')"
          checkboxClass="m-0 border border-white [appearance:none] w-4 h-4 rounded bg-transparent relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-1/2 checked:[&::after]:top-[45%] checked:[&::after]:-translate-x-1/2 checked:[&::after]:-translate-y-1/2 checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
          labelClass="text-white text-sm leading-normal cursor-pointer font-normal"
          wrapperClass="flex items-start gap-2"
          :disabled="isLoading"
        />

        <CloudflareSuccess variant="login" :show="true" />

        <p v-if="errorMessage" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <DashboardPrimaryButton :text="buttonText" variant="authPink" size="lg" type="submit"
          :disabled="isLoading || !isAuthFormReady || isCheckingUsername" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, inject } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { authHandler } from "@/dev/utils/auth/authHandler"
import {
  buildOnboardingLocalUpdates,
  buildOnboardingProfileAttributes,
} from '@/dev/utils/auth/authProfileAttributes.js'
import { createAssetHandler } from "@/systems/assets/assetHandlerFactory.js"
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/systems/i18n/localeManager.js"
import { useAssetUrl } from "@/composables/useAssetUrl.js"
import Heading from "@/components/ui/typography/Heading.vue"
import Paragraph from "@/components/ui/typography/Paragraph.vue"
import AuthTextInput from "@/components/forms/inputs/AuthTextInput.vue"
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue"
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue"
import CloudflareSuccess from "@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue"
import IconMessageList from "@/components/ui/list/IconMessageList.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const router = useRouter()
const authStore = useAuthStore()
const { t, locale: i18nLocale } = useI18n()
const { url: validationSuccessIconUrl } = useAssetUrl('auth.icon.validationSuccess')
const { url: validationErrorIconUrl } = useAssetUrl('auth.icon.validationError')
const errorMessage = ref("")
const username = ref("")
const displayName = ref("")
const agreedToTerms = ref(false)
const selectedRole = ref("")
const isLoading = ref(false)
const isAuthFormReady = ref(false)
const assetHandler = ref(null)
const isCheckingUsername = ref(false)
const isUsernameTaken = ref(false)
let usernameDebounceTimer = null
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownContainer = ref(null)

const roles = computed(() => [
  { value: 'creator', label: t('auth.register.onboarding.roles.creator') },
  { value: 'fan', label: t('auth.register.onboarding.roles.fan') },
  { value: 'vendor', label: t('auth.register.onboarding.roles.vendor') },
  { value: 'agent', label: t('auth.register.onboarding.roles.agent') }
])

const getRoleLabel = (value) => {
  const role = roles.value.find(r => r.value === value)
  return role ? role.label : value
}

const handleToggleRoleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleRoleSelect = (value) => {
  selectedRole.value = value
  isDropdownOpen.value = false

  // Sync hidden <select> + engine — custom dropdown does not fire native change
  const state = interactionsEngine.getFieldState(roleConfig.value)
  if (state?.element) {
    state.element.value = value
    if (state.element.setCustomValidity) {
      state.element.setCustomValidity('')
    }
  }
  interactionsEngine.processFieldChange(roleConfig.value, value)
  if (state?.element) {
    state.element.classList.remove('first-invalid')
  }
}

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

// Validation scope
const SCOPE_ID = 'onboardingForm'
const hasAttemptedSubmit = ref(false)

// Field configurations with translated validation messages
const roleConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'role',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.roleRequired'),
    rules: [
      { type: 'isSelect', param: '', message: t('auth.validation.roleSelect') }
    ]
  },
  validateOnInput: false
}))

const usernameTakenMessage = computed(() => t('auth.validation.usernameTaken'))

const usernameConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'username',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.usernameRequired'),
    rules: [
      {
        type: 'custom',
        param: (value) =>
          typeof value === 'string' && value.length >= 3 && value.length <= 100,
        message: t('auth.validation.usernameLengthRange'),
      },
      {
        type: 'custom',
        param: (value) =>
          typeof value === 'string' &&
          /^[a-zA-Z0-9]*$/.test(value.replace(/\s/g, '')) &&
          /[a-zA-Z]/.test(value) &&
          /\d/.test(value),
        message: t('auth.validation.usernameAlphanumeric'),
      },
      {
        type: 'custom',
        param: (value) => typeof value === 'string' && !/\s/.test(value),
        message: t('auth.validation.usernameNoSpace'),
      },
      {
        type: 'custom',
        param: () => !isUsernameTaken.value,
        message: usernameTakenMessage.value,
        checklist: false,
      },
    ],
  },
  validateOnInput: true,
}))

const displayNameConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'displayName',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.displayNameRequired'),
    rules: [
      {
        type: 'custom',
        param: (value) =>
          typeof value === 'string' &&
          /^[a-zA-Z!@#$%^&*()_ +]*$/.test(value) &&
          /[a-zA-Z]/.test(value) &&
          /[!@#$%^&*()_ +]/.test(value),
        message: t('auth.validation.displayNameCharset'),
      },
      {
        type: 'custom',
        param: (value) =>
          typeof value === 'string' && value.length > 6 && value.length <= 20,
        message: t('auth.validation.displayNameLengthRange'),
      },
    ],
  },
  validateOnInput: true,
}))

// Sync config and trigger validation when isUsernameTaken changes
watch(usernameConfig, (newConfig) => {
  const state = interactionsEngine.getFieldState(newConfig)
  if (state) {
    state.validationConfig = newConfig.validation
    // Always validate to reflect taken status or clear it
    // Only if we have a value to avoid premature required errors (though validateOnInput=false helps)
    if (state.value) {
      interactionsEngine.validateField(newConfig)
    }
  }
})

// Get field states
const roleState = computed(() => interactionsEngine.getFieldState(roleConfig.value))
const usernameState = computed(() => interactionsEngine.getFieldState(usernameConfig.value))
const displayNameState = computed(() => interactionsEngine.getFieldState(displayNameConfig.value))

/** Match by message — multiple `custom` rules share the same type */
const getChecklistMessages = (fieldState, fieldConfig, { skipSuccessMessages = [] } = {}) => {
  if (!fieldState || !fieldConfig) return { errors: [], success: [] }

  const rules =
    (fieldState.validationConfig || fieldConfig.validation || {}).rules || []
  const failedMessages = new Set(
    (fieldState.failedRules || []).map((r) => r.message)
  )
  const skipSuccess = new Set(skipSuccessMessages)
  const errors = []
  const success = []
  const successIcon = validationSuccessIconUrl.value
  const errorIcon = validationErrorIconUrl.value

  rules.forEach((rule) => {
    const isFailed = failedMessages.has(rule.message)
    if (isFailed) {
      errors.push({
        error: rule.message,
        icon: errorIcon,
      })
      return
    }
    if (rule.checklist === false || skipSuccess.has(rule.message)) return
    success.push({
      message: rule.message,
      icon: successIcon,
      iconColor: 'text-white',
      textColor: 'text-white',
    })
  })

  return { errors, success }
}

const roleErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!roleState.value || roleState.value.isValid) return []
  return (roleState.value.failedRules || []).map((rule) => ({
    error: rule.message,
    icon: validationErrorIconUrl.value,
  }))
})

const usernameErrors = computed(() => {
  if (!username.value?.trim()) {
    if (!hasAttemptedSubmit.value) return []
    return [{
      error: t('auth.validation.usernameRequired'),
      icon: validationErrorIconUrl.value,
    }]
  }
  return getChecklistMessages(usernameState.value, usernameConfig.value).errors
})

const usernameSuccess = computed(() => {
  if (!username.value?.trim()) return []
  return getChecklistMessages(usernameState.value, usernameConfig.value, {
    skipSuccessMessages: [usernameTakenMessage.value],
  }).success
})

const displayNameErrors = computed(() => {
  if (!displayName.value?.trim()) {
    if (!hasAttemptedSubmit.value) return []
    return [{
      error: t('auth.validation.displayNameRequired'),
      icon: validationErrorIconUrl.value,
    }]
  }
  return getChecklistMessages(displayNameState.value, displayNameConfig.value).errors
})

const displayNameSuccess = computed(() => {
  if (!displayName.value?.trim()) return []
  return getChecklistMessages(displayNameState.value, displayNameConfig.value).success
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
  return t('auth.register.onboarding.button')
})

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return // Skip initial or no-op changes

  console.log(`[ONBOARDING] Locale changed from '${oldLocale}' to '${newLocale}'`)

  // Update validation configs in field states
  const roleState = interactionsEngine.getFieldState(roleConfig.value)
  const usernameState = interactionsEngine.getFieldState(usernameConfig.value)
  const displayNameState = interactionsEngine.getFieldState(displayNameConfig.value)

  if (roleState) {
    // Clear any existing browser validation message
    if (roleState.element && roleState.element.setCustomValidity) {
      roleState.element.setCustomValidity('')
    }
    roleState.validationConfig = roleConfig.value.validation
    if (hasAttemptedSubmit.value && !roleState.isValid) {
      interactionsEngine.validateField(roleConfig.value)
      // Update browser error message if field is still invalid
      if (!roleState.isValid && roleState.element) {
        const firstError = roleState.failedRules?.[0]
        if (firstError?.message && roleState.element.setCustomValidity) {
          roleState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }

  if (usernameState) {
    // Clear any existing browser validation message
    if (usernameState.element && usernameState.element.setCustomValidity) {
      usernameState.element.setCustomValidity('')
    }
    usernameState.validationConfig = usernameConfig.value.validation
    if (hasAttemptedSubmit.value && !usernameState.isValid) {
      interactionsEngine.validateField(usernameConfig.value)
      // Update browser error message if field is still invalid
      if (!usernameState.isValid && usernameState.element) {
        const firstError = usernameState.failedRules?.[0]
        if (firstError?.message && usernameState.element.setCustomValidity) {
          usernameState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }

  if (displayNameState) {
    if (displayNameState.element && displayNameState.element.setCustomValidity) {
      displayNameState.element.setCustomValidity('')
    }
    displayNameState.validationConfig = displayNameConfig.value.validation
    if (hasAttemptedSubmit.value && !displayNameState.isValid) {
      interactionsEngine.validateField(displayNameConfig.value)
      if (!displayNameState.isValid && displayNameState.element) {
        const firstError = displayNameState.failedRules?.[0]
        if (firstError?.message && displayNameState.element.setCustomValidity) {
          displayNameState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }
})

// Preload auth section translations
onMounted(async () => {
  console.log(`[ONBOARDING] Component mounted, current locale: ${locale.value}`)

  // Define assets configuration
  const assetsConfig = [
    {
      name: 'onboarding-styles',
      url: '/css/onboarding.css',
      type: 'css',
      critical: true,
      priority: 'high'
    },
    {
      name: 'kyc-bg',
      url: '/images/kyc-status-bg.jpg',
      type: 'image',
      priority: 'normal'
    }
  ]

  assetHandler.value = await createAssetHandler(assetsConfig, {
    name: 'AuthOnboarding',
    debug: true
  })

  try {
    console.log('[ONBOARDING] Loading assets via AssetHandler...')
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map((asset) => asset.name),
      { strict: false },
    )

    console.log('[ONBOARDING] Assets loaded:', result)
    isAuthFormReady.value = true
  } catch (assetError) {
    console.error('[ONBOARDING] Asset loading failed:', assetError)
    errorMessage.value = t('auth.errors.assetLoadFailed')
  }

  // Register fields with validation engine
  const roleElement = document.getElementById('role')
  const usernameElement = document.getElementById('username')
  const displayNameElement = document.getElementById('displayName')
  interactionsEngine.register(roleConfig.value, selectedRole.value, roleElement)
  interactionsEngine.register(usernameConfig.value, username.value, usernameElement)
  interactionsEngine.register(displayNameConfig.value, displayName.value, displayNameElement)
  console.log('[ONBOARDING] Validation engine initialized')

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
  interactionsEngine.clearScope(SCOPE_ID)
})

// Handle input changes
// Replaced by handleRoleSelect for custom dropdown, keeping this for reference if needed or if logic differs
/*
const handleRoleChange = (e) => {
  selectedRole.value = e.target.value
  const state = interactionsEngine.getFieldState(roleConfig.value)
  if (state) {
    state.value = selectedRole.value
  }
  // ...
}
*/

const handleUsernameInput = (value) => {
  username.value = value
  isUsernameTaken.value = false // Reset taken status on input
  const state = interactionsEngine.getFieldState(usernameConfig.value)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  interactionsEngine.processFieldChange(usernameConfig.value, value)
  if (state?.isValid && state?.element) {
    state.element.classList.remove('first-invalid')
  }

  // Debounced Username Check
  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)

  if (value && value.length >= 3) {
    isCheckingUsername.value = true
    usernameDebounceTimer = setTimeout(async () => {
      try {
        console.log("[ONBOARDING] Username input:", value)
        const result = await apiWrapper.get('/users/username-exists', { username: value })

        console.log("[ONBOARDING] Username check result:", result)

        if (result.exists) {
          // Show error if username exists
          // Note: API returns partial matches too, logic depends on strict requirement
          // Assuming exact match here for simplicity or handled by backend scenarios
          if (result.matches && result.matches.some(u => u.toLowerCase() === value.toLowerCase())) {
            console.warn("[ONBOARDING] Username exists")
            isUsernameTaken.value = true
          }
        }
      } catch (err) {
        console.error("[ONBOARDING] Username check failed:", err)
      } finally {
        isCheckingUsername.value = false

        // Always re-validate to update UI immediately
        interactionsEngine.validateField(usernameConfig.value)
      }
    }, 500) // 500ms debounce
  }
}

const handleDisplayNameInput = (value) => {
  displayName.value = value
  const state = interactionsEngine.getFieldState(displayNameConfig.value)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  interactionsEngine.processFieldChange(displayNameConfig.value, value)
  if (state?.isValid && state?.element) {
    state.element.classList.remove('first-invalid')
  }
}

async function completeOnboarding() {
  if (isLoading.value) return

  errorMessage.value = ""
  hasAttemptedSubmit.value = true

  if (!agreedToTerms.value) {
    errorMessage.value = t('auth.validation.termsRequired')
    return
  }

  // Validate entire form
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)
  if (!validationResult || !validationResult.isValid) {
    console.log('[ONBOARDING] Form validation failed:', validationResult?.invalidFields)

    // Find first invalid field
    let firstInvalidField = null
    const fieldOrder = ['role', 'username', 'displayName']
    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })
      if (fieldState && !fieldState.isValid) {
        firstInvalidField = { fieldId }
        break
      }
    }

    if (firstInvalidField) {
      const firstInvalidFieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: firstInvalidField.fieldId })
      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element
        element.classList.add('first-invalid')

        const nonRequiredError = firstInvalidFieldState.failedRules?.find(rule => rule.type !== 'required')
        const firstError = nonRequiredError || firstInvalidFieldState.failedRules?.[0]
        // Use the translated message from the validation rule
        const fieldErrorMessage = firstError?.message || t('auth.validation.roleRequired')

        const fieldConfig =
          firstInvalidField.fieldId === 'role'
            ? roleConfig.value
            : firstInvalidField.fieldId === 'displayName'
              ? displayNameConfig.value
              : usernameConfig.value
        interactionsEngine.runInteractions([{ type: 'showBrowserError', message: fieldErrorMessage }], fieldConfig)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    return
  }

  isLoading.value = true

  try {
    console.log("[ONBOARDING] Updating user attributes:", {
      role: selectedRole.value,
      username: username.value,
      displayName: displayName.value,
    })

    const userId = await userIdUtility.getUserId()
    const profileAttributes = buildOnboardingProfileAttributes({
      role: selectedRole.value,
      username: username.value,
      displayName: displayName.value,
    })
    const localUpdates = buildOnboardingLocalUpdates({
      role: selectedRole.value,
      username: username.value,
      displayName: displayName.value,
    })

    // Dirty state: update store immediately so route guards see new role/onboarding
    authStore.updateUserAttributesLocally(localUpdates)

    await Promise.all([
      authHandler.updateProfileAttributes(profileAttributes),
      apiWrapper.post('/users/sign-up/onboarding', {
        userId: userId,
        jwtToken: authStore.idToken,
        role: selectedRole.value,
        username: username.value,
        displayName: displayName.value,
        action: 'signUpOnboarding'
      })
    ])

    console.log("[ONBOARDING] Role saved, refreshing auth token")
    await authStore.syncWithAuthToken()

    // RouteGuard will handle redirects - creators will be redirected to KYC if needed
    if (popupNavHandler) {
      popupNavHandler('/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    console.error("[ONBOARDING] Failed to complete onboarding:", err)
    errorMessage.value = t('auth.errors.onboardingFailed', { error: err.message || t('auth.errors.unknown') })
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-status-bg.jpg"],
}
</script>

<style scoped>
/* Custom styling for transitions if needed, but Tailwind classes usually suffice */
</style>
