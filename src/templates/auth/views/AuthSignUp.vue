<template>
  <!-- signup-container -->
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
      <Heading :text="t('auth.register.button')" tag="h2" theme="AuthHeading" />

      <form @submit.prevent="handleSignUp" class="flex flex-col gap-8">
        <div class="flex items-center gap-1">
          <Paragraph :text="t('auth.register.haveAccount')" font-size="text-base" font-weight="font-medium"
            font-color="text-white" />

          <!-- Log in link — popup-aware -->
          <component :is="popupNavHandler ? 'button' : RouterLink"
            v-bind="popupNavHandler ? { type: 'button' } : { to: '/log-in' }"
            @click="popupNavHandler ? popupNavHandler('/log-in') : undefined"
            class="text-base font-medium leading-6 text-[#f06]"
            :class="{ 'opacity-50 pointer-events-none': isLoading }">
            {{ t("auth.login.button") }}
          </component>
        </div>

        <div class="flex flex-col gap-4">
          <!-- Email input -->
          <AuthTextInput :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.register.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.register.emailAddress')" data-required="true" required-display="italic-text"
            type="text" :show-errors="emailErrors.length > 0" :errors="emailErrors" :disabled="isLoading" />

          <!-- Password input -->
          <AuthTextInput :model-value="password" @update:model-value="handlePasswordInput"
            :placeholder="t('auth.register.passwordPlaceholder')" id="password" show-label
            :label-text="t('auth.register.passwordLabel')" data-required="true" required-display="italic-text"
            :type="passwordInputType"
            :right-icon="passwordEyeIcon"
            @click:right-icon="togglePasswordVisibility"
            :show-errors="passwordErrors.length > 0"
            :errors="passwordErrors" :success="passwordSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
            :disabled="isLoading" />

          <!-- Confirm Password input -->
          <AuthTextInput :model-value="confirmPassword" @update:model-value="handleConfirmPasswordInput"
            :placeholder="t('auth.register.confirmPasswordPlaceholder')" id="confirmPassword" show-label
            :label-text="t('auth.register.confirmPasswordLabel')" data-required="true" required-display="italic-text"
            :type="confirmPasswordInputType"
            :right-icon="confirmPasswordEyeIcon"
            @click:right-icon="toggleConfirmPasswordVisibility"
            :show-errors="confirmPasswordErrors.length > 0" :errors="confirmPasswordErrors"
            :success="confirmPasswordSuccess"
            success-icon-class="w-3.5 h-2.5"
            error-icon-class="w-3.5 h-4"
            :disabled="isLoading" />
        </div>

        <CloudflareSuccess variant="login" :show="true" />

        <!-- Signup button -->
        <DashboardPrimaryButton :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isAuthFormReady"
          type="submit" />

        <!-- Continue with X button -->
        <DashboardPrimaryButton :text="t('auth.login.continueWithX')" variant="authTransparent" size="lg" :leftIcon="twitterIconUrl"
          leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTwitterLogin" />

        <DashboardPrimaryButton :text="t('auth.login.continueWithTelegram')" variant="authTransparent" size="lg"
          :leftIcon="telegramIcon" leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTelegramLogin" />
      </form>

      <!-- Error message -->
      <div v-if="errorMessage"
        class="flex items-center gap-3 bg-gradient-to-r from-[#5d1906] to-[#0e0401] border-l-4 border-l-[#e8723e] px-2 py-3 shadow-lg relative">
        <div class="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#2a0f08] rounded-xl"></div>
          <div class="absolute inset-0 bg-[#e8723e]/20 rounded-full blur-md"></div>
          <ExclamationCircleIcon class="w-6 h-6 text-[#ff6535] relative z-10" />
        </div>
        <p class="text-white text-[15px] font-normal leading-relaxed flex-1">
          {{ errorMessage }}
        </p>
        <button @click="errorMessage = ''" type="button"
          class="text-white/70 hover:text-white transition-all duration-200 flex-shrink-0 hover:scale-110"
          :aria-label="t('auth.common.closeError')">
          <XMarkIcon class="w-5 h-5 stroke-2" />
        </button>
      </div>
    </div>
    <!-- Loading overlay -->

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, inject } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getActiveLocale } from "@/systems/i18n/localeManager.js";
import { authHandler, getCurrentAuthMode } from "@/dev/utils/auth/authHandler";
import { useAuthStore } from "@/stores/useAuthStore";
import { getAssetUrl } from "@/systems/assets/assetLibrary";
import { loadAuthPageAssets } from "@/dev/utils/auth/authPageAssets.js";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import {
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/vue/24/outline";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import AuthTextInput from "@/components/forms/inputs/AuthTextInput.vue";
import Heading from "@/components/ui/typography/Heading.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";
import CloudflareSuccess from "@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue";
import { useAssetUrl } from "@/composables/useAssetUrl.js";
import { initiateTwitterLogin } from "@/dev/utils/auth/socialAuthHandler.js";
import { initiateTelegramLogin } from "@/dev/utils/auth/telegramAuthHandler.js";
import { authenticateTelegramIdentity } from "@/dev/utils/auth/socialAuthIdentity.js";
import {
  initiateSocialLogin,
  applySocialAuthTokens,
} from "@/dev/utils/auth/socialAuthBridge.js";
import {
  getTwitterOAuthAllowedOrigins,
  getTelegramOAuthAllowedOrigins,
  isTrustedOAuthOrigin,
  postOAuthAck,
} from "@/dev/utils/auth/oauthPostMessage.js";

const { t, locale: i18nLocale } = useI18n();
const route = useRoute();
const { url: validationSuccessIconUrl } = useAssetUrl('auth.icon.validationSuccess');
const { url: validationErrorIconUrl } = useAssetUrl('auth.icon.validationError');
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const twitterIconUrl = ref("");
const telegramIcon = ref("");
const isAuthFormReady = ref(false);
const router = useRouter();
const assetHandler = ref(null);
const authStore = useAuthStore();
const popupNavHandler = inject('popupNavHandler', null);
const popupGoBack = inject('popupGoBack', null);

onMounted(() => {
  if (route.query.error === 'user_not_found') {
    errorMessage.value = t('auth.register.accountNotFoundPrompt');
  }
});

const twitterPopupRef = ref(null);
const twitterOAuthState = ref(null);
const twitterPopupCheckInterval = ref(null);
const telegramPopupRef = ref(null);
const telegramAuthState = ref(null);
const telegramPopupCheckInterval = ref(null);

// Validation scope
const SCOPE_ID = "signupForm";

// Track if form has been submitted to control when to show errors
const hasAttemptedSubmit = ref(false);

// Field configurations with translated validation messages
const emailConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "email",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.emailRequired"),
    rules: [{ type: "isEmail", message: t("auth.validation.emailInvalid") }],
  },
  validateOnInput: false,
}));

const passwordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "password",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.passwordRequired"),
    rules: [
      {
        type: "minLength",
        param: 8,
        message: t("auth.validation.passwordMinLength"),
      },
      {
        type: "custom",
        param: (value) =>
          typeof value === "string" &&
          /[A-Z]/.test(value) &&
          /[a-z]/.test(value) &&
          /\d/.test(value),
        message: t("auth.validation.passwordComplexity"),
      },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "passwordVisible",
  },
}));

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "confirmPassword",
  dependsOn: ["password"],
  validation: {
    required: true,
    requiredMessage: t("auth.validation.confirmPasswordRequired"),
    rules: [
      {
        type: "matchValue",
        param: "password",
        message: t("auth.validation.confirmPasswordMatch"),
      },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "confirmPasswordVisible",
  },
}));

// Get field states from the engine
const emailState = computed(() =>
  interactionsEngine.getFieldState(emailConfig.value)
);
const passwordState = computed(() =>
  interactionsEngine.getFieldState(passwordConfig.value)
);
const confirmPasswordState = computed(() =>
  interactionsEngine.getFieldState(confirmPasswordConfig.value)
);

// Map validation errors to AuthTextInput format
// Show all errors, but filter required errors to only show after submit
const emailErrors = computed(() => {
  if (!emailState.value || emailState.value.isValid) return [];

  // Filter: show required errors only after submit, show all other errors always
  return emailState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: InformationCircleIcon,
    }));
});

