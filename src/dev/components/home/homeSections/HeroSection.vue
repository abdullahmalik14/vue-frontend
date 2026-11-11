<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';
import { defineEmits, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeCreatorSignupForm from '@/dev/components/home/homeComponents/HomeCreatorSignupForm.vue';
import HomeHeroIntro from '@/dev/components/home/homeComponents/HomeHeroIntro.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const emit = defineEmits(['slide-change']);
const splideRef = ref(null);
const homeAssets = ref({});

getAssetUrls([
    'home.hero.image0_1',
    'home.hero.image0_2',
    'home.hero.image1_1',
    'home.hero.image1_2',
    'home.hero.image2_1',
    'home.hero.image2_2',
    'home.hero.poster1',
    'home.hero.poster2',
    'home.hero.poster3',
]).then((map) => {
    homeAssets.value = map || {};
});

const splideOptions = {
    type: 'fade',
    autoplay: true,
    interval: 5000,
    speed: 1000,
    rewind: true,
    pauseOnHover: false,
    pagination: false,
    arrows: false,
};

// Handle both move and moved for reliability across Splide versions
const onMove = (splide, newIndex) => {
    // If newIndex is not provided (e.g. from mounted event), use the splide's current index
    const index = (typeof newIndex === 'number') ? newIndex : splide.index;
    emit('slide-change', index);
};

onMounted(() => {
    // Initial sync immediately on mount
    emit('slide-change', 0);
});
</script>

<template>
    <header
        class="flex flex-col items-center gap-6 min-h-[calc(100vh-3.5rem)] px-4 pb-12 md:pb-4 lg:min-h-[calc(100vh-4.375rem)] lg:flex-row-reverse xl:px-12">
        <!-- hero-section__image-slider -->
        <div class="w-full flex justify-center items-center lg:min-h-[15.625rem]">
            <div
                class="w-[20rem] h-full aspect-[1.228659/1] p-0.5 md:w-[45rem] lg:w-[24.75rem] lg:min-h-[28rem] xl:w-[37rem] xl:h-[40rem]">
                <Splide ref="splideRef" :options="splideOptions" @splide:move="onMove" @splide:mounted="onMove"
                    @splide:moved="onMove" class="w-full h-full">
                    <!-- Slide 0 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image2_2']" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    :src="homeAssets['home.hero.poster1']" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image0_1']" />
                            </div>
                        </div>
                    </SplideSlide>

                    <!-- Slide 1 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image1_2']" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    :src="homeAssets['home.hero.poster2']" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image2_1']" />
                            </div>
                        </div>
                    </SplideSlide>

                    <!-- Slide 2 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image1_1']" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    :src="homeAssets['home.hero.poster3']" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    :src="homeAssets['home.hero.image0_2']" />
                            </div>
                        </div>
                    </SplideSlide>
                </Splide>
            </div>
        </div>

        <!-- hero-section__text-section -->
        <div class="flex flex-col gap-6 w-full">
            <HomeHeroIntro
                :title="t('home.hero.title')"
                :tagline="t('home.hero.tagline')"
                :description="t('home.hero.description')"
            />

            <HomeCreatorSignupForm variant="hero" /></div>
    </header>
</template>
