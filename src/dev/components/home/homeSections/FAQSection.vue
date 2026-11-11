<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeSectionHeader from '@/dev/components/home/homeComponents/HomeSectionHeader.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: chevronIconUrl } = useAssetUrl('home.faq.chevron');

const faqItems = ref([
    { key: '1', isOpen: false },
    { key: '2', isOpen: false },
    { key: '3', isOpen: false },
    { key: '4', isOpen: false },
    { key: '5', isOpen: false },
]);

const toggleFaq = (index) => {
    const item = faqItems.value[index];
    const prevState = item.isOpen;

    faqItems.value.forEach(i => i.isOpen = false);

    item.isOpen = !prevState;
};
</script>

<template>
    <div
        class="flex flex-col px-4 py-10 backdrop-blur-[25px] bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)] md:py-20 xl:px-12 dark:bg-[#222526]">
        <div class="flex flex-col gap-12">
            <HomeSectionHeader
                class="flex flex-col text-center gap-2"
                :title="t('home.faq.title')"
            />

            <div class="flex flex-col">
                <div v-for="(item, index) in faqItems" :key="item.key"
                    :class="['flex flex-col py-6 border-t-[1.5px] border-[#344054]/20 group/accordion-item dark:border-[#323e52]/20', { 'open': item.isOpen }]">
                    <DashboardPrimaryButton
                        theme="faqQuestion"
                        type="button"
                        :text="t(`home.faq.items.${item.key}.question`)"
                        :wrapper-overrides="[{ target: 'wrapper1', removeClass: true }, { target: 'wrapper2', removeClass: true }]"
                        :right-icon="chevronIconUrl || ''"
                        :right-icon-class="`w-6 h-6 min-w-[1.5rem] transition-transform duration-300 ${item.isOpen ? 'rotate-180' : ''}`"
                        @click="toggleFaq(index)"
                    />

                    <div class="overflow-hidden transition-all duration-300"
                        :style="{ maxHeight: item.isOpen ? '200px' : '0', opacity: item.isOpen ? '1' : '0', marginTop: item.isOpen ? '1rem' : '0' }">
                        <Paragraph theme="custom" no-wrap add-class="text-base font-medium text-[#101828] dark:text-[#d6d3cd]" :text="t(`home.faq.items.${item.key}.answer`)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