const getPasswordRuleMessages = (fieldState, fieldConfig) => {
  if (!fieldState || !fieldConfig) return { errors: [], success: [] };

  const rules =
    (fieldState.validationConfig || fieldConfig.validation || {}).rules || [];
  const failedTypes = new Set(
    (fieldState.failedRules || []).map((r) => r.type)
  );
  const errors = [];
  const success = [];
  const successIcon = validationSuccessIconUrl.value;
  const errorIcon = validationErrorIconUrl.value;

  rules.forEach((rule) => {
    const isFailed = failedTypes.has(rule.type);
    if (isFailed && (rule.type !== "required" || hasAttemptedSubmit.value)) {
      errors.push({
        error: rule.message,
        icon: errorIcon,
      });
    } else if (!isFailed) {
      success.push({
        message: rule.message,
        icon: successIcon,
        iconColor: "text-white",
        textColor: "text-white",
      });
    }
  });

  return { errors, success };
};

const passwordVisibilityTick = ref(0);
const confirmPasswordVisibilityTick = ref(0);

const passwordInputType = computed(() => {
  passwordVisibilityTick.value;
  return interactionsEngine.getInputType(passwordConfig.value, "password");
});
const confirmPasswordInputType = computed(() => {
  confirmPasswordVisibilityTick.value;
  return interactionsEngine.getInputType(confirmPasswordConfig.value, "password");
});
const passwordEyeIcon = computed(() =>
  passwordInputType.value === "text" ? EyeIcon : EyeSlashIcon
);
const confirmPasswordEyeIcon = computed(() =>
  confirmPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon
);

function togglePasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "passwordVisible" }],
    passwordConfig.value
  );
  passwordVisibilityTick.value += 1;
}
function toggleConfirmPasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "confirmPasswordVisible" }],
    confirmPasswordConfig.value
  );
  confirmPasswordVisibilityTick.value += 1;
}

const confirmMatchFailed = computed(() =>
  !!confirmPassword.value?.trim() &&
  (confirmPasswordState.value?.failedRules || []).some((r) => r.type === "matchValue")
);

// Password rule checklist from engine + mirror confirm matchValue fail under password (Figma)
const passwordErrors = computed(() => {
  const ruleErrors = getPasswordRuleMessages(
    passwordState.value,
    passwordConfig.value
  ).errors;

  if (confirmMatchFailed.value) {
    return [
      ...ruleErrors,
      {
        error: t("auth.validation.confirmPasswordMatch"),
        icon: validationErrorIconUrl.value,
      },
    ];
  }
  return ruleErrors;
});

const passwordSuccess = computed(() => {
  if (!password.value?.trim()) return [];
  return getPasswordRuleMessages(
    passwordState.value,
    passwordConfig.value
  ).success;
});

/** Confirm errors from interactionsEngine.failedRules only */
const confirmPasswordErrors = computed(() => {
  if (!confirmPassword.value?.trim()) {
    if (!hasAttemptedSubmit.value) return [];
    return [
      {
        error: t("auth.validation.confirmPasswordRequired"),
        icon: validationErrorIconUrl.value,
      },
    ];
  }
  if (!confirmPasswordState.value || confirmPasswordState.value.isValid) return [];
  return (confirmPasswordState.value.failedRules || [])
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: validationErrorIconUrl.value,
    }));
});

/** Success only when engine says confirm field is valid */
const confirmPasswordSuccess = computed(() => {
  if (!confirmPassword.value?.trim() || !password.value?.trim()) return [];
  if (!confirmPasswordState.value?.isValid) return [];
  return [
    {
      message: t("auth.validation.confirmPasswordMatchSuccess"),
      icon: validationSuccessIconUrl.value,
      iconColor: "text-white",
      textColor: "text-white",
    },
  ];
});

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const resolveLoadingLabel = () => {
    return t("auth.common.loading");
  };

  if (isLoading.value) {
    return resolveLoadingLabel();
  }
  if (!isAuthFormReady.value) {
    return resolveLoadingLabel();
  }
  return t("auth.register.button");
});

