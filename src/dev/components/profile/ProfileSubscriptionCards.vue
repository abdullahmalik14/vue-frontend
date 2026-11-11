<template>
    <div class="w-full overflow-hidden min-h-screen relative flex items-center justify-center">
        <div class="w-full relative cursor-grab active:cursor-grabbing" @mousedown="startDrag" @touchstart="startTouch"
            @touchend="endTouch">
            <ul class="relative flex w-full justify-center items-center min-h-[42rem]">
                <SubscriptionCard v-for="(card, index) in cards" :key="card.id" :card-data="card" :order="orders[index]"
                    :is-current="currentIndex === index"
                    :action-mode="mode === 'subscribe' ? 'subscribe' : 'switch'"
                    :current-subscription-price="parseFloat(currentSubscription?.price || 0)"
                    @card-click="moveToCenter(index)" @trigger-action="handleCardAction" />
            </ul>

            <div class="flex justify-center gap-2.5 mt-10">
                <span v-for="(card, index) in cards" :key="'dot-' + index" @click="moveToCenter(index)"
                    class="h-[0.6875rem] rounded-full transition-all duration-300 cursor-pointer" :class="currentIndex === index
                        ? 'bg-[#07F468] w-8 opacity-100'
                        : 'bg-[#E9E5D3] w-[0.6875rem] opacity-50'"></span>
            </div>
        </div>

        <UpgradeTierPopup v-if="mode !== 'subscribe'" v-model="upgradeTierPopupOpen" :currentSubscription="currentSubscription"
            :newSubscription="selectedSubscription" :isUpgrade="isUpgrade" :session="session"
            :payment-scenario="paymentScenario" :requires-payment="requiresPayment" @confirmed="onSwitchConfirmed" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import SubscriptionCard from './SubscriptionCard.vue';
import UpgradeTierPopup from "@/dev/components/ui/popups/profile/UpgradeTierPopup.vue";

const INITIAL_CENTER_INDEX = 2;
const CAROUSEL_CENTER_OFFSET = 2;
const SWIPE_THRESHOLD_PX = 50;

const props = defineProps({
    mode: {
        type: String,
        default: 'switch',
    },
    session: {
        type: Object,
        default: null,
    },
    paymentScenario: {
        type: String,
        default: '',
    },
    requiresPayment: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['subscribe', 'close', 'downgraded']);

const { t } = useI18n();

function text(key, fallback) {
    const value = t(key);
    return !value || value === key ? fallback : value;
}
const { url: bg1Url } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: bg2Url } = useAssetUrl('subscriptionCard.demo.bg2');
const { url: bg3Url } = useAssetUrl('subscriptionCard.demo.bg3');
const { url: bg4Url } = useAssetUrl('subscriptionCard.demo.bg4');
const { url: bg5Url } = useAssetUrl('subscriptionCard.demo.bg5');

const cardFeatures = () => [
    text('demo.subscriptionCards.features.freeTokens', '10 free tokens each month'),
    text('demo.subscriptionCards.features.merchandise', '10% off on all Merchandise'),
    text('demo.subscriptionCards.features.customRequest', '10% off on all Custom Request'),
    text('demo.subscriptionCards.features.payToView', '10% off on all Pay to View videos'),
];

const subscribeFeatures = [
    '<span class="font-semibold text-[#FF0066]">15 free tokens</span> per month',
    '<span class="font-semibold text-[#FF0066]">4% off</span> on all Merchandise',
    '<span class="font-semibold text-[#FF0066]">4% off</span> on all Pay to View videos',
    '<span class="font-semibold text-[#FF0066]">4% off</span> on all Custom Request',
];

const subscribeDescription = 'Success in any field requires constant learning, innovation, and adaptability. In a world driven by technology, those who embrace change gain the advantage.';

const subscribePlans = computed(() => [
    {
        id: 'tease',
        title: 'Tease – Starter Access',
        price: '4.99',
        checkoutPrice: '4.99',
        oldPrice: '9.99',
        videos: '2',
        photos: '9',
        mediaCount: '1',
        image: bg1Url.value,
        features: subscribeFeatures,
        fullDescription: subscribeDescription,
    },
    {
        id: 'desiree',
        title: 'Desiree – Deeper Access',
        price: '7.99',
        checkoutPrice: '7.99',
        oldPrice: '14.99',
        videos: '4',
        photos: '12',
        mediaCount: '2',
        image: bg2Url.value,
        features: subscribeFeatures,
        fullDescription: subscribeDescription,
    },
    {
        id: 'crave',
        title: 'Crave – All Access',
        price: '1',
        checkoutPrice: '1.00',
        oldPrice: '5.00',
        videos: '1',
        photos: '4',
        mediaCount: '1',
        image: bg3Url.value,
        features: subscribeFeatures,
        fullDescription: subscribeDescription,
    },
    {
        id: 'obey',
        title: 'Obey – Ultimate VIP',
        price: '22.99',
        checkoutPrice: '22.99',
        oldPrice: '39.99',
        videos: '8',
        photos: '20',
        mediaCount: '4',
        image: bg4Url.value,
        features: subscribeFeatures,
        fullDescription: subscribeDescription,
    },
    {
        id: 'free',
        title: 'FREE SUBSCRIPTION',
        price: 'Free',
        checkoutPrice: '0.00',
        oldPrice: '',
        videos: '0',
        photos: '0',
        mediaCount: '0',
        image: bg5Url.value,
        features: subscribeFeatures,
        fullDescription: subscribeDescription,
    },
]);

