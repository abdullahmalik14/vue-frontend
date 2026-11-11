<template>
  <section class="flex flex-col gap-6">
    <DemoSectionHeader :title="t('demo.page.sections.validationIconMessage')" />

    <div class="flex flex-col gap-10 max-w-xl">
      <!-- AuthSignUp — password errors -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authSignUpPasswordErrors') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authPasswordErrors" />
        <ShowCodeToggle :code="code.authSignUpPasswordErrors" />
      </div>

      <!-- AuthSignUp — password success -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authSignUpPasswordSuccess') }}
        </span>
        <IconMessageList :success="authPasswordSuccess" />
        <ShowCodeToggle :code="code.authSignUpPasswordSuccess" />
      </div>

      <!-- AuthSignUp — confirm mismatch -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authSignUpConfirmError') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authConfirmErrors" />
        <ShowCodeToggle :code="code.authSignUpConfirmError" />
      </div>

      <!-- AuthLogin — email -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authLoginEmailErrors') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authLoginEmailErrors" />
        <ShowCodeToggle :code="code.authLoginEmailErrors" />
      </div>

      <!-- AuthLogin — password required -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authLoginPasswordError') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authLoginPasswordErrors" />
        <ShowCodeToggle :code="code.authLoginPasswordError" />
      </div>

      <!-- AuthSignUpOnboarding — username -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authOnboardingUsername') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authUsernameErrors" />
        <ShowCodeToggle :code="code.authOnboardingUsername" />
      </div>

      <!-- AuthCodeInput call sites — code errors -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authCodeErrors') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authCodeErrors" />
        <ShowCodeToggle :code="code.authCodeErrors" />
      </div>

      <!-- AuthForgotPassword — email -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.authForgotPasswordEmail') }}
        </span>
        <IconMessageList :show-errors="true" :errors="authForgotPasswordEmailErrors" />
        <ShowCodeToggle :code="code.authForgotPasswordEmail" />
      </div>

      <!-- DashboardResetPassword — success -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.dashboardResetPasswordSuccess') }}
        </span>
        <IconMessageList :success="dashboardResetPasswordSuccess" />
        <ShowCodeToggle :code="code.dashboardResetPasswordSuccess" />
      </div>

      <!-- PlanDetail / AddTier — range error (Hexagon default, no icon on item) -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.planDetailRangeError') }}
        </span>
        <IconMessageList
          :show-errors="true"
          :errors="[{ message: t('mediaUploader.addTier.rangeError') }]"
          layout-class="pt-1 pb-2"
        />
        <ShowCodeToggle :code="code.planDetailRangeError" />
      </div>

      <!-- PlanDetail / AddTier — merch range -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.addTierMerchError') }}
        </span>
        <IconMessageList
          :show-errors="true"
          :errors="[{ message: t('mediaUploader.addTier.rangeError') }]"
          layout-class="pt-1 pb-2"
        />
        <ShowCodeToggle :code="code.addTierMerchError" />
      </div>

      <!-- SubscriptionPlanVariationsPopup — fans claim -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.validationIconMessage.captions.planVariationFansClaim') }}
        </span>
        <IconMessageList
          :show-errors="true"
          :errors="[{ message: t('plan.variation.popup.fansClaimMaxError') }]"
        />
        <ShowCodeToggle :code="code.planVariationFansClaim" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import IconMessageList from '@/components/ui/list/IconMessageList.vue';

const { t } = useI18n();