// Get active locale from localeManager
const locale = computed(() => getActiveLocale());

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return; // Skip initial or no-op changes

  console.log(`[SIGNUP] Locale changed from '${oldLocale}' to '${newLocale}'`);

  // Update validation configs in field states
  const emailState = interactionsEngine.getFieldState(emailConfig.value);
  const passwordState = interactionsEngine.getFieldState(passwordConfig.value);
  const confirmPasswordState = interactionsEngine.getFieldState(
    confirmPasswordConfig.value
  );

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity("");
    }
    emailState.validationConfig = emailConfig.value.validation;
    if (hasAttemptedSubmit.value && !emailState.isValid) {
      interactionsEngine.validateField(emailConfig.value);
      // Update browser error message if field is still invalid
      if (!emailState.isValid && emailState.element) {
        const firstError = emailState.failedRules?.[0];
        if (firstError?.message && emailState.element.setCustomValidity) {
          emailState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }

  if (passwordState) {
    // Clear any existing browser validation message
    if (passwordState.element && passwordState.element.setCustomValidity) {
      passwordState.element.setCustomValidity("");
    }
    passwordState.validationConfig = passwordConfig.value.validation;
    if (!passwordState.isValid) {
      interactionsEngine.validateField(passwordConfig.value);
      // Update browser error message if field is still invalid
      if (!passwordState.isValid && passwordState.element) {
        const firstError = passwordState.failedRules?.[0];
        if (firstError?.message && passwordState.element.setCustomValidity) {
          passwordState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }

  if (confirmPasswordState) {
    // Clear any existing browser validation message
    if (
      confirmPasswordState.element &&
      confirmPasswordState.element.setCustomValidity
    ) {
      confirmPasswordState.element.setCustomValidity("");
    }
    confirmPasswordState.validationConfig =
      confirmPasswordConfig.value.validation;
    if (!confirmPasswordState.isValid) {
      interactionsEngine.validateField(confirmPasswordConfig.value);
      // Update browser error message if field is still invalid
      if (!confirmPasswordState.isValid && confirmPasswordState.element) {
        const firstError = confirmPasswordState.failedRules?.[0];
        if (
          firstError?.message &&
          confirmPasswordState.element.setCustomValidity
        ) {
          confirmPasswordState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }
});

// Preload auth section translations
onMounted(async () => {
  console.log(`[SIGNUP] Component mounted, current locale: ${locale.value}`);

  twitterIconUrl.value = await getAssetUrl("icon.social.x");
  telegramIcon.value = await getAssetUrl("icon.social.telegram");

  try {
    const { assetHandler: handler, isReady } = await loadAuthPageAssets("AuthSignUp");
    assetHandler.value = handler;
    isAuthFormReady.value = isReady;
  } catch (assetError) {
    console.error("[SIGNUP] Asset loading failed:", assetError);
    errorMessage.value = t("auth.errors.assetLoadFailed");
  }

  // Register fields with validation engine
  const emailElement = document.getElementById("email");
  const passwordElement = document.getElementById("password");
  const confirmPasswordElement = document.getElementById("confirmPassword");

  interactionsEngine.register(emailConfig.value, email.value, emailElement);
  interactionsEngine.register(
    passwordConfig.value,
    password.value,
    passwordElement
  );
  interactionsEngine.register(
    confirmPasswordConfig.value,
    confirmPassword.value,
    confirmPasswordElement
  );

  console.log("[SIGNUP] Validation engine initialized");
});

// Twitter OAuth popup message handler (same as login page)
function handleTwitterAuthMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== "object") return;

  const popup = twitterPopupRef.value;
  const expectedState = twitterOAuthState.value;

  const isFromPopup = !!popup && event.source === popup;
  const hasExpectedState = !!expectedState && data.state === expectedState;
  if (!isFromPopup) return;

  const twitterAllowedOrigins = getTwitterOAuthAllowedOrigins();
  if (!isTrustedOAuthOrigin(event.origin, twitterAllowedOrigins)) {
    if (import.meta.env?.DEV) {
      console.warn("[SIGNUP] Ignoring Twitter popup message from untrusted origin:", event.origin);
    }
    return;
  }

  if (data.type === "twitter-oauth-code") {
    const { code, state } = data;

    // Clear popup check interval since we got a response
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }

    if (!code || !state || !hasExpectedState) {
      errorMessage.value = t("auth.errors.twitterInvalidState");
      isLoading.value = false;

      // Clear popup check interval on state mismatch
      if (twitterPopupCheckInterval.value) {
        clearInterval(twitterPopupCheckInterval.value);
        twitterPopupCheckInterval.value = null;
      }
      twitterPopupRef.value = null;
      twitterOAuthState.value = null;
      return;
    }

    postOAuthAck(
      event.source,
      { type: "twitter-oauth-ack", success: true, state },
      event.origin,
      twitterAllowedOrigins,
    );

    handleTwitterOAuthCode(code, state)
      .then(() => {
        window.removeEventListener("message", handleTwitterAuthMessage);
        // Clear popup check interval
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
      })
      .catch((err) => {
        if (err.message && err.message.includes('Account exists')) {
          errorMessage.value = t("auth.errors.accountNotLinkedTwitter");
          isLoading.value = false;
          return;
        }
        errorMessage.value = t("auth.errors.twitterSignupFailed", { error: err.message || t("auth.errors.unknown") });
        isLoading.value = false;

        // Clear popup check interval on error
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
      });
  } else if (data.type === "twitter-auth-error") {
    if (!hasExpectedState) return;
    errorMessage.value = data.error || t("auth.errors.twitterLoginFailed");
    isLoading.value = false;

    // Clear popup check interval on error
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }
    twitterPopupRef.value = null;
    twitterOAuthState.value = null;
  }
}

async function handleTwitterOAuthCode(code, state) {
  const { handleTwitterCallback } = await import("@/dev/utils/auth/socialAuthHandler.js");
  const tokens = await handleTwitterCallback(code, state, 'auth', 'signup');

  localStorage.setItem("idToken", tokens.idToken);
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  authStore.setTokenAndDecode(tokens.idToken);
  authStore.startTokenRefreshLoop();
  // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
  // NOTE: Do NOT set isLoading = false here. Maintain loading state during transition.
  if (popupNavHandler) {
    popupNavHandler('/dashboard');
  } else {
    await router.push("/dashboard");
  }

  console.log("[SIGNUP] Twitter OAuth flow completed successfully");
}

async function handleTwitterLogin() {
  if (isLoading.value) return;
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const result = await initiateSocialLogin('twitter', { intent: 'signup' });

    if (result.redirect) {
      return;
    }

    if (result.tokens) {
      await applySocialAuthTokens(result.tokens, {
        authStore,
        router,
        popupNavHandler,
      });
      return;
    }

    window.removeEventListener("message", handleTwitterAuthMessage);
    window.addEventListener("message", handleTwitterAuthMessage, { once: false });

    const { popup, state } = await initiateTwitterLogin();
    twitterPopupRef.value = popup;
    twitterOAuthState.value = state;

    // Check if popup is closed by user (polling)
    twitterPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        // Popup was closed by user
        clearInterval(twitterPopupCheckInterval.value);
        twitterPopupCheckInterval.value = null;
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener("message", handleTwitterAuthMessage);
        console.log("[SIGNUP] Twitter popup was closed by user");
      }
    }, 500); // Check every 500ms
  } catch (err) {
    errorMessage.value = t("auth.errors.twitterStartFailed", { error: err.message || t("auth.errors.unknown") });
    isLoading.value = false;
    window.removeEventListener("message", handleTwitterAuthMessage);
  }
}

