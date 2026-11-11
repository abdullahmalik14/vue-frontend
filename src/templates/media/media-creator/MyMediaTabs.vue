<template>
  <div data-component="my-media-tabs"
    class="inline-flex items-center h-[48px] w-max shrink-0 overflow-hidden rounded-[48px] bg-[#E8CBE1]"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      :class="[
        'inline-flex h-full shrink-0 justify-center items-center gap-1 px-4 outline-none cursor-pointer rounded-[48px] whitespace-nowrap',
        modelValue === tab.value ? 'active bg-[#000000] min-w-[75px]' : 'bg-transparent',
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      <span
        class="text-xs leading-none font-medium whitespace-nowrap md:text-sm"
        :class="modelValue === tab.value ? 'text-white' : 'text-[#0C111D]'"
      >
        {{ tab.label }}
      </span>

      <span
        class="text-[10px] leading-none font-medium tracking-[0.0156rem] text-[#FB5BA2]"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>
