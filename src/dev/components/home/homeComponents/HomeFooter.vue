<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.footer.mail',
    'home.footer.help',
    'home.footer.discord',
    'home.footer.x',
    'home.footer.instagram',
    'home.footer.visa',
    'home.footer.mastercard',
]).then((map) => {
    homeAssets.value = map || {};
});
</script>

<template>
    <footer class="flex flex-col gap-4 px-4 py-6 bg-[#1D2334]/90 relative md:px-12 dark:bg-[#242b40]/90">
        <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>

        <div class="flex gap-2">
            <div class="flex flex-col gap-4 w-1/2">
                <a :href="`mailto:${t('home.footer.supportEmail')}`" class="flex gap-2 cursor-pointer">
                    <img loading="lazy" :src="homeAssets['home.footer.mail']" :alt="t('home.footer.mailAlt')"
                        class="w-6 h-6 min-w-[1.5rem]">
                    <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal break-all text-[#A9A29D] dark:text-[#aea79c]" :text="t('home.footer.supportEmail')" />
                </a>

                <a href="#" class="flex items-center gap-2 cursor-pointer">
                    <img loading="lazy" :src="homeAssets['home.footer.help']" :alt="t('home.footer.helpAlt')"
                        class="w-6 h-6 min-w-[1.5rem]">
                    <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal break-all text-[#A9A29D] dark:text-[#aea79c]" :text="t('home.footer.help')" />
                </a>

                <div class="flex items-center gap-4">
                    <a href="#" class="w-6 h-6">
                        <img loading="lazy" :src="homeAssets['home.footer.discord']" :alt="t('home.footer.discordAlt')"
                            class="h-full">
                    </a>
                    <a href="#" class="w-6 h-6">
                        <img loading="lazy" :src="homeAssets['home.footer.x']" :alt="t('home.footer.xAlt')" class="h-full">
                    </a>
                    <a href="#" class="w-6 h-6">
                        <img loading="lazy" :src="homeAssets['home.footer.instagram']" :alt="t('home.footer.instagramAlt')"
                            class="h-full">
                    </a>
                </div>
            </div>

            <div class="flex flex-col gap-2 w-1/2">
                <a href="#" class="text-xs leading-6 tracking-[0.00375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.dmca') }}</a>
                <a href="#" class="text-xs leading-normal tracking-[0.00375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.antiExploitation') }}</a>
                <a href="#"
                    class="text-xs leading-normal tracking-[0.00375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.terms') }}</a>
                <a href="#"
                    class="text-xs leading-normal tracking-[0.00375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.privacy') }}</a>
                <a href="#"
                    class="text-xs leading-normal tracking-[0.00375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.report') }}</a>
            </div>
        </div>

        <div class="flex gap-2">
            <a href="#" class="w-[3.125rem] h-8">
                <img loading="lazy" :src="homeAssets['home.footer.visa']" :alt="t('home.footer.visaAlt')" class="w-full h-full">
            </a>
            <a href="#" class="w-[3.125rem] h-8">
                <img loading="lazy" :src="homeAssets['home.footer.mastercard']" :alt="t('home.footer.mastercardAlt')"
                    class="w-full h-full">
            </a>
        </div>

        <span class="text-sm leading-6 tracking-[0.004375rem] text-[#A9A29D] dark:text-[#aea79c]">{{ t('home.footer.copyright') }}</span>
    </footer>
</template>
