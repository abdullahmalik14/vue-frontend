<script setup>
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

const { t } = useI18n();

defineProps({
  variant: {
    type: String,
    default: 'hero',
    validator: (value) => ['hero', 'section'].includes(value),
  },
});

const rootClassByVariant = {
  hero: 'flex flex-col gap-5 md:gap-6',
  section:
    'flex flex-col justify-center items-center gap-5 w-full md:gap-10 md:max-w-[42.125rem]',
};

const rowClassByVariant = {
  hero: 'flex flex-col gap-5 md:max-w-[37.25rem] md:flex-row md:gap-0',
  section: 'flex flex-col gap-5 w-full md:flex-row md:gap-0',
};

</script>

<template>
  <div :class="rootClassByVariant[variant]">
    <div :class="rowClassByVariant[variant]">
      <div class="h-12 overflow-visible md:grow">
        <div
          class="relative flex justify-center items-center gap-2 px-3 h-[3.25rem] backdrop-blur-[6px] rounded-md overflow-hidden border border-[#d0d5dd]/50 bg-white/10 md:rounded-l-md md:rounded-r-none dark:border-[#3b4043]/50 dark:bg-[#181a1b]/10"
        >
          <input
            type="text"
            class="bg-transparent border-none outline-none grow peer text-lg text-[#F9FAFB] dark:text-[#e5e3df]"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none peer-focus:hidden peer-not-placeholder-shown:hidden"
          >
            <span class="text-lg text-[#F9FAFB] dark:text-[#e5e3df]">{{ t('home.signupForm.prefix') }}</span>
            <span class="text-lg opacity-70 text-[#07F468] dark:[#23f97b]">{{ t('home.signupForm.usernamePlaceholder') }}</span>
          </div>
        </div>
      </div>

      <DashboardPrimaryButton
        theme="homeCreatorJoin"
        type="button"
        :text="t('home.signupForm.joinAsCreator')"
        :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
      />
    </div>

    <DashboardPrimaryButton
      theme="homeFanSignUp"
      type="button"
      :text="t('home.signupForm.signUpAsFan')"
      :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
      :custom-class="variant === 'hero' ? 'md:ml-0' : ''"
    />
  </div>
</template>
