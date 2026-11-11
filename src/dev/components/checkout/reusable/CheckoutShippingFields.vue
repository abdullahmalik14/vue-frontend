<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import BaseInput from "@/components/forms/inputs/BaseInput.vue";
import BasePlanDropdown from "@/components/ui/dropdowns/BasePlanDropdown.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";

const SCOPE = "checkoutShipping";

const props = defineProps({
  state: { type: Object, required: true },
  countryOptions: { type: Array, required: true },
  stateOptions: { type: Array, required: true },
});

const REQUIRED_KEYS = [
  "firstName",
  "lastName",
  "addressLine1",
  "postalCode",
  "city",
  "selectedCountry",
  "selectedState",
];

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
  firstName: makeConfig("shippingFirstName"),
  lastName: makeConfig("shippingLastName"),
  addressLine1: makeConfig("shippingAddressLine1"),
  postalCode: makeConfig("shippingPostalCode"),
  city: makeConfig("shippingCity"),
  selectedCountry: makeConfig("shippingCountry"),
  selectedState: makeConfig("shippingState"),
};

const hasAttempted = ref(false);

const fieldError = (id) => {
  if (!hasAttempted.value) return "";
  const field = interactionsEngine.scopes[SCOPE]?.fields?.[id];
  if (!field || field.isValid) return "";
  return field.failedRules?.[0]?.message || "This item is required.";
};

const errors = computed(() => ({
  firstName: fieldError("shippingFirstName"),
  lastName: fieldError("shippingLastName"),
  addressLine1: fieldError("shippingAddressLine1"),
  postalCode: fieldError("shippingPostalCode"),
  city: fieldError("shippingCity"),
  selectedCountry: fieldError("shippingCountry"),
  selectedState: fieldError("shippingState"),
}));

const inputClass = (error) =>
  `bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b ${
    error ? "border-[#FF692E]" : "border-gray-300"
  }`;

const registerFields = () => {
  Object.entries(fieldConfigs).forEach(([key, config]) => {
    interactionsEngine.unregister(config);
    interactionsEngine.register(config, props.state[key] ?? "", null);
  });
};

const validateShippingFields = () => {
  hasAttempted.value = true;
  let valid = true;
  REQUIRED_KEYS.forEach((key) => {
    const config = fieldConfigs[key];
    const raw = props.state[key] ?? "";
    const fieldState = interactionsEngine.getFieldState(config);
    if (!fieldState) {
      interactionsEngine.register(config, raw, null);
    } else {
      fieldState.value = raw;
    }
    const result = interactionsEngine.validateField(config);
    if (!String(raw).trim() || !result?.isValid) valid = false;
  });
  return valid;
};

watch(
  () => REQUIRED_KEYS.map((key) => props.state[key]),
  () => {
    if (!hasAttempted.value) return;
    validateShippingFields();
  },
);

onMounted(registerFields);

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE);
});

defineExpose({ validate: validateShippingFields });
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 w-full">
        <div class="w-full">
          <BaseInput
            type="text"
            :inputClass="inputClass(errors.lastName)"
            v-model="state.lastName"
            label="Last Name"
            labelFor="last-name"
            labelClass="text-sm font-medium text-[#F9FAFB]"
            placeholder="Last Name"
          />
          <p v-if="errors.lastName" class="mt-1 text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.lastName }}
          </p>
        </div>
        <div class="w-full">
          <BaseInput
            type="text"
            :inputClass="inputClass(errors.firstName)"
            v-model="state.firstName"
            label="First Name"
            labelFor="first-name"
            labelClass="text-sm font-medium text-[#F9FAFB]"
            placeholder="First Name"
          />
          <p v-if="errors.firstName" class="mt-1 text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.firstName }}
          </p>
        </div>
      </div>
      <div>
        <BaseInput
          type="text"
          :inputClass="inputClass(errors.addressLine1)"
          v-model="state.addressLine1"
          label="Address Line 1"
          labelFor="Address-Line-1"
          labelClass="text-sm font-medium text-[#F9FAFB]"
          placeholder="Address Line 1"
        />
        <p v-if="errors.addressLine1" class="mt-1 text-[14px] font-normal leading-normal text-[#FF692E]">
          {{ errors.addressLine1 }}
        </p>
      </div>
      <BaseInput
        type="text"
        inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
        v-model="state.addressLine2"
        label="Address Line 2"
        labelFor="Address-Line-2"
        labelClass="text-sm font-medium text-[#F9FAFB]"
        placeholder="Address Line 2"
      />
      <div class="flex items-center gap-2">
        <div class="w-full">
          <BaseInput
            type="text"
            :inputClass="inputClass(errors.postalCode)"
            v-model="state.postalCode"
            label="Postal Code"
            labelFor="postal-code"
            labelClass="text-sm font-medium text-[#F9FAFB]"
            placeholder="Postal Code"
          />
          <p v-if="errors.postalCode" class="mt-1 text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.postalCode }}
          </p>
        </div>
        <div class="w-full">
          <BaseInput
            type="text"
            :inputClass="inputClass(errors.city)"
            v-model="state.city"
            label="City"
            labelFor="City"
            labelClass="text-sm font-medium text-[#F9FAFB]"
            placeholder="City"
          />
          <p v-if="errors.city" class="mt-1 text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.city }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 w-full">
        <div class="w-full min-w-0">
          <BasePlanDropdown
            variant="checkout"
            searchable
            label="Country"
            :options="countryOptions"
            v-model="state.selectedCountry"
            :invalid="!!errors.selectedCountry"
            widthClass="w-full"
            triggerClass="bg-[#FFFFFF1A]"
          />
          <p v-if="errors.selectedCountry" class="text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.selectedCountry }}
          </p>
        </div>
        <div class="w-full min-w-0">
          <BasePlanDropdown
            variant="checkout"
            searchable
            label="State"
            :options="stateOptions"
            v-model="state.selectedState"
            :invalid="!!errors.selectedState"
            widthClass="w-full"
            triggerClass="bg-[#FFFFFF1A]"
          />
          <p v-if="errors.selectedState" class="text-[14px] font-normal leading-normal text-[#FF692E]">
            {{ errors.selectedState }}
          </p>
        </div>
      </div>
    </div>
    <CheckboxGroup
      label="Save this address for future use."
      v-model="state.saveAddress"
      checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
      labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
      wrapperClass="flex items-center"
    />
  </div>
</template>
