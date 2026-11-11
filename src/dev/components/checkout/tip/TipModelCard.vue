<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Paragraph from '@/components/ui/typography/Paragraph.vue';

const { t } = useI18n();

const props = defineProps({
  name: { type: String, default: '' },
  username: { type: String, default: '' },
  avatarSrc: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  tipLabel: { type: String, default: '' },
  shape: { type: [String, Number], default: 1 },
});

defineEmits(['select', 'deselect']);

const SHAPE_BASE = {
  1: 'bg-gradient-to-b from-[#5b3a6e] via-[#2a1a35] to-[#120c18]',
  2: 'bg-gradient-to-b from-[#8a3a4a] via-[#3a1520] to-[#14080c]',
  3: 'bg-gradient-to-b from-[#3a4a5c] via-[#1a2230] to-[#0c1018]',
  4: 'bg-gradient-to-b from-[#6a4a2a] via-[#2a1c10] to-[#120c08]',
};

const SHAPE_PHOTO = {
  1: 'object-cover object-[42%_18%]',
  2: 'object-cover object-[58%_22%]',
  3: 'object-cover object-[50%_30%]',
  4: 'object-cover object-[35%_40%]',
};

const SHAPE_AVATAR = {
  1: 'w-16 h-16 left-[10.49px] top-0 absolute object-cover rounded-full',
  2: 'w-16 h-16 left-[8.54px] top-0 absolute object-cover rounded-full',
  3: 'w-16 h-16 left-[10.32px] top-0 absolute object-cover rounded-full',
  4: 'w-20 h-16 left-[4.76px] top-0 absolute object-cover rounded-full',
};

const shapeKey = computed(() => {
  const n = Number(props.shape);
  return n >= 1 && n <= 4 ? n : 1;
});

const baseClass = computed(() => SHAPE_BASE[shapeKey.value]);
const photoClass = computed(() => SHAPE_PHOTO[shapeKey.value]);
const avatarClass = computed(() => SHAPE_AVATAR[shapeKey.value]);
</script>

<template>
  <div
    class="w-28 h-32 relative shrink-0"
    :class="selected ? 'z-10' : 'opacity-50'"
  >
    <div
      v-if="selected"
      class="pl-1 pr-0.5 py-0.5 right-[-10px] top-[-10px] absolute bg-black flex justify-center items-center gap-0.5 z-20"
    >
      <Paragraph
        theme="custom"
        no-wrap
        :text="tipLabel"
        add-class="text-right text-[#07F468] text-xs font-medium leading-3 whitespace-nowrap"
      />
      <button
        type="button"
        class="w-4 h-4 flex items-center justify-center bg-transparent border-none p-0 cursor-pointer"
        :aria-label="t('checkout.tip.deselectAlt')"
        @click.stop="$emit('deselect')"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="#07F468" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <button
      type="button"
      class="w-full h-full relative overflow-hidden border-none p-0 cursor-pointer"
      :class="
        selected
          ? 'rounded-lg shadow-[0px_0px_10px_0px_rgba(255,255,255,0.50)]'
          : 'rounded-md'
      "
      @click="$emit('select')"
    >
      <div class="absolute inset-0" :class="baseClass" aria-hidden="true" />
      <img
        :src="avatarSrc"
        alt=""
        class="absolute inset-0 w-full h-full opacity-60"
        :class="photoClass"
        aria-hidden="true"
      />

      <div
        class="p-3 relative z-10 w-full h-full bg-gradient-to-b from-black/0 to-black/25 inline-flex flex-col justify-center items-center gap-1.5"
        :class="selected ? 'backdrop-blur-xl' : 'backdrop-blur-[20px]'"
      >
        <div class="self-stretch h-16 relative shrink-0">
          <img :class="avatarClass" :src="avatarSrc" :alt="name" />
        </div>
        <div
          class="self-stretch shadow-[0px_0px_3.2px_0px_rgba(0,0,0,0.25)] flex flex-col justify-start items-center"
        >
          <div class="self-stretch inline-flex justify-center items-center gap-[3.20px]">
            <Paragraph
              theme="custom"
              no-wrap
              :text="name"
              add-class="flex-1 text-center text-white text-[9.60px] font-medium leading-4 line-clamp-1"
            />
          </div>
          <Paragraph
            theme="custom"
            no-wrap
            :text="username"
            add-class="text-white text-[9.60px] font-medium leading-4"
          />
        </div>
      </div>
    </button>
  </div>
</template>
