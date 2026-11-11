<template>
  <div
    v-if="hasSuccess || hasErrors"
    class="flex flex-col items-start self-stretch gap-1"
    :class="layoutClass"
  >
    <div v-if="hasSuccess" class="flex flex-col gap-1 w-full">
      <div
        v-for="(item, index) in success"
        :key="`success-${index}`"
        class="flex items-center w-full gap-[.4375rem]"
        :class="item.iconColor || 'text-[#07f468]'"
      >
        <img
          v-if="typeof item.icon === 'string'"
          :src="item.icon"
          alt=""
          :class="resolveIconClass(item)"
        />
        <component
          v-else-if="item.icon"
          :is="item.icon"
          :class="resolveIconClass(item)"
        />
        <CheckIcon v-else :class="resolveIconClass(item)" />
        <Paragraph
          :text="resolveSuccessText(item)"
          fontSize="text-[12px] sm:text-[14px]"
          :fontColor="item.textColor || 'text-[#07f468]'"
        />
      </div>
    </div>

    <div v-if="hasErrors" class="flex flex-col gap-1 w-full">
      <div
        v-for="(item, index) in errors"
        :key="`error-${index}`"
        class="flex items-center w-full gap-[.4375rem] text-[#ff7c1e]"
        :class="errorClass"
      >
        <template v-if="showIcons">
          <img
            v-if="typeof item.icon === 'string'"
            :src="item.icon"
            alt=""
            :class="resolveIconClass(item, true)"
          />
          <component
            v-else-if="item.icon"
            :is="item.icon"
            :class="resolveIconClass(item, true)"
          />
          <HexagonExclamationIcon
            v-else
            :class="[resolveIconClass(item, true), 'text-[#ff7c1e]']"
          />
        </template>
        <Paragraph
          :text="resolveErrorText(item)"
          fontSize="text-[12px] sm:text-[14px]"
          fontColor="text-[#ff7c1e]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CheckIcon } from '@heroicons/vue/24/outline';
import HexagonExclamationIcon from '@/components/icons/HexagonExclamationIcon.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';

const props = defineProps({
  /** Parent maps interactionsEngine failedRules (or any validation) → this list */
  showErrors: { type: Boolean, default: false },
  errors: {
    type: Array,
    default: () => [],
  },
  /** Parent maps passed rules → this list (e.g. password checklist) */
  success: {
    type: Array,
    default: () => [],
  },
  /** Extra classes on each error row (e.g. DashboardTextInput errorClass) */
  errorClass: { type: String, default: '' },
  /** Outer spacing — AuthTextInput/AuthCodeInput use mt-1; DTI uses pt-1 pb-2 */
  layoutClass: { type: String, default: 'mt-1' },
  /** Default icon classes for all icons (success + error) */
  iconClass: { type: String, default: '' },
  /** Icon classes for success icons only */
  successIconClass: { type: String, default: '' },
  /** Icon classes for error icons only */
  errorIconClass: { type: String, default: '' },
  /** When false, error rows render message text only (icon can live elsewhere, e.g. inside input) */
  showIcons: { type: Boolean, default: true },
});

const BASE_ICON_CLASS = 'flex-shrink-0 object-contain';
const DEFAULT_ICON_SIZE = 'w-[1.125rem] h-[1.125rem]';

const hasSuccess = computed(() => Array.isArray(props.success) && props.success.length > 0);
const hasErrors = computed(
  () => props.showErrors && Array.isArray(props.errors) && props.errors.length > 0,
);

/** item.iconClass > success/error prop > iconClass prop; default size only if no w-/h- given */
function resolveIconClass(item, isError = false) {
  const custom = [
    props.iconClass,
    isError ? props.errorIconClass : props.successIconClass,
    item?.iconClass || '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasCustomSize = /\b(w-|h-|size-)/.test(custom);

  return [BASE_ICON_CLASS, hasCustomSize ? '' : DEFAULT_ICON_SIZE, custom]
    .filter(Boolean)
    .join(' ');
}

function resolveErrorText(item) {
  if (item == null) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  return String(item.error || item.message || item.text || '');
}

function resolveSuccessText(item) {
  if (item == null) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  return String(item.message || item.text || item.error || '');
}
</script>
