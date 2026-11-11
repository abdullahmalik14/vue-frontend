<template>
    <section class="flex flex-col gap-6">
        <div class="flex flex-col gap-10 bg-[#272727] p-4">
            <!-- SectionHeader — Subscribe / Cart Checkout -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <SectionHeader
                    title="ACCOUNT EMAIL"
                    :icon="assets.communicationIcon"
                    :show-close="true"
                />
                <ShowCodeToggle :code="code.sectionHeaderClose" />
            </div>

            <!-- GuestPurchaseFlowPopup — ORDER SUMMARY (toggleable) -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <SectionToggleHeader
                    title="ORDER SUMMARY"
                    :icon="assets.generalIcon"
                    v-model="orderSummaryOpen"
                />
                <ShowCodeToggle :code="code.orderSummaryToggle" />
            </div>

            <!-- PurchaseFlowSubscriptionOrderPopup — PAYMENT METHOD (locked) -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <SectionToggleHeader
                    title="PAYMENT METHOD"
                    :icon="assets.paymentIcon"
                    v-model="paymentLockedOpen"
                    :show-chevron="true"
                    :toggleable="false"
                />
                <ShowCodeToggle :code="code.paymentLocked" />
            </div>


            <!-- GuestPurchaseFlowPopup — OrderSummary (standalone) -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <OrderSummary :items="cartItems" />
                <ShowCodeToggle :code="code.orderSummary" />
            </div>

            <!-- GuestPurchaseFlowPopup / TipStep3 / TopUpStep2 / PurchaseFlow — AddressCard -->
            <div class="flex flex-col gap-3 w-full max-w-[29.6875rem]">
                <AddressCard
                    :address="shippingAddress"
                    @address-edit="onAddressEdit"
                />
                <ShowCodeToggle :code="code.addressCard" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';
import OrderSummary from '@/dev/components/checkout/reusable/OrderSummary.vue';
import SectionHeader from '@/dev/components/checkout/reusable/SectionHeader.vue';
import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const orderSummaryOpen = ref(true);
const paymentLockedOpen = ref(true);

/** Same shape as GuestPurchaseFlowPopup / TipStep3 / TopUpStep2 saved address string */
const shippingAddress = computed(() => t('demo.checkoutReusable.address.topUp'));

function onAddressEdit() {
    /* GuestPurchaseFlowPopup.vue @address-edit → editDisplayedAddress */
}

const cartItems = computed(() => Array.from({ length: 2 }, () => ({
    name: t('demo.checkoutReusable.cart.itemName'),
    image: assets.value.featuredMediaBg,
    creatorName: t('demo.checkoutReusable.cart.creatorName'),
    creatorAvatar: assets.value.creatorAvatar,
    isVerified: true,
    price: t('demo.checkoutReusable.cart.price'),
    oldPrice: t('demo.checkoutReusable.cart.oldPrice'),
})));

const code = computed(() => ({
    sectionHeaderClose: `import SectionHeader from '@/dev/components/checkout/reusable/SectionHeader.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<!-- Subscribe / Cart Checkout Login -->
<SectionHeader
  title="ACCOUNT EMAIL"
  :icon="assets.communicationIcon"
  :show-close="true"
  @section-close="onClose"
/>`,
    orderSummaryToggle: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';

const orderSummaryOpen = ref(true);

<!-- GuestPurchaseFlowPopup.vue — header only -->
<SectionToggleHeader
  title="ORDER SUMMARY"
  icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
  v-model="orderSummaryOpen"
/>`,
    paymentLocked: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';

const paymentOpen = ref(true);

<!-- PurchaseFlowSubscriptionOrderPopup.vue — header only -->
<SectionToggleHeader
  title="PAYMENT METHOD"
  icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png"
  v-model="paymentOpen"
  :show-chevron="true"
  :toggleable="false"
/>`,
    orderSummary: `import OrderSummary from '@/dev/components/checkout/reusable/OrderSummary.vue';

const cartItems = ref([
  {
    name: t('demo.checkoutReusable.cart.itemName'),
    image: featuredMediaBgUrl,
    creatorName: t('demo.checkoutReusable.cart.creatorName'),
    creatorAvatar: creatorAvatarUrl,
    isVerified: true,
    price: t('demo.checkoutReusable.cart.price'),
    oldPrice: t('demo.checkoutReusable.cart.oldPrice'),
  },
]);

<!-- GuestPurchaseFlowPopup.vue -->
<OrderSummary :items="cartItems" />`,
    addressCard: `import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';

const shippingAddress = computed(() =>
  [firstName, lastName, addressLine1, city, state, postalCode, country]
    .filter(Boolean)
    .join(', ')
);

<!-- GuestPurchaseFlowPopup.vue / TipStep3.vue / TopUpStep2.vue / PurchaseFlowSubscriptionOrderPopup.vue -->
<AddressCard
  :address="shippingAddress"
  @address-edit="editDisplayedAddress"
/>`,
}));
</script>
