<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeFeatureTextBlock from '@/dev/components/home/homeComponents/HomeFeatureTextBlock.vue';
import HomeSectionHeader from '@/dev/components/home/homeComponents/HomeSectionHeader.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.about.communities',
    'home.about.smart',
    'home.about.getPaid',
]).then((map) => {
    homeAssets.value = map || {};
});

const features = computed(() => [
  {
    image: homeAssets.value['home.about.communities'],
    alt: t('home.about.features.communities.alt'),
    imageClass: 'h-full',
    imageContainerClass:
      'flex justify-center items-center w-full max-w-[21.4375rem] h-[19.75rem] md:w-[19.75rem] md:h-[19.75rem] lg:min-w-[28.25rem] xl:w-full xl:aspect-square xl:h-[unset] xl:min-w-full',
    articleClass: 'flex flex-col justify-center items-center md:flex-row gap-10 md:gap-6 xl:flex-col xl:gap-10 xl:flex-1',
    title: t('home.about.features.communities.title'),
    description: t('home.about.features.communities.description'),
  },
  {
    image: homeAssets.value['home.about.smart'],
    alt: t('home.about.features.reach.alt'),
    imageClass: 'h-full object-contain',
    imageContainerClass:
      'flex justify-center items-center w-full max-w-[21.4375rem] h-[19.75rem] md:w-[19.75rem] md:h-[19.75rem] lg:min-w-[28.25rem] xl:w-full xl:aspect-square xl:h-[unset] xl:min-w-full',
    articleClass:
      'flex flex-col justify-center items-center md:flex-row-reverse gap-10 md:gap-6 xl:flex-col xl:gap-10 xl:flex-1',
    title: t('home.about.features.reach.title'),
    description: t('home.about.features.reach.description'),
  },
  {
    image: homeAssets.value['home.about.getPaid'],
    alt: t('home.about.features.paid.alt'),
    imageClass: 'h-full',
    imageContainerClass:
      'flex justify-center items-center w-full max-w-[21.4375rem] h-[19.75rem] md:w-[20.25rem] md:h-[20.25rem] lg:min-w-[28.25rem] lg:h-[19.75rem] xl:w-full xl:aspect-square xl:h-[unset] xl:min-w-full',
    articleClass: 'flex flex-col justify-center items-center md:flex-row gap-10 md:gap-6 xl:flex-col xl:gap-10 xl:flex-1',
    title: t('home.about.features.paid.title'),
    description: t('home.about.features.paid.description'),
  },
]);
</script>

<template>
    <div
        class="flex flex-col gap-6 px-4 py-10 backdrop-blur-[25px] bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)] md:gap-16 md:px-12 md:py-20 dark:bg-[#222526]">
        <HomeSectionHeader
            :title="t('home.about.title')"
            :subtitle="t('home.about.subtitle')"
        />

        <div class="flex flex-col gap-16 md:gap-14 xl:flex-row xl:gap-6">
            <article
                v-for="feature in features"
                :key="feature.title"
                :class="feature.articleClass"
            >
                <div :class="feature.imageContainerClass">
                    <img
                        loading="lazy"
                        :src="feature.image"
                        :alt="feature.alt"
                        :class="feature.imageClass"
                    />
                </div>

                <HomeFeatureTextBlock
                    :title="feature.title"
                    :description="feature.description"
                />
            </article>
        </div>
    </div>
</template>
