<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/vue-splide/css';
import HomeSectionHeader from '@/dev/components/home/homeComponents/HomeSectionHeader.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.hero.image1_1',
    'home.hero.image2_2',
    'home.hero.image0_1',
    'home.hero.image0_2',
    'home.featured.arrow',
]).then((map) => {
    homeAssets.value = map || {};
});

const featuredCreators = computed(() => [
    {
        name: t('home.featured.creators.yanice.name'),
        username: t('home.featured.creators.yanice.username'),
        image: homeAssets.value['home.hero.image1_1'],
    },
    {
        name: t('home.featured.creators.yana.name'),
        username: t('home.featured.creators.yana.username'),
        image: homeAssets.value['home.hero.image2_2'],
    },
    {
        name: t('home.featured.creators.yanice.name'),
        username: t('home.featured.creators.yanice.username'),
        image: homeAssets.value['home.hero.image0_1'],
    },
    {
        name: t('home.featured.creators.yana.name'),
        username: t('home.featured.creators.yana.username'),
        image: homeAssets.value['home.hero.image0_2'],
    },
]);

const topSliderOptions = {
    type: 'loop',
    fixedWidth: '10.858rem',
    gap: '.5rem',
    arrows: false,
    pagination: false,
    drag: 'free',
    focus: 'center',
    direction: 'ltr',
    pauseOnHover: true,
    pauseOnFocus: false,
    autoScroll: {
        speed: 1,
    },
    breakpoints: {
        768: { fixedWidth: '13.75rem' },
        1280: { fixedWidth: '16.71rem' }
    }
};

const bottomSliderOptions = {
    ...topSliderOptions,
    autoScroll: {
        speed: -1,
    }
};

const creatorSection = ref(null);
const customCursor = ref(null);
const isInside = ref(false);
const cursorX = ref(0);
const cursorY = ref(0);

const handleMouseEnter = () => {
    isInside.value = true;
    document.body.style.cursor = 'none';
};

const handleMouseLeave = () => {
    isInside.value = false;
    document.body.style.cursor = '';
};

const handleMouseMove = (e) => {
    if (!creatorSection.value) return;
    const bounds = creatorSection.value.getBoundingClientRect();
    cursorX.value = e.clientX - bounds.left;
    cursorY.value = e.clientY - bounds.top;
};

const extensions = { AutoScroll };
</script>

<template>
    <div ref="creatorSection" class="flex flex-col gap-6 py-12 relative md:gap-10 md:py-16 xl:py-20 overflow-hidden"
        @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @mousemove="handleMouseMove">
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <div ref="customCursor"
            :class="['absolute hidden md:flex flex-col justify-center items-center w-[5.5rem] h-[5.5rem] bg-[#07F468] rounded-full transition-opacity duration-150 pointer-events-none z-[100] dark:hover:bg-[#242b40]', { 'opacity-100 !flex': isInside, 'opacity-0': !isInside }]"
            :style="{ transform: `translate(${cursorX - 44}px, ${cursorY - 44}px)` }">
            <img loading="lazy" :src="homeAssets['home.featured.arrow']" :alt="t('home.featured.arrowAlt')" class="w-8 h-8">
            <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ t('home.featured.profile') }}</span>
        </div>

        <HomeSectionHeader
            class="z-[1]"
            :title="t('home.featured.title')"
            :subtitle="t('home.featured.subtitle')"
        />

        <div class="flex flex-col gap-2 z-[1]">
            <Splide :options="topSliderOptions" :extensions="extensions">
                <SplideSlide v-for="(creator, index) in featuredCreators" :key="index" class="aspect-[0.7636]">
                    <div :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)), url(${creator.image})` }"
                        class="w-full h-full opacity-90 rounded-[0.9375rem] flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat md:rounded-[1.25rem]">
                        <div class="flex flex-col p-3 w-full md:gap-1 md:p-4 lg:px-3 xl:px-4">
                            <div class="flex flex-col drop-shadow-[0_4px_18px_#00000040] md:gap-1">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-base font-semibold text-white dark:text-[#e8e6e3] md:text-xl md:leading-normal xl:text-3xl xl:leading-[2.375rem]"
                                    :text="creator?.name || ''" />
                                <span class="text-sm text-white xl:text-base xl:font-medium dark:text-[#e8e6e3]">{{
                                    creator?.username }}</span>
                            </div>
                        </div>
                    </div>
                </SplideSlide>
            </Splide>

            <Splide :options="bottomSliderOptions" :extensions="extensions">
                <SplideSlide v-for="(creator, index) in featuredCreators" :key="index" class="aspect-[0.7636]">
                    <div :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)), url(${creator.image})` }"
                        class="w-full h-full opacity-90 rounded-[0.625rem] flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat md:rounded-[1.25rem]">
                        <div class="flex flex-col p-3 w-full md:gap-1 md:p-4 lg:px-3 xl:px-4">
                            <div class="flex flex-col drop-shadow-[0_4px_18px_#00000040] md:gap-1">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-base font-semibold text-left text-white dark:text-[#e8e6e3] md:text-xl md:leading-normal xl:text-3xl xl:leading-[2.375rem]"
                                    :text="creator.name" />
                                <span
                                    class="text-sm text-left text-white xl:text-base xl:font-medium dark:text-[#e8e6e3]">{{
                                    creator.username }}</span>
                            </div>
                        </div>
                    </div>
                </SplideSlide>
            </Splide>
        </div>
    </div>
</template>
