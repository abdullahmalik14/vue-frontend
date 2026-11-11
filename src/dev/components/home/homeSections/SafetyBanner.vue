<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: sampleBgUrl } = useAssetUrl('home.section.sampleBg');

const sectionStyle = computed(() => ({
    backgroundImage: sampleBgUrl.value ? `url('${sampleBgUrl.value}')` : undefined,
}));
</script>

<template>
    <div
        class="w-full bg-cover bg-center bg-no-repeat"
        :style="sectionStyle">
        <div
            class="flex flex-col px-4 py-12 bg-[linear-gradient(180deg,rgba(251,91,162,0.35)_0%,rgba(255,0,102,0.7)_100%)] md:justify-center md:items-end md:px-6 md:py-[4.3125rem] md:min-h-[19.875rem] xl:px-12">
            <section class="flex flex-col gap-4 drop-shadow-[0px_0px_8px_#00000040] md:max-w-[39.4375rem]">
                <Heading
                    :text="t('home.safety.title')"
                    tag="h2"
                    theme="homeSafetyTitle"
                    no-wrap
                />
                <Paragraph
                    :text="t('home.safety.body')"
                    theme="homeSafetyBody"
                    no-wrap
                />
            </section>
        </div>
    </div>
</template>
