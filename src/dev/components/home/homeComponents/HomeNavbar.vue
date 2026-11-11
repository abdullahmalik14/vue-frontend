<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { getDefaultLoginSlug } from '@/systems/routing/routeDefaults.js';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const LOGIN_PATH = getDefaultLoginSlug();
const SIGNUP_PATH = '/sign-up';

const homeAssets = ref({});

getAssetUrls([
    'home.logo',
    'home.nav.menu',
    'home.nav.menuClose',
]).then((map) => {
    homeAssets.value = map || {};
});

const isMobileMenuOpen = ref(false);
const isScrolling = ref(false);

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleAuthNavigate = (navigate) => {
    isMobileMenuOpen.value = false;
    navigate();
};

const handleScroll = () => {
    isScrolling.value = window.scrollY > 0;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <nav :class="[
        'sticky md:relative top-0 left-0 flex justify-between items-center gap-6 p-2 w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0)_100%)] z-[100] transition-all duration-300 md:px-6 md:py-4',
        { 'bg-black/20 backdrop-blur-[10px]': isScrolling }
    ]">
        <div class="flex items-center gap-[3.375rem] opacity-70">
            <div class="flex justify-center items-center w-max opacity-80 h-10 md:h-auto">
                <img loading="lazy" :src="homeAssets['home.logo']" :alt="t('home.nav.logoAlt')"
                    class="w-full [filter:brightness(0)_saturate(100%)_invert(96%)_sepia(93%)_saturate(12%)_hue-rotate(312deg)_brightness(92%)_contrast(97%)]">
            </div>

            <ul class="hidden md:flex items-center gap-[3.375rem]">
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">{{ t('home.nav.model') }}</a>
                </li>
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">{{ t('home.nav.discover') }}</a>
                </li>
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">{{ t('home.nav.live') }}</a>
                </li>
            </ul>
        </div>

        <div class="hidden md:flex items-center gap-2 relative z-[101]">
            <RouterLink :to="LOGIN_PATH" custom v-slot="{ navigate }">
                <DashboardPrimaryButton
                    theme="homeNavLogin"
                    type="button"
                    :text="t('home.nav.login')"
                    :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
                    @click="handleAuthNavigate(navigate)"
                />
            </RouterLink>

            <RouterLink :to="SIGNUP_PATH" custom v-slot="{ navigate }">
                <DashboardPrimaryButton
                    theme="homeNavSignUp"
                    type="button"
                    :text="t('home.nav.signUp')"
                    :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
                    @click="handleAuthNavigate(navigate)"
                />
            </RouterLink>
        </div>

        <div @click="toggleMobileMenu"
            class="flex md:hidden justify-center items-center w-8 h-8 opacity-70 cursor-pointer z-[100]">
            <img v-if="!isMobileMenuOpen" loading="lazy" :src="homeAssets['home.nav.menu']" :alt="t('home.nav.menuAlt')"
                class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(93%)_sepia(8%)_saturate(79%)_hue-rotate(181deg)_brightness(102%)_contrast(91%)]">
            <img v-else loading="lazy" :src="homeAssets['home.nav.menuClose']" :alt="t('home.nav.menuCloseAlt')"
                class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(93%)_sepia(8%)_saturate(79%)_hue-rotate(181deg)_brightness(102%)_contrast(91%)]">
        </div>

        <div v-if="isMobileMenuOpen"
            class="fixed top-0 left-0 w-full h-screen flex-col justify-end items-center z-[99] flex md:hidden">
            <div
                class="flex flex-col gap-6 justify-end items-center w-full min-h-[9.296rem] bg-[#121212e6] backdrop-blur-[5px] dark:bg-[#222526e6]">
                <div class="flex items-center gap-2 w-full relative z-[101]">
                    <div class="flex-1">
                        <RouterLink :to="LOGIN_PATH" custom v-slot="{ navigate }">
                            <DashboardPrimaryButton
                                theme="homeNavLogin"
                                type="button"
                                :text="t('home.nav.login')"
                                :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
                                custom-class="w-full h-[4.25rem]"
                                @click="handleAuthNavigate(navigate)"
                            />
                        </RouterLink>
                    </div>

                    <div class="flex-1">
                        <RouterLink :to="SIGNUP_PATH" custom v-slot="{ navigate }">
                            <DashboardPrimaryButton
                                theme="homeNavSignUp"
                                type="button"
                                :text="t('home.nav.signUp')"
                                :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
                                custom-class="w-full h-[4.25rem] [clip-path:polygon(0_0,100%_0,100%_100%,14.6px_100%)]"
                                @click="handleAuthNavigate(navigate)"
                            />
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