// Telegram popup message handler
function handleTelegramAuthMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== "object") return;

  const popup = telegramPopupRef.value;
  const expectedState = telegramAuthState.value;
  const isFromPopup = !!popup && event.source === popup;
  if (!isFromPopup) return;

  const telegramAllowedOrigins = getTelegramOAuthAllowedOrigins();
  if (!isTrustedOAuthOrigin(event.origin, telegramAllowedOrigins)) {
    if (import.meta.env?.DEV) {
      console.warn("[SIGNUP] Ignoring Telegram popup message from untrusted origin:", event.origin);
    }
    return;
  }

  const hasExpectedState = !!expectedState && data.state === expectedState;
  if (!hasExpectedState) {
    // Clear popup check interval on state mismatch
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
    errorMessage.value = t("auth.errors.telegramInvalidState");
    isLoading.value = false;
    telegramPopupRef.value = null;
    telegramAuthState.value = null;
    return;
  }

  if (data.type === "telegram-auth-success") {
    // Clear popup check interval since we got a response
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }

    postOAuthAck(
      event.source,
      { type: "telegram-auth-ack", success: true, state: data.state },
      event.origin,
      telegramAllowedOrigins,
    );
    authenticateTelegramUser(data.user)
      .then(() => {
        window.removeEventListener("message", handleTelegramAuthMessage);
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
      })
      .catch((err) => {
        errorMessage.value = t("auth.errors.telegramFailed", { error: err.message || t("auth.errors.unknown") });
        isLoading.value = false;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
      });
  } else if (data.type === "telegram-auth-error") {
    // Clear popup check interval on error
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
    errorMessage.value = data.error || t("auth.errors.telegramLoginFailed");
    isLoading.value = false;
    telegramPopupRef.value = null;
    telegramAuthState.value = null;
  }
}

