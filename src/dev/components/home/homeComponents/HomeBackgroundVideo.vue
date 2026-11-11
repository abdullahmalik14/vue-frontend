<script setup>
import { computed, ref, onMounted } from 'vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const activeIndex = ref(0);
const videoRefs = ref([]);
const homeAssets = ref({});

getAssetUrls([
    'home.video.bg0',
    'home.video.bg2',
    'home.video.bg3',
]).then((map) => {
    homeAssets.value = map || {};
});

const videoSources = computed(() => [
    homeAssets.value['home.video.bg0'],
    homeAssets.value['home.video.bg2'],
    homeAssets.value['home.video.bg3'],
]);

const syncVideo = (index) => {
    if (index === undefined || index === null) return;
    activeIndex.value = index;

    videoRefs.value.forEach((video, i) => {
        if (video) {
            if (i === index) {
                video.classList.add('active');
                video.play().catch(() => { });
            } else {
                video.classList.remove('active');
                video.pause();
                video.currentTime = 0;
            }
        }
    });
};

onMounted(() => {
    setTimeout(() => syncVideo(0), 100);
});

defineExpose({
    syncVideo
});
</script>

<template>
    <div id="bg-layer" class="absolute w-screen h-screen inset-0 -z-10 overflow-hidden pointer-events-none">
        <video v-for="(src, i) in videoSources" :key="i" :ref="el => { if (el) videoRefs[i] = el }" :data-hero-bg="i"
            class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 [&.active]:opacity-100"
            :src="src" muted playsinline preload="metadata"
            loop></video>

        <div class="absolute inset-0 bg-[#1D2334]/75 dark:bg-[#242b40]/75"></div>
    </div>
</template>

<style scoped>
video:not(.active) {
    pointer-events: none;
}
</style>
