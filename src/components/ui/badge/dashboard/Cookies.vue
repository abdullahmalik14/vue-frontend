<script setup>
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="p-4 bg-gray-500/50 [caret-color:transparent] w-[300px] sm:w-[400px] rounded-lg flex flex-col gap-4">
    <Heading :text="t('cookies.title')" tag="h4" theme="AuthHeading" />
     <Paragraph
              :text="t('cookies.description')"
              font-size="text-base"
              font-weight="font-[400]"
              font-color="text-white"
            />
    
    <DashboardPrimaryButton :text="t('cookies.accept')" variant="authPink" size="lg" />
    
    </div>
</template>
