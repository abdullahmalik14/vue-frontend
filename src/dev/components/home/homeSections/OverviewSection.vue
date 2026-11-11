<script setup>
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: previewUrl } = useAssetUrl('home.overview.preview');
</script>

<template>
    <div
        class="flex flex-col justify-center items-center gap-6 px-4 py-10 bg-[#101828] lg:flex-row-reverse lg:py-0 xl:px-12">
        <section class="flex flex-col gap-2 text-center lg:gap-6 lg:w-1/2 lg:text-left">
            <Heading
                tag="h2"
                theme="homeOverviewTitle"
                no-wrap
                :text="t('home.overview.title')"
            />
            <Paragraph
                theme="homeOverviewBody"
                no-wrap
                :text="t('home.overview.body')"
            />
        </section>

        <div class="w-full aspect-[1.561/1] md:max-w-[36.25rem] md:mx-auto lg:w-1/2">
            <img loading="lazy" :src="previewUrl || ''" :alt="t('home.overview.previewAlt')"
                class="w-full h-full object-cover">
        </div>
    </div>
</template>
