<script setup>
import { onBeforeUnmount, watch } from "vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import LoadingSpinner from "@/components/ui/spinners/LoadingSpinner.vue";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

const { url: paymentSpinnerUrl } = useAssetUrl("checkout.paymentSpinner");

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "agree"]);

const close = () => emit("update:modelValue", false);

const onEscapeKey = (event) => {
  if (props.loading) return;
  if (event.key === "Escape") close();
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) document.addEventListener("keydown", onEscapeKey);
    else document.removeEventListener("keydown", onEscapeKey);
  },
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onEscapeKey);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[12000] flex items-center justify-center bg-black/5 px-4 backdrop-blur-[7.5px]"
      @click.self="!loading && close()"
    >
      <div
        v-if="loading"
        class="flex h-[150px] w-[150px] rounded-[8px] items-center justify-center bg-[#FFFFFF1A] backdrop-blur-[10px]"
        role="status"
        aria-label="Loading"
      >
        <LoadingSpinner
          :src="paymentSpinnerUrl"
          size=""
          customClass="h-[120px] w-[120px]"
          alt=""
        />
      </div>
      <div
        v-else
        class="flex h-[174px] w-[400px] max-w-full flex-col justify-between overflow-hidden rounded-[10px] bg-[#0000001A] px-4 py-4 shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] backdrop-blur-[100px]"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="relative flex items-center justify-center">
          <h3 class="text-[14px] font-[600] leading-normal text-white">Proceed Payment</h3>
          <button
            type="button"
            class="absolute right-0 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center border-none bg-transparent p-0 cursor-pointer"
            aria-label="Close"
            @click="close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="#07F468" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <p class="text-center text-[14px] font-[400] leading-normal text-[#98A2B3]">
          Please read and agree to Fansocial's
          <span class="text-[#07F468]">Terms and Condition</span>
          and
          <span class="text-[#07F468]">Privacy Policy</span>.
        </p>
        <DashboardPrimaryButton
          class="w-full"
          text="AGREE & PROCEED"
          theme="proceedAgree"
          :disabled="disabled"
          @click="emit('agree')"
        />
      </div>
    </div>
  </Teleport>
</template>
