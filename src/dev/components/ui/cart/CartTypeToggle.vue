<template>
  <div class="flex items-center gap-2 flex-wrap">
    <DashboardPrimaryButton
      :text="t('cart.typeStandard')"
      :theme="modelValue === 'standard' ? 'cartTypeActive' : 'cartTypeInactive'"
      @click="select('standard')"
    />
    <DashboardPrimaryButton
      :text="t('cart.typeDefault')"
      :theme="modelValue === 'default' ? 'cartTypeActive' : 'cartTypeInactive'"
      @click="select('default')"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

const props = defineProps({
  /** 'standard' | 'default' */
  modelValue: {
    type: String,
    default: 'standard',
    validator: (v) => ['standard', 'default'].includes(v),
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const { t } = useI18n();

function select(value) {
  if (props.modelValue === value) return;
  emit('update:modelValue', value);
  emit('change', value);
}
</script>
