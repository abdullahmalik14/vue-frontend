<script setup>
import { ref } from 'vue';

import HomeBackgroundVideo from '@/dev/components/home/homeComponents/HomeBackgroundVideo.vue';
import HomeNavbar from '@/dev/components/home/homeComponents/HomeNavbar.vue';
import HomeFooter from '@/dev/components/home/homeComponents/HomeFooter.vue';
import HeroSection from '@/dev/components/home/homeSections/HeroSection.vue';
import AboutSection from '@/dev/components/home/homeSections/AboutSection.vue';
import FeaturedCreators from '@/dev/components/home/homeSections/FeaturedCreators.vue';
import DitchMiddleman from '@/dev/components/home/homeSections/DitchMiddleman.vue';
import MostViewedSlider from '@/dev/components/home/homeSections/MostViewedSlider.vue';
import RecentlyUploadedSlider from '@/dev/components/home/homeSections/RecentlyUploadedSlider.vue';
import GallerySlider from '@/dev/components/home/homeSections/GallerySlider.vue';
import ServiceTabsSection from '@/dev/components/home/homeSections/ServiceTabsSection.vue';
import SafetyBanner from '@/dev/components/home/homeSections/SafetyBanner.vue';
import ReviewSection from '@/dev/components/home/homeSections/ReviewSection.vue';
import JoinSection from '@/dev/components/home/homeSections/JoinSection.vue';
import FAQSection from '@/dev/components/home/homeSections/FAQSection.vue';
import OverviewSection from '@/dev/components/home/homeSections/OverviewSection.vue';

const bgVideo = ref(null);

const handleHeroSlideChange = (index) => {
    if (bgVideo.value) {
        bgVideo.value.syncVideo(index);
    }
};
</script>

<template>
    <div class="relative min-h-screen overflow-x-hidden home-page">
        <HomeBackgroundVideo ref="bgVideo" />

        <div class="relative z-0">
            <HomeNavbar />

            <main>
                <HeroSection @slide-change="handleHeroSlideChange" />
                <AboutSection />
                <FeaturedCreators />
                <DitchMiddleman />
                <MostViewedSlider />
                <RecentlyUploadedSlider />
                <GallerySlider />
                <ServiceTabsSection />
                <SafetyBanner />
                <ReviewSection />
                <JoinSection />
                <FAQSection />
                <OverviewSection />
            </main>

            <HomeFooter />
        </div>
    </div>
</template>

<style scoped>
.home-page :deep(.no-scrollbar::-webkit-scrollbar) {
    display: none;
}

.home-page :deep(.no-scrollbar) {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
