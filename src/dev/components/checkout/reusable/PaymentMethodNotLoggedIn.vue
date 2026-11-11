<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import { CHECKOUT_SAVE_CARD_CLASS } from "@/dev/composables/checkboxGroupDemoClasses.js";
import { useCheckoutDemoAssets } from "@/dev/composables/useCheckoutDemoAssets.js";
import { useCheckoutCopy } from "@/dev/utils/checkout/checkoutCopy.js";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";

const t = useCheckoutCopy();
const { assets } = useCheckoutDemoAssets();

const SCOPE = "checkoutPaymentMethod";

const props = defineProps({
  wrapperClass: { type: String, default: "" },
  cardNumber: { type: String, default: "" },
  expiry: { type: String, default: "" },
  cardHolder: { type: String, default: "" },
  cvv: { type: String, default: "" },
  saveCard: { type: Boolean, default: false },
  brandSrc: { type: String, default: "/images/payment-card-brand.png" },
});

const emit = defineEmits([
  "update:cardNumber",
  "update:expiry",
  "update:cardHolder",
  "update:cvv",
  "update:saveCard",
]);

const makeConfig = (id) => ({
  scope: SCOPE,
  id,
  validation: {
    required: true,
    requiredMessage: "This item is required.",
  },
  validateOnInput: false,
});

const fieldConfigs = {
  cardNumber: makeConfig("paymentCardNumber"),
  expiry: makeConfig("paymentExpiry"),
  cardHolder: makeConfig("paymentCardHolder"),
  cvv: makeConfig("paymentCvv"),
};

const hasAttemptedSave = ref(false);
const checkboxNonce = ref(0);

const fieldValue = (key) => {
  if (key === "cardNumber") return props.cardNumber;
  if (key === "expiry") return props.expiry;
  if (key === "cardHolder") return props.cardHolder;
  return props.cvv;
};

const fieldError = (id) => {
  if (!hasAttemptedSave.value) return "";
  const field = interactionsEngine.scopes[SCOPE]?.fields?.[id];
  if (!field || field.isValid) return "";
  return field.failedRules?.[0]?.message || "This item is required.";
};

const errors = computed(() => ({
  cardNumber: fieldError("paymentCardNumber"),
  expiry: fieldError("paymentExpiry"),
  cardHolder: fieldError("paymentCardHolder"),
  cvv: fieldError("paymentCvv"),
}));

const registerFields = () => {
  Object.entries(fieldConfigs).forEach(([key, config]) => {
    interactionsEngine.unregister(config);
    interactionsEngine.register(config, fieldValue(key), null);
  });
};

const validatePaymentFields = () => {
  let valid = true;
  Object.entries(fieldConfigs).forEach(([key, config]) => {
    const raw = fieldValue(key);
    const state = interactionsEngine.getFieldState(config);
    if (!state) {
      interactionsEngine.register(config, raw, null);
    } else {
      state.value = raw;
    }
    const result = interactionsEngine.validateField(config);
    if (!String(raw || "").trim() || !result?.isValid) valid = false;
  });
  return valid;
};

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

const formatExpiry = (value) => {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const sanitizePaymentValue = (key, value) => {
  if (key === "cardNumber") return digitsOnly(value).slice(0, 19);
  if (key === "expiry") return formatExpiry(value);
  if (key === "cvv") return digitsOnly(value).slice(0, 4);
  return value;
};

const updateField = (key, config, value) => {
  const nextValue = sanitizePaymentValue(key, value);
  emit(`update:${key}`, nextValue);
  if (!hasAttemptedSave.value) return;
  const state = interactionsEngine.getFieldState(config);
  if (state) state.value = nextValue;
  interactionsEngine.validateField(config);
};

const onSaveCardToggle = (checked) => {
  if (!checked) {
    hasAttemptedSave.value = false;
    emit("update:saveCard", false);
    return;
  }

  hasAttemptedSave.value = true;
  const isValid = validatePaymentFields();
  emit("update:saveCard", isValid);
  if (!isValid) checkboxNonce.value += 1;
};

onMounted(registerFields);

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE);
});
</script>

