<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeMediaSlider from '@/dev/components/home/homeComponents/HomeMediaSlider.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.hero.image2_1',
    'home.hero.image1_2',
    'home.hero.image2_2',
    'home.hero.image0_2',
    'home.slider.playIcon',
    'home.slider.imageIcon',
    'home.slider.avatar',
    'home.slider.galleryIcon',
]).then((map) => {
    homeAssets.value = map || {};
});

const mediaItems = computed(() => [
    {
        bg: homeAssets.value['home.hero.image2_1'],
        typeIcon: homeAssets.value['home.slider.playIcon'],
        meta: '15:00:03',
        avatar: homeAssets.value['home.slider.avatar'],
        name: t('home.sliders.demoName'),
        handle: t('home.sliders.demoHandle'),
    },
    {
        bg: homeAssets.value['home.hero.image1_2'],
        typeIcon: homeAssets.value['home.slider.imageIcon'],
        meta: '30',
        avatar: homeAssets.value['home.slider.avatar'],
        name: t('home.sliders.demoName'),
        handle: t('home.sliders.demoHandle'),
    },
    {
        bg: homeAssets.value['home.hero.image2_2'],
        typeIcon: homeAssets.value['home.slider.playIcon'],
        meta: '15:00:03',
        avatar: homeAssets.value['home.slider.avatar'],
        name: t('home.sliders.demoName'),
        handle: t('home.sliders.demoHandle'),
    },
    {
        bg: homeAssets.value['home.hero.image0_2'],
        typeIcon: homeAssets.value['home.slider.imageIcon'],
        meta: '30',
        avatar: homeAssets.value['home.slider.avatar'],
        name: t('home.sliders.demoName'),
        handle: t('home.sliders.demoHandle'),
    }
]);
</script>

<template>
    <HomeMediaSlider
        :title="t('home.sliders.mostViewed')"
        :icon="homeAssets['home.slider.galleryIcon']"
        :mediaItems="mediaItems"
    />
</template>
