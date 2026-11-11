<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.paymentMethods.sectionTitle')" />
        <div class="flex flex-col gap-10">
            <!-- TipStep3 / TopUpStep2 / PurchaseFlow mobile — compact saved card -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <PaymentMethodLoggedIn
                    :holder-name="holderName"
                    :card-number="cardNumber"
                    :expiry="expiry"
                />
                <ShowCodeToggle :code="code.loggedInCompact" />
            </div>

            <!-- PurchaseFlowSubscriptionOrderPopup / GuestPurchaseFlowPopup — large saved card -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <PaymentMethodLoggedIn
                    variant="large"
                    class="w-full"
                    :holder-name="holderName"
                    :card-number="cardNumber"
                    :expiry="expiry"
                />
                <ShowCodeToggle :code="code.loggedInLarge" />
            </div>

            <!-- TipStep3 / TopUpStep2 / PurchaseFlow step 2 — new card form -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <PaymentMethodNotLoggedIn
                    wrapper-class="max-w-[29.6875rem]"
                    v-model:card-number="form.cardNumber"
                    v-model:expiry="form.expiry"
                    v-model:card-holder="form.cardHolder"
                    v-model:cvv="form.cvv"
                    v-model:save-card="form.saveCard"
                />
                <ShowCodeToggle :code="code.notLoggedIn" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';
import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

/** Same shape as TipStep3 / TopUpStep2 / PurchaseFlow saved-card state */
const holderName = ref('John Carter');
const cardNumber = ref('4111111111113507');
const expiry = ref('02/30');

const form = reactive({
    cardNumber: '',
    expiry: '',
    cardHolder: '',
    cvv: '',
    saveCard: false,
});

const code = computed(() => ({
    loggedInCompact: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';

const holderName = ref('John Carter');
const cardNumber = ref('4111111111113507');
const expiry = ref('02/30');

<!-- TipStep3.vue / TopUpStep2.vue / PurchaseFlowSubscriptionOrderPopup.vue (lg:hidden) -->
<!-- Same column width as PaymentMethodNotLoggedIn max-w-[29.6875rem] -->
<div class="w-full max-w-[29.6875rem]">
  <PaymentMethodLoggedIn
    :holder-name="holderName"
    :card-number="cardNumber"
    :expiry="expiry"
    @card-remove="onRemove"
  />
</div>`,
    loggedInLarge: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';

const holderName = ref('John Carter');
const cardNumber = ref('4111111111113507');
const expiry = ref('02/30');

<!-- PurchaseFlowSubscriptionOrderPopup.vue / GuestPurchaseFlowPopup.vue -->
<!-- Card column matches NotLoggedIn max-w-[29.6875rem] -->
<div class="w-full max-w-[29.6875rem]">
  <PaymentMethodLoggedIn
    variant="large"
    class="w-full"
    :holder-name="holderName"
    :card-number="cardNumber"
    :expiry="expiry"
    @card-remove="onRemove"
  />
</div>`,
    notLoggedIn: `import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue';

const cardNumber = ref('');
const expiry = ref('');
const cardHolder = ref('');
const cvv = ref('');
const saveCard = ref(false);

<!-- TipStep3.vue / TopUpStep2.vue / PurchaseFlowSubscriptionOrderPopup.vue -->
<PaymentMethodNotLoggedIn
  wrapper-class="max-w-[29.6875rem]"
  v-model:card-number="cardNumber"
  v-model:expiry="expiry"
  v-model:card-holder="cardHolder"
  v-model:cvv="cvv"
  v-model:save-card="saveCard"
/>`,
}));
</script>
