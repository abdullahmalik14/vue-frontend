<script setup>
import Paragraph from '@/components/ui/typography/Paragraph.vue';

defineProps({
  iconSrc: { type: String, default: '' },
  label: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  iconClass: { type: String, default: 'w-10 h-10 object-contain' },
});

defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="w-16 px-1.5 pt-1.5 pb-0 inline-flex flex-col justify-center items-center gap-1 border-none bg-transparent cursor-pointer shrink-0"
    @click="$emit('select')"
  >
    <img :src="iconSrc" alt="" :class="iconClass" />
    <Paragraph
      theme="custom"
      no-wrap
      :text="label"
      :add-class="
        selected
          ? 'text-center leading-4 pb-1 text-[#07F468] text-base font-bold'
          : 'text-center leading-4 pb-1 text-[#98A2B3] text-sm font-semibold'
      "
    />
    <span
      class="block w-full h-[1.6px] rounded-full"
      :class="selected ? 'bg-[#07F468]' : 'bg-transparent'"
      aria-hidden="true"
    />
  </button>
</template>