const namedTierCurrentId = computed(() => {
    if (props.mode === 'free-paid') return 'free';
    if (props.mode === 'paid-upgrade') return 'tease';
    if (props.mode === 'paid-to-free') return 'desiree';
    if (props.mode === 'paid-downgrade') return 'obey';
    return '';
});

const namedTierPlans = computed(() =>
    subscribePlans.value.map((plan) => ({
        ...plan,
        isCurrentSubscription: plan.id === namedTierCurrentId.value,
    })),
);

const cards = computed(() => {
    if (props.mode === 'subscribe') return subscribePlans.value;
    if (namedTierCurrentId.value) return namedTierPlans.value;
    return switchCards.value;
});

const switchCards = computed(() => [
    {
        id: 1,
        title: text('demo.subscriptionCards.cards.1.title', 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '12',
        photos: '45',
        mediaCount: '5',
        image: bg1Url.value,
        features: cardFeatures(),
        fullDescription: text('demo.subscriptionCards.cards.description', 'Watch all of my mango eating content! content update weekly!'),
    },
    {
        id: 2,
        title: text('demo.subscriptionCards.cards.2.title', 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'),
        price: '499.99',
        oldPrice: '999.99',
        followers: 'No',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isFeatured: true,
        image: bg2Url.value,
        features: cardFeatures(),
        fullDescription: text('demo.subscriptionCards.cards.description', 'Watch all of my mango eating content! content update weekly!'),
    },
    {
        id: 3,
        title: text('demo.subscriptionCards.cards.3.title', 'Library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'),
        price: '99.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isCurrentSubscription: true,
        image: bg3Url.value,
        features: cardFeatures(),
        fullDescription: text('demo.subscriptionCards.cards.description', 'Watch all of my mango eating content! content update weekly!'),
    },
    {
        id: 4,
        title: text('demo.subscriptionCards.cards.4.title', 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: bg4Url.value,
        features: cardFeatures(),
        fullDescription: text('demo.subscriptionCards.cards.description', 'Watch all of my mango eating content! content update weekly!'),
    },
    {
        id: 5,
        title: text('demo.subscriptionCards.cards.5.title', 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: bg5Url.value,
        features: cardFeatures(),
        fullDescription: text('demo.subscriptionCards.cards.description', 'Watch all of my mango eating content! content update weekly!'),
    },
]);

const currentIndex = ref(INITIAL_CENTER_INDEX); // Beech wala card start mein
const orders = ref([1, 2, 3, 4, 5]);

// Cards ko rearrange karne ki logic (SLIDER LOGIC)
const assignOrders = (index) => {
    const n = cards.value.length;
    const newOrders = new Array(n);
    for (let i = 0; i < n; i++) {
        // Ye formula card ko cyclic order mein rotate karta hai
        const pos = (i - index + CAROUSEL_CENTER_OFFSET + n) % n;
        newOrders[i] = pos + 1;
    }
    orders.value = newOrders;
};

const moveToCenter = (index) => {
    currentIndex.value = index;
    assignOrders(index);
};

// --- DRAG / SWIPE LOGIC ---
let startX = 0;

const startDrag = (e) => {
    startX = e.clientX;
    window.addEventListener('mouseup', endDrag);
};

const endDrag = (e) => {
    const diff = e.clientX - startX;
    handleGesture(diff);
    window.removeEventListener('mouseup', endDrag);
};

const startTouch = (e) => { startX = e.touches[0].clientX; };
const endTouch = (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    handleGesture(diff);
};

const handleGesture = (diff) => {
    if (Math.abs(diff) < SWIPE_THRESHOLD_PX) return; // Chote move ko ignore karein
    if (diff > 0) { // Right swipe -> Previous card
        const prev = (currentIndex.value - 1 + cards.value.length) % cards.value.length;
        moveToCenter(prev);
    } else { // Left swipe -> Next card
        const next = (currentIndex.value + 1) % cards.value.length;
        moveToCenter(next);
    }
};

// --- POPUP LOGIC ---
const upgradeTierPopupOpen = ref(false);
const selectedSubscription = ref(null);
const isUpgrade = ref(false);

const currentSubscription = computed(() => {
    if (props.mode === 'subscribe') return null;
    const card = cards.value.find(c => c.isCurrentSubscription);
    if (!card) return null;
    const amount = parseFloat(card.price);
    if (!Number.isFinite(amount)) return { ...card, price: '0.00' };
    return card;
});

const centerForMode = () => {
    if (props.mode === 'free-paid' || props.mode === 'paid-upgrade' || props.mode === 'paid-to-free' || props.mode === 'paid-downgrade') {
        const index = cards.value.findIndex((card) => card.isCurrentSubscription);
        moveToCenter(index >= 0 ? index : 0);
        return;
    }
    moveToCenter(INITIAL_CENTER_INDEX);
};

const handleCardAction = (card) => {
    if (props.mode === 'subscribe') {
        emit('subscribe', card);
        return;
    }
    const amount = parseFloat(card.price);
    selectedSubscription.value = Number.isFinite(amount) ? card : { ...card, price: '0.00' };
    const currentPrice = parseFloat(currentSubscription.value?.price || 0);
    const newPrice = parseFloat(card.price || 0);

    // Logic: If new price > current price => Upgrade, else Downgrade
    isUpgrade.value = newPrice > currentPrice;

    upgradeTierPopupOpen.value = true;
};

const onSwitchConfirmed = (payload) => {
    emit('close');
    if (payload?.requiresPayment === false) emit('downgraded');
};

watch(() => props.mode, centerForMode);

onMounted(centerForMode);
</script>
