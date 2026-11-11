<template>
  <section class="flex flex-col gap-6">
    <DemoSectionHeader :title="t('demo.validationShowcase.sectionTitle')" class="text-white" />
    <p class="text-sm text-white/70 max-w-3xl">
      {{ t('demo.validationShowcase.introBefore') }}
      <code class="text-white/90">src/utils/validation/rules.js</code>
      {{ t('demo.validationShowcase.introVia') }}
      <code class="text-white/90">v-interactions</code>{{ t('demo.validationShowcase.introAfter') }}
    </p>

    <div id="rules-showcase-form" interaction-container class="flex flex-col gap-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Email (strict isEmail) -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">{{ t('demo.validationShowcase.titles.emailFormats') }}</h3>
          <p class="text-xs text-white/60">
            {{ t('demo.validationShowcase.hints.emailValid') }}
            <span class="text-white/90">user+tag@sub.example.co.uk</span>
            —
            {{ t('demo.validationShowcase.hints.emailInvalid') }}
            <span class="text-white/90">bad@@mail.com</span>,
            <span class="text-white/90">user name@example.com</span>,
            <span class="text-white/90">.user@example.com</span>
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseEmail"
              id="showcase-email"
              show-label
              :label-text="t('demo.validationShowcase.labels.email')"
              type="text"
              placeholder="user+tag@sub.example.co.uk"
              data-required="true"
              required-display="italic-text"
              :interactions-config="showcaseEmailInteractions"
            />
            <div id="showcase-email-format-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('auth.validation.emailInvalid') }}</p>
            </div>
          </div>
        </div>

        <!-- URL -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">{{ t('demo.validationShowcase.titles.url') }}</h3>
          <p class="text-xs text-white/60">
            {{ t('demo.validationShowcase.hints.urlValid') }}
            <span class="text-white/90">https://example.com/path</span>
            —
            {{ t('demo.validationShowcase.hints.urlInvalid') }}
            <span class="text-white/90">example.com</span>
            {{ t('demo.validationShowcase.hints.urlProtocolRequired') }}
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseUrl"
              id="showcase-url"
              show-label
              :label-text="t('demo.validationShowcase.labels.website')"
              type="text"
              placeholder="https://example.com"
              :interactions-config="showcaseUrlInteractions"
            />
            <div id="showcase-url-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('demo.validationShowcase.errors.url') }}</p>
            </div>
          </div>
        </div>

        <!-- Numeric -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">{{ t('demo.validationShowcase.titles.numbers') }}</h3>
          <p class="text-xs text-white/60">
            {{ t('demo.validationShowcase.hints.numbersValid') }}
            <span class="text-white/90">42</span>, <span class="text-white/90">-12.5</span>
            —
            {{ t('demo.validationShowcase.hints.numbersInvalid') }}
            <span class="text-white/90">-</span>
            {{ t('demo.validationShowcase.hints.numbersBareMinus') }},
            <span class="text-white/90">12abc</span>
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseAmount"
              id="showcase-amount"
              show-label
              :label-text="t('demo.validationShowcase.labels.amount')"
              type="text"
              placeholder="12.5"
              :interactions-config="showcaseAmountInteractions"
            />
            <div id="showcase-amount-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('demo.validationShowcase.errors.numeric') }}</p>
            </div>
          </div>
        </div>

        <!-- Min / max -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">{{ t('demo.validationShowcase.titles.numericRange') }}</h3>
          <p class="text-xs text-white/60">
            {{ t('demo.validationShowcase.hints.ageRuleBefore') }}
            <span class="text-white/90">18</span>
            {{ t('demo.validationShowcase.hints.ageRuleAnd') }}
            <span class="text-white/90">120</span>
            {{ t('demo.validationShowcase.hints.ageRuleAfter') }}
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseAge"
              id="showcase-age"
              show-label
              :label-text="t('demo.dashboardTextInput.age')"
              type="text"
              placeholder="25"
              :interactions-config="showcaseAgeInteractions"
            />
            <div id="showcase-age-min-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('demo.validationShowcase.errors.ageMin') }}</p>
            </div>
            <div id="showcase-age-max-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('demo.validationShowcase.errors.ageMax') }}</p>
            </div>
            <div id="showcase-age-nan-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">{{ t('demo.validationShowcase.errors.ageNan') }}</p>
            </div>
          </div>
        </div>

        <!-- Full password policy -->
        <div class="flex flex-col gap-4 lg:col-span-2">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">{{ t('demo.validationShowcase.titles.password') }}</h3>
          <p class="text-xs text-white/60">
            {{ t('demo.validationShowcase.hints.passwordRule') }}
            {{ t('demo.validationShowcase.hints.passwordTry') }}
            <span class="text-white/90">Abcdef12</span>
            {{ t('demo.validationShowcase.hints.passwordFails') }}
            <span class="text-white/90">Abcd12!@</span>
            {{ t('demo.validationShowcase.hints.passwordPasses') }}
          </p>
          <div class="flex flex-col gap-1 max-w-md">
            <AuthTextInput
              v-model="showcaseSecurePassword"
              id="showcase-secure-password"
              show-label
              :label-text="t('auth.login.passwordLabel')"
              type="password"
              :placeholder="t('auth.login.passwordPlaceholder')"
              :interactions-config="showcaseSecurePasswordInteractions"
            />
            <div id="showcase-secure-password-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">
                {{ t('demo.validationShowcase.errors.securePassword') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <DashboardPrimaryButton
          :text="t('demo.validationShowcase.validateAll')"
          variant="authPink"
          size="lg"
          v-interactions="rulesShowcaseSubmitInteractions"
        />
        <p v-if="lastValidateMessage" class="text-sm text-white/80">{{ lastValidateMessage }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import AuthTextInput from '@/components/forms/inputs/AuthTextInput.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { registerAllowedScript, unregisterAllowedScript } from '@/interactions';

const { t } = useI18n();

const showcaseEmail = ref('user+tag@sub.example.co.uk');
const showcaseUrl = ref('example.com');
const showcaseAmount = ref('-');
const showcaseAge = ref('10');
const showcaseSecurePassword = ref('');
const lastValidateMessage = ref('');

const showcaseEmailInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isEmail' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-email-format-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-email-format-err' },
  },
];

const showcaseUrlInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isUrl' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-url-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-url-err' },
  },
];

const showcaseAmountInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isNumeric' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-amount-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-amount-err' },
  },
];

const showcaseAgeInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isNumeric' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-nan-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-nan-err' },
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'minNum', param: 18 }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-min-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-min-err' },
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'maxNum', param: 120 }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-max-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-max-err' },
  },
];

const showcaseSecurePasswordInteractions = [
  {
    triggerEvents: ['input', 'blur', 'focus'],
    rules: [{ type: 'isSecurePassword' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-secure-password-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-secure-password-err' },
  },
];

const rulesShowcaseSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#rules-showcase-form',
    options: { focusFirst: true },
  },
  {
    triggerEvents: ['click'],
    actionType: 'script',
    functionName: 'rulesShowcaseAfterValidate',
  },
];

function updateValidateSummary() {
  const form = document.getElementById('rules-showcase-form');
  const invalid = form?.querySelectorAll('[interaction-config][validated="false"]') ?? [];
  lastValidateMessage.value = invalid.length
    ? t('demo.validationShowcase.stillInvalid', { count: invalid.length })
    : t('demo.validationShowcase.allPassed');
}

onMounted(() => {
  registerAllowedScript('rulesShowcaseAfterValidate', updateValidateSummary);
});

onUnmounted(() => {
  unregisterAllowedScript('rulesShowcaseAfterValidate');
});
</script>