async function authenticateTelegramUser(telegramUser) {
  const tokens = await authenticateTelegramIdentity(telegramUser, 'signup');
  await applySocialAuthTokens(tokens, {
    authStore,
    router,
    popupNavHandler,
  });
}

async function handleTelegramLogin() {
  if (isLoading.value) return;
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const result = await initiateSocialLogin('telegram', { intent: 'signup' });

    if (result.redirect) {
      return;
    }

    if (result.tokens) {
      await applySocialAuthTokens(result.tokens, {
        authStore,
        router,
        popupNavHandler,
      });
      return;
    }

    window.removeEventListener("message", handleTelegramAuthMessage);
    window.addEventListener("message", handleTelegramAuthMessage, { once: false });

    const { popup, state } = await initiateTelegramLogin();
    telegramPopupRef.value = popup;
    telegramAuthState.value = state;

    // Check if popup is closed by user (polling)
    telegramPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        // Popup was closed by user
        clearInterval(telegramPopupCheckInterval.value);
        telegramPopupCheckInterval.value = null;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener("message", handleTelegramAuthMessage);
        console.log("[SIGNUP] Telegram popup was closed by user");
      }
    }, 500); // Check every 500ms
  } catch (err) {
    errorMessage.value = t("auth.errors.telegramStartFailed", { error: err.message || t("auth.errors.unknown") });
    isLoading.value = false;
    window.removeEventListener("message", handleTelegramAuthMessage);
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
  }
}

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose();
  }

  interactionsEngine.clearScope(SCOPE_ID);

  window.removeEventListener("message", handleTwitterAuthMessage);
  window.removeEventListener("message", handleTelegramAuthMessage);
  // Cleanup Twitter popup check interval
  if (twitterPopupCheckInterval.value) {
    clearInterval(twitterPopupCheckInterval.value);
    twitterPopupCheckInterval.value = null;
  }
  // Cleanup Telegram popup check interval
  if (telegramPopupCheckInterval.value) {
    clearInterval(telegramPopupCheckInterval.value);
    telegramPopupCheckInterval.value = null;
  }
});

// Handle input changes - only update values, validation happens on submit
const handleEmailInput = (value) => {
  email.value = value;
  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(emailConfig.value);
  if (state) {
    state.value = value;
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value);
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove("first-invalid");
    }
  }
};

const handlePasswordInput = (value) => {
  password.value = value;
  // Use processFieldChange to validate on input (but required errors are filtered in computed)
  interactionsEngine.processFieldChange(passwordConfig.value, value);

  // Always clear browser validation when user types (to reset any previous validation message)
  const state = interactionsEngine.getFieldState(passwordConfig.value);
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Remove first-invalid class if field becomes valid
  if (state?.isValid && state?.element) {
    state.element.classList.remove("first-invalid");
  }

};

const handleConfirmPasswordInput = (value) => {
  confirmPassword.value = value;
  // Use processFieldChange to validate on input (but required errors are filtered in computed)
  interactionsEngine.processFieldChange(confirmPasswordConfig.value, value);

  // Always clear browser validation when user types (to reset any previous validation message)
  const state = interactionsEngine.getFieldState(confirmPasswordConfig.value);
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Remove first-invalid class if field becomes valid
  if (state?.isValid && state?.element) {
    state.element.classList.remove("first-invalid");
  }
};