<template>
  <div class="w-full">
    <div
      :class="wrapperClass"
      class="flex w-full h-[17rem] aspect-[1.715/1] bg-[#1D1D1D] bg-cover bg-center border border-[#EAECF0]/50 dark:border-[#353a3c]/50 rounded-xl"
      :style="{ backgroundImage: `url(${assets.cardBg})` }"
    >
      <div class="p-[24px] flex flex-col justify-between w-full sm:p-6 rounded-xl">
        <div class="flex justify-between items-center gap-[0.625rem]">
          <CheckboxGroup
            :key="checkboxNonce"
            :label="t('demo.checkoutReusable.paymentNotLoggedIn.saveCard')"
            :modelValue="saveCard"
            :customCheckMark="true"
            @update:modelValue="onSaveCardToggle"
            :checkboxClass="CHECKOUT_SAVE_CARD_CLASS"
            labelClass="text-xs sm:text-sm leading-none tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
            wrapperClass="flex items-center"
          />
          <img :src="brandSrc" alt="Visa" class="h-[1.0625rem] w-auto" />
        </div>

        <div class="flex gap-2">
          <div class="flex flex-col w-full gap-2">
            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cardNumber') }}</label>
                <div
                  class="flex items-center gap-2 border-b bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm"
                  :class="errors.cardNumber ? 'border-[#FF692E]' : 'border-[#D0D5DD]'"
                >
                  <input
                    type="text"
                    inputmode="numeric"
                    autocomplete="cc-number"
                    :value="cardNumber"
                    @input="updateField('cardNumber', fieldConfigs.cardNumber, $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cardNumber')"
                  />
                </div>
                <p v-if="errors.cardNumber" class="text-[14px] font-normal leading-normal text-[#FF692E]">
                  {{ errors.cardNumber }}
                </p>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.expirationDate') }}</label>
                <div
                  class="flex items-center gap-2 border-b bg-white/10 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm"
                  :class="errors.expiry ? 'border-[#FF692E]' : 'border-[#D0D5DD]'"
                >
                  <input
                    type="text"
                    inputmode="numeric"
                    autocomplete="cc-exp"
                    maxlength="5"
                    :value="expiry"
                    @input="updateField('expiry', fieldConfigs.expiry, $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentLoggedIn.expiryPlaceholder')"
                  />
                </div>
                <p v-if="errors.expiry" class="text-[14px] font-normal leading-normal text-[#FF692E]">
                  {{ errors.expiry }}
                </p>
              </div>
            </div>

            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cardholderName') }}</label>
                <div
                  class="flex items-center gap-2 border-b bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm"
                  :class="errors.cardHolder ? 'border-[#FF692E]' : 'border-[#D0D5DD]'"
                >
                  <input
                    type="text"
                    :value="cardHolder"
                    @input="updateField('cardHolder', fieldConfigs.cardHolder, $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cardholderName')"
                  />
                </div>
                <p v-if="errors.cardHolder" class="text-[14px] font-normal leading-normal text-[#FF692E]">
                  {{ errors.cardHolder }}
                </p>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cvv') }}</label>
                <div
                  class="flex items-center gap-2 border-b bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm"
                  :class="errors.cvv ? 'border-[#FF692E]' : 'border-[#D0D5DD]'"
                >
                  <input
                    type="text"
                    inputmode="numeric"
                    autocomplete="cc-csc"
                    maxlength="4"
                    :value="cvv"
                    @input="updateField('cvv', fieldConfigs.cvv, $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cvv')"
                  />
                </div>
                <p v-if="errors.cvv" class="text-[14px] font-normal leading-normal text-[#FF692E]">
                  {{ errors.cvv }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
