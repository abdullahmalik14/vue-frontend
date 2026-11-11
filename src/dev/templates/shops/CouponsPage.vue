<script setup>
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';

const { t } = useI18n();
</script>

<template>
  <DashboardSharedTwoColLayout>
    <div
      data-component="shops-coupons-page"
      class="relative flex min-h-screen flex-col"
    >
      <div class="relative z-[1] flex flex-1 flex-col px-5 py-6 md:px-10 md:py-8">
        <header class="relative z-[1] shrink-0">
          <Heading
            tag="h1"
            theme="custom"
            no-wrap
            add-class="text-[30px] font-medium leading-normal text-[#475467] md:text-[1.75rem] dark:text-[#bdb8af]"
            :text="t('shops.coupons.title')"
          />
        </header>
      </div>
    </div>
  </DashboardSharedTwoColLayout>
</template>
