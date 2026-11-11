<script setup>
import { onBeforeUnmount, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  dollars: { type: String, default: "0" },
  cents: { type: String, default: "00" },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const onEscapeKey = (event) => {
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
      @click.self="close"
    >
      <div
        class="relative flex h-[450px] w-[500px] max-w-full flex-col items-center justify-center overflow-hidden rounded-[10px] bg-[#FFFFFF1A] px-6 text-center shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] backdrop-blur-[70px]"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <button
          type="button"
          class="absolute right-4 top-4 flex h-4 w-4 items-center justify-center border-none bg-transparent p-0 cursor-pointer"
          aria-label="Close"
          @click="close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="#07F468" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>

        <div class="flex flex-col gap-[24px] items-center justify-center">
          
          <div class="flex h-20 w-20 items-center justify-center rounded-[16px] bg-[#07F468]">
            <img src="/images/checkout-success-check.png" alt="" class="h-[35px] w-[40px]" />
          </div>
          <div class="flex flex-col gap-[4px]">
            <p class="text-[14px] font-[600] leading-normal text-[#98A2B3]">Total Amount</p>
            <p class="flex items-baseline text-[#F9FAFB]">
              <span class="text-[48px] font-[600] leading-none">${{ dollars }}</span><span class="text-[30px] font-[700] leading-none">.{{ cents }}</span>
          </p>
          </div>
          <div class="flex flex-col gap-[8px]">
            <p class=" text-[18px] font-[600] leading-normal text-[#F9FAFB]">Payment Successful!</p>
            <p class="text-[14px] font-[600] leading-normal text-[#98A2B3]">
              Congratulations! Your payment has been successfully processed.
            </p>
          </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>
