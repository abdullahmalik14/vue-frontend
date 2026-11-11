<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/vue-splide/css';
import HomeSectionHeader from '@/dev/components/home/homeComponents/HomeSectionHeader.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.hero.image1_1',
    'home.hero.image0_2',
    'home.hero.image2_2',
    'home.slider.avatar',
    'home.review.quote',
]).then((map) => {
    homeAssets.value = map || {};
});

const reviews = computed(() => [
    {
        bg: homeAssets.value['home.hero.image1_1'],
        avatar: homeAssets.value['home.slider.avatar'],
        handle: t('home.reviews.items.1.handle'),
        text: t('home.reviews.items.1.text'),
    },
    {
        bg: homeAssets.value['home.hero.image0_2'],
        avatar: homeAssets.value['home.slider.avatar'],
        handle: t('home.reviews.items.2.handle'),
        text: t('home.reviews.items.2.text'),
    },
    {
        bg: homeAssets.value['home.hero.image2_2'],
        avatar: homeAssets.value['home.slider.avatar'],
        handle: t('home.reviews.items.3.handle'),
        text: t('home.reviews.items.3.text'),
    }
]);

const splideOptions = {
    type: 'loop',
    fixedWidth: '15rem',
    fixedHeight: '19.919rem',
    gap: '1rem',
    arrows: false,
    pagination: false,
    drag: 'free',
    focus: 'center',
    direction: 'ltr',
    pauseOnHover: true,
    pauseOnFocus: false,
    mediaQuery: 'min',
    breakpoints: {
        768: {
            fixedWidth: '17.5rem',
            fixedHeight: '22.169rem',
        },
        1280: {
            fixedWidth: '21.875rem',
            fixedHeight: '19.919rem',
        }
    },
    autoScroll: {
        speed: 1,
    },
};

const extensions = { AutoScroll };
</script>

<template>
    <div
        class="w-full flex flex-col gap-6 bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)] py-16 md:gap-10 md:py-20 dark:bg-[#222526] relative overflow-hidden">
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <HomeSectionHeader
            class="px-4 py-2.5 flex flex-col text-center gap-2"
            :title="t('home.reviews.title')"
        />

        <Splide :options="splideOptions" :extensions="extensions">
            <SplideSlide v-for="(review, index) in reviews" :key="index" class="cursor-pointer">
                <div class="w-full h-full flex flex-col justify-between gap-4 p-4 rounded-[0.625rem] overflow-hidden bg-cover bg-center bg-no-repeat xl:p-6"
                    :style="{ backgroundImage: `linear-gradient(180deg,rgba(24,34,48,0.52) 0%,rgba(24,34,48,0.8) 100%), url(${review.bg})` }">
                    <div class="flex flex-col gap-4">
                        <img loading="lazy" :src="homeAssets['home.review.quote']" :alt="t('home.reviews.quoteAlt')"
                            class="w-6">
                        <Paragraph theme="custom" no-wrap
                            add-class="text-sm line-clamp-[9] text-[#F2F4F7] md:text-base xl:line-clamp-[7] dark:text-[#e1dfdb]"
                            :text="review.text" />
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12">
                            <img loading="lazy" :src="review.avatar" :alt="t('home.reviews.avatarAlt')"
                                class="w-full h-full object-cover rounded-full">
                        </div>
                        <span class="text-base font-medium text-[#F2F4F7] dark:text-[#e1dfdb]">{{ review.handle
                        }}</span>
                    </div>
                </div>
            </SplideSlide>
        </Splide>
    </div>
</template>
