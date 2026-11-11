<script setup>
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import TopUpStep1 from '@/dev/components/profile/topup-steps/TopUpStep1.vue';
import TopUpStep2 from '@/dev/components/profile/topup-steps/TopUpStep2.vue';
import { provide, onMounted } from 'vue';

const props = defineProps({
        modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const profileCallPopupConfig = {
        actionType: "slideIn",
        from: "right",
        offset: "0px",
        speed: "250ms",
        effect: "ease-in-out",
        shouldShowOverlay: false,
        shouldCloseOnOutsideClick: true,
        shouldLockBodyScroll: true,
        shouldCloseOnEscape: true,
        scrollable: false,
        containerClass: '[&>div]:h-full [&>div]:min-h-0',
        width: { default: '100%', '>640': '521px' },
        height: { default: '100%' },
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const engine = createStepStateEngine({
        flowId: 'top-up-flow',
        initialStep: 1,
        defaults: {
                topUpAmount: 100,
                userBalance: 1834, // Mock
                discount: 0.30,
                finalPrice: 0,
                originalPrice: 0,
        }
});

// Provide engine if needed by children
provide('topUpEngine', engine);

const handleClose = () => {
        emit('update:modelValue', false);
};

onMounted(() => {
        engine.initialize({ fromUrl: false });
});

</script>

<template>
        <BasePopup :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
                :popupConfig="profileCallPopupConfig">


                <!-- column-container -->

                <div class="flex flex-col w-full h-full min-h-0 bg-bg-card dark:bg-bg-dark-form sm:w-[521px]">
                        <!-- close-icon -->

                        <div @click="handleClose"
                                class="w-full shrink-0 z-10 py-[20px] px-[24px] flex justify-end items-center cursor-pointer rounded-full bg-transparent ">
                                <svg width="10" height="10" viewBox="0 0 18 18" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 1L1 17M1 1L17 17" stroke="#98A2B3" stroke-width="1.5"
                                                stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                        </div>
                        <div class="flex flex-col flex-1 min-h-0 w-full">
                                <TopUpStep1 v-if="engine.step === 1" class="flex-1 min-h-0 h-full" :engine="engine" @close="handleClose" />
                                <TopUpStep2 v-if="engine.step === 2" class="flex-1 min-h-0 h-full" :engine="engine" @close="handleClose" />
                        </div>
                </div>

        </BasePopup>
</template>
