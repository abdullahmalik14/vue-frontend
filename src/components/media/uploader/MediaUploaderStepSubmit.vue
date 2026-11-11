<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

defineProps({
  hideFooterActions: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const SCOPE_ID = 'mediaUploaderSubmit';
const {
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);

const { url: backIconUrl } = useAssetUrl('mediaUploader.icon.back');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');

/** Checkbox required: engine treats bare `false` as empty only with a DOM checkbox element,
 * so we use the validation library `custom` rule for a reusable must-be-true check. */
function termMustBeAcceptedRule() {
  return {
    type: 'custom',
    message: t('mediaUploader.submit.acceptAllAlert'),
    param: (value) => value === true,
  };
}

const termConfigs = {
  termsCheckbox1: fieldConfig('termsCheckbox1', {
    validation: { required: false, rules: [termMustBeAcceptedRule()] },
    validateOnInput: true,
  }),
  termsCheckbox2: fieldConfig('termsCheckbox2', {
    validation: { required: false, rules: [termMustBeAcceptedRule()] },
    validateOnInput: true,
  }),
  termsCheckbox3: fieldConfig('termsCheckbox3', {
    validation: { required: false, rules: [termMustBeAcceptedRule()] },
    validateOnInput: true,
  }),
  termsCheckbox4: fieldConfig('termsCheckbox4', {
    validation: { required: false, rules: [termMustBeAcceptedRule()] },
    validateOnInput: true,
  }),
  termsCheckbox5: fieldConfig('termsCheckbox5', {
    validation: { required: false, rules: [termMustBeAcceptedRule()] },
    validateOnInput: true,
  }),
};

function makeTermModel(formKey) {
  return computed({
    get: () => uploaderStore.form[formKey] || false,
    set: (val) => {
      uploaderStore.updateFormField(formKey, val);
      changeField(termConfigs[formKey], val);
    },
  });
}

const term1 = makeTermModel('termsCheckbox1');
const term2 = makeTermModel('termsCheckbox2');
const term3 = makeTermModel('termsCheckbox3');
const term4 = makeTermModel('termsCheckbox4');
const term5 = makeTermModel('termsCheckbox5');

const termCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden';
const termLabelClass =
  'block text-[12px] sm:text-[14px] leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0';

const allTermsAccepted = computed(
  () => term1.value && term2.value && term3.value && term4.value && term5.value,
);

onMounted(() => {
  Object.entries(termConfigs).forEach(([formKey, config]) => {
    registerField(config, !!uploaderStore.form[formKey]);
  });
});

onBeforeUnmount(() => {
  clearInteractions();
});

let submitLock = false;

async function handleSubmit() {
  if (submitLock) return false;

  const summary = interactionsEngine.validateScope(SCOPE_ID);
  if (!summary.isValid) {
    alert(t('mediaUploader.submit.acceptAllAlert'));
    return false;
  }

  submitLock = true;
  try {
    const success = await uploaderStore.submitUploader();
    if (success) {
      return true;
    }
    submitLock = false;
    alert(t('mediaUploader.submit.failAlert'));
    return false;
  } catch (error) {
    submitLock = false;
    console.error('Submit Error:', error);
    alert(t('mediaUploader.submit.errorAlert'));
    return false;
  }
}

defineExpose({
  submit: handleSubmit,
});
</script>

<template>
  <div data-component="media-uploader-step-submit" class="relative py-[16px] px-[10px] lg:px-[24px]">
    <div
      @click="uploaderStore.setStep(4)"
      class="flex gap-2 items-center cursor-pointer"
    >
      <img :src="backIconUrl" :alt="t('mediaUploader.shell.back')" />
      <button type="button" class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        {{ t('mediaUploader.shell.back') }}
      </button>
    </div>

    <div class="mb-[50px]">
      <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic py-[8px]" :text="t('mediaUploader.submit.certifyTitle')" />

      <div class="flex flex-col gap-[20px]">
        <CheckboxGroup
          v-model="term1"
          :label="t('mediaUploader.submit.term1')"
          :checkboxClass="termCheckboxClass"
          :labelClass="termLabelClass"
          custom-check-mark
          wrapperClass="flex items-start gap-2 leading-none"
        />

        <ul class="pl-2 list-none text-[12px] sm:text-[14px] font-normal leading-5 text-dark-text">
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            {{ t('mediaUploader.submit.term1Bullet1') }}
          </li>
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            {{ t('mediaUploader.submit.term1Bullet2') }}
          </li>
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            {{ t('mediaUploader.submit.term1Bullet3') }}
          </li>
        </ul>

        <CheckboxGroup
          v-model="term2"
          :label="t('mediaUploader.submit.term2')"
          :checkboxClass="termCheckboxClass"
          :labelClass="termLabelClass"
          custom-check-mark
          wrapperClass="flex items-start gap-2 leading-none"
        />

        <CheckboxGroup
          v-model="term3"
          :label="t('mediaUploader.submit.term3')"
          :checkboxClass="termCheckboxClass"
          :labelClass="termLabelClass"
          custom-check-mark
          wrapperClass="flex items-start gap-2 leading-none"
        />

        <CheckboxGroup
          v-model="term4"
          :label="t('mediaUploader.submit.term4')"
          :checkboxClass="termCheckboxClass"
          :labelClass="termLabelClass"
          custom-check-mark
          wrapperClass="flex items-start gap-2 leading-none"
        />

        <CheckboxGroup
          v-model="term5"
          :label="t('mediaUploader.submit.term5')"
          :checkboxClass="termCheckboxClass"
          :labelClass="termLabelClass"
          custom-check-mark
          wrapperClass="flex items-start gap-2 leading-none"
        />

        <NotificationCard
          variant="warning"
          :icon="ExclamationTriangleIcon"
          :description="t('mediaUploader.submit.warning')"
          :closable="false"
        />
      </div>
    </div>

    <div v-if="!hideFooterActions" class="flex justify-end md:mt-0 mt-4">
      <DashboardPrimaryButton
        :text="t('mediaUploader.submit.submitButton')"
        variant="polygonLeft"
        :rightIcon="nextIconUrl"
        :rightIconClass="allTermsAccepted
          ? 'w-5 h-5 transition duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]'
          : 'w-5 h-5 opacity-40'"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
        type="button"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>
