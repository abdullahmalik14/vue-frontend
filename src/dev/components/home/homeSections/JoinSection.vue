<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeCreatorSignupForm from '@/dev/components/home/homeComponents/HomeCreatorSignupForm.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: sampleBgUrl } = useAssetUrl('home.section.sampleBg');

const sectionStyle = computed(() => ({
    backgroundImage: sampleBgUrl.value ? `url('${sampleBgUrl.value}')` : undefined,
}));
</script>

<template>
    <div
        class="flex justify-center items-center bg-cover bg-center bg-no-repeat"
        :style="sectionStyle">
        <div
            class="flex flex-col justify-center items-center gap-6 w-full px-4 py-16 bg-[#1D2334]/75 md:gap-10 md:py-12 xl:px-12 xl:py-[8.4375rem] dark:bg-[#242b40]/75">
            <Heading tag="h2" theme="custom" no-wrap
                add-class="text-2xl font-semibold drop-shadow-[0px_4px_9.6px_#00000040] text-white md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] md:max-w-[42.125rem] xl:text-5xl xl:leading-[3.75rem] md:-tracking-[0.06rem] dark:text-[#e8e6e3]"
                :text="t('home.join.title')" />

            <HomeCreatorSignupForm variant="section" />
        </div>
    </div>
</template>
