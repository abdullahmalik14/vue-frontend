<template>
  <div
    data-component="my-media-tabs"
    class="bg-gray-50/50 rounded-[5px] outline outline-1 outline-gray-300 inline-flex justify-start items-center max-w-full min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:w-max sm:overflow-hidden sm:shrink-0"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      type="button"
      :class="[
        'min-h-10 px-4 py-2 flex justify-center items-center gap-2 cursor-pointer outline-none whitespace-nowrap',
        index < tabs.length - 1 ? 'border-r border-gray-300' : '',
        modelValue === tab.value ? 'bg-white' : index === 0 ? 'bg-gray-50' : 'bg-transparent',
        index === 0 ? 'sticky left-0 z-10' : '',
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      <span
        class="text-sm leading-5 whitespace-nowrap"
        :class="
          modelValue === tab.value
            ? 'font-semibold text-slate-700'
            : 'font-medium text-gray-400'
        "
      >
        {{ tab.label }}
      </span>

      <span
        class="text-[10px] font-medium tracking-tight"
        :class="modelValue === tab.value ? 'text-gray-500' : 'text-gray-400'"
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