const authPasswordErrors = computed(() => [
  { error: t('auth.validation.passwordMinLength'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasUpper'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasLower'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasNumber'), icon: InformationCircleIcon },
]);

const authPasswordSuccess = computed(() => [
  {
    message: t('auth.validation.passwordMinLength'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
  {
    message: t('auth.validation.passwordHasUpper'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
  {
    message: t('auth.validation.passwordHasLower'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
  {
    message: t('auth.validation.passwordHasNumber'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
]);

const authConfirmErrors = computed(() => [
  { error: t('auth.validation.confirmPasswordMatch'), icon: InformationCircleIcon },
]);

const authLoginEmailErrors = computed(() => [
  { error: t('auth.validation.emailRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.emailInvalid'), icon: InformationCircleIcon },
]);

const authLoginPasswordErrors = computed(() => [
  { error: t('auth.validation.passwordRequired'), icon: InformationCircleIcon },
]);

const authUsernameErrors = computed(() => [
  { error: t('auth.validation.usernameRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.usernameMinLength'), icon: InformationCircleIcon },
  { error: t('auth.validation.usernameTaken'), icon: InformationCircleIcon },
]);

const authCodeErrors = computed(() => [
  { error: t('auth.validation.codeRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.codeSixDigits'), icon: InformationCircleIcon },
]);

const authForgotPasswordEmailErrors = computed(() => [
  { error: t('auth.validation.emailRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.emailInvalid'), icon: InformationCircleIcon },
]);

const dashboardResetPasswordSuccess = computed(() => [
  {
    message: t('auth.validation.passwordHasUpper'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
  {
    message: t('auth.validation.passwordHasLower'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
  {
    message: t('auth.validation.passwordHasNumber'),
    icon: CheckCircleIcon,
    iconColor: 'text-[#07f468]',
    textColor: 'text-[#07f468]',
  },
]);

const code = computed(() => ({
  authSignUpPasswordErrors: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const passwordErrors = [
  { error: t('auth.validation.passwordMinLength'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasUpper'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasLower'), icon: InformationCircleIcon },
  { error: t('auth.validation.passwordHasNumber'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="passwordErrors.length > 0"
  :errors="passwordErrors"
/>`,

  authSignUpPasswordSuccess: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

const passwordSuccess = [
  { message: t('auth.validation.passwordMinLength'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
  { message: t('auth.validation.passwordHasUpper'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
  { message: t('auth.validation.passwordHasLower'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
  { message: t('auth.validation.passwordHasNumber'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
];

<IconMessageList :success="passwordSuccess" />`,

  authSignUpConfirmError: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const confirmPasswordErrors = [
  { error: t('auth.validation.confirmPasswordMatch'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="confirmPasswordErrors.length > 0"
  :errors="confirmPasswordErrors"
/>`,

  authLoginEmailErrors: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const emailErrors = [
  { error: t('auth.validation.emailRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.emailInvalid'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="emailErrors.length > 0"
  :errors="emailErrors"
/>`,

  authLoginPasswordError: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const passwordErrors = [
  { error: t('auth.validation.passwordRequired'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="passwordErrors.length > 0"
  :errors="passwordErrors"
/>`,

  authOnboardingUsername: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const usernameErrors = [
  { error: t('auth.validation.usernameRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.usernameMinLength'), icon: InformationCircleIcon },
  { error: t('auth.validation.usernameTaken'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="usernameErrors.length > 0"
  :errors="usernameErrors"
/>`,

  authCodeErrors: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const codeErrors = [
  { error: t('auth.validation.codeRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.codeSixDigits'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="codeErrors.length > 0"
  :errors="codeErrors"
/>`,

  authForgotPasswordEmail: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const emailErrors = [
  { error: t('auth.validation.emailRequired'), icon: InformationCircleIcon },
  { error: t('auth.validation.emailInvalid'), icon: InformationCircleIcon },
];

<IconMessageList
  :show-errors="emailErrors.length > 0"
  :errors="emailErrors"
/>`,

  dashboardResetPasswordSuccess: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

const newPasswordSuccess = [
  { message: t('auth.validation.passwordHasUpper'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
  { message: t('auth.validation.passwordHasLower'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
  { message: t('auth.validation.passwordHasNumber'), icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[#07f468]' },
];

<IconMessageList :success="newPasswordSuccess" />`,

  planDetailRangeError: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';

<IconMessageList
  :show-errors="freeTokensError"
  :errors="freeTokensError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
  layout-class="pt-1 pb-2"
/>`,

  addTierMerchError: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';

<IconMessageList
  :show-errors="merchError"
  :errors="merchError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
  layout-class="pt-1 pb-2"
/>`,

  planVariationFansClaim: `import IconMessageList from '@/components/ui/list/IconMessageList.vue';

<IconMessageList
  :show-errors="fansClaimExceedsMax"
  :errors="fansClaimExceedsMax ? [{ message: t('plan.variation.popup.fansClaimMaxError') }] : []"
/>`,
}));
</script>