async function handleSignUp() {
  if (isLoading.value) return;

  errorMessage.value = "";

  // Mark that submit has been attempted (this will show validation errors)
  hasAttemptedSubmit.value = true;

  // Validate entire form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID);

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log(
      "[SIGNUP] Form validation failed - blocking API call:",
      validationResult?.invalidFields || "No validation result"
    );
    console.log(
      "[SIGNUP] All validation errors:",
      validationResult?.invalidFields
    );

    // NOTE: All errors are automatically displayed under each input field via computed properties
    // (emailErrors, passwordErrors, confirmPasswordErrors) - they show ALL failedRules
    // The browser popup below is just for UX (focus/scroll to first invalid field)

    // Find first invalid field from validation result, checking in desired order
    // Use the validation result's invalidFields array to ensure we have fresh validation state
    const fieldOrder = ["email", "password", "confirmPassword"]; // Check fields in this order
    let firstInvalidFieldInfo = null;

    // Create a map of invalid fields for quick lookup
    const invalidFieldsMap = new Map();
    if (validationResult?.invalidFields) {
      validationResult.invalidFields.forEach((invalidField) => {
        invalidFieldsMap.set(invalidField.fieldId, invalidField);
      });
    }

    // Find first invalid field in our desired order
    for (const fieldId of fieldOrder) {
      if (invalidFieldsMap.has(fieldId)) {
        firstInvalidFieldInfo = invalidFieldsMap.get(fieldId);
        break;
      }
    }

    // Show browser popup for first invalid field only (for UX focus/scroll)
    if (firstInvalidFieldInfo) {
      const firstInvalidFieldId = firstInvalidFieldInfo.fieldId;
      const firstInvalidFieldState = interactionsEngine.getFieldState({
        scope: SCOPE_ID,
        id: firstInvalidFieldId,
      });

      // Get the element - use field state element or fallback to document.getElementById
      const element =
        firstInvalidFieldState?.element ||
        document.getElementById(firstInvalidFieldId);

      if (element) {
        // Remove 'first-invalid' class from all fields first
        const allFields = ["email", "password", "confirmPassword"];
        allFields.forEach((fieldId) => {
          const fieldElement = document.getElementById(fieldId);
          if (fieldElement) {
            fieldElement.classList.remove("first-invalid");
          }
        });

        // Add 'first-invalid' class to first invalid field
        element.classList.add("first-invalid");

        // Get first non-required error if available, otherwise use first error
        // Use failedRules from validation result to ensure we have fresh error messages
        const failedRules =
          firstInvalidFieldInfo.failedRules ||
          firstInvalidFieldState.failedRules ||
          [];
        const nonRequiredError = failedRules.find(
          (rule) => rule.type !== "required"
        );
        const firstError = nonRequiredError || failedRules[0];
        // Use the translated message from the validation rule
        const fieldErrorMessage =
          firstError?.message || t("auth.validation.emailRequired");

        // Get the correct field config based on fieldId
        let fieldConfig;
        if (firstInvalidFieldId === "email") {
          fieldConfig = emailConfig.value;
        } else if (firstInvalidFieldId === "password") {
          fieldConfig = passwordConfig.value;
        } else if (firstInvalidFieldId === "confirmPassword") {
          fieldConfig = confirmPasswordConfig.value;
        }

        // Use interactionsEngine's showBrowserError action (UX popup for focus)
        if (fieldConfig) {
          interactionsEngine.runInteractions(
            [
              {
                type: "showBrowserError",
                message: fieldErrorMessage,
              },
            ],
            fieldConfig
          );
        }

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();

        console.log(
          "[SIGNUP] First invalid field:",
          firstInvalidFieldId,
          element
        );
      }
    }

    // All validation errors are shown under each input field via computed properties
    // Ensure we don't set loading state if validation fails
    isLoading.value = false;
    return; // Exit early - do NOT call authHandler.register
  }

  // Only proceed if validation passed - set loading state
  console.log("[SIGNUP] Form validation passed, proceeding with registration");
  isLoading.value = true;

  try {
    console.log("[SIGNUP] Attempting signup with:", { email: email.value });

    await authHandler.register(email.value.trim(), password.value, {
      email: email.value.trim(),
      name: email.value.trim(),
    });

    sessionStorage.setItem("pendingSignupEmail", email.value.trim());
    sessionStorage.removeItem("pendingSignupPassword");
    console.log("[SIGNUP] Redirecting to /confirm-email after signup");

    if (popupNavHandler) {
      popupNavHandler('/confirm-email');
    } else {
      await router.push("/confirm-email");
    }
  } catch (err) {
    console.error("[SIGNUP] Signup error:", err);
    errorMessage.value = err?.message || t("auth.errors.signupFailed");
    isLoading.value = false;
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
};
</script>
