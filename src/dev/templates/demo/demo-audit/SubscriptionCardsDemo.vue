<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.subscriptionCards.sectionTitle')" />
        <div class="flex flex-col gap-10">
            <!-- ProfileSubscriptionCards.vue — real v-for usage (switch / subscribe) -->
            <div class="flex flex-col gap-3">
                <ShowCodeToggle :code="code.profileLoop" />
            </div>

            <!-- switch: featured badge + Upgrade CTA (price > current) -->
            <div class="flex flex-col gap-3">
                <SubscriptionCard
                    :card-data="featuredUpgradeCard"
                    static
                    :current-subscription-price="currentPrice"
                    action-mode="switch"
                />
                <ShowCodeToggle :code="code.featuredUpgrade" />
            </div>

            <!-- switch: current subscription (no action button) -->
            <div class="flex flex-col gap-3">
                <SubscriptionCard
                    :card-data="currentCard"
                    static
                    is-current
                    :current-subscription-price="currentPrice"
                    action-mode="switch"
                />
                <ShowCodeToggle :code="code.current" />
            </div>

            <!-- switch: Downgrade CTA (price < current) -->
            <div class="flex flex-col gap-3">
                <SubscriptionCard
                    :card-data="downgradeCard"
                    static
                    :current-subscription-price="currentPrice"
                    action-mode="switch"
                />
                <ShowCodeToggle :code="code.downgrade" />
            </div>

            <!-- mode === 'subscribe': green Subscribe CTA -->
            <div class="flex flex-col gap-3">
                <SubscriptionCard
                    :card-data="subscribeCard"
                    static
                    is-current
                    :current-subscription-price="0"
                    action-mode="subscribe"
                />
                <ShowCodeToggle :code="code.subscribe" />
            </div>

            <!-- subscribePlans free tier (centered → green Subscribe) -->
            <div class="flex flex-col gap-3">
                <SubscriptionCard
                    :card-data="freeCard"
                    static
                    is-current
                    :current-subscription-price="0"
                    action-mode="subscribe"
                />
                <ShowCodeToggle :code="code.free" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: bg1Url } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: bg2Url } = useAssetUrl('subscriptionCard.demo.bg2');
const { url: bg3Url } = useAssetUrl('subscriptionCard.demo.bg3');
const { url: bg5Url } = useAssetUrl('subscriptionCard.demo.bg5');

/** Same baseline as ProfileSubscriptionCards switchCards current tier */
const currentPrice = 99.99;

const switchFeatures = computed(() => [
    t('subscriptionCard.features.freeTokens'),
    t('subscriptionCard.features.merchandise'),
    t('subscriptionCard.features.customRequest'),
    t('subscriptionCard.features.payToView'),
]);

const subscribeFeatures = computed(() => [
    t('subscriptionCard.features.subscribeFreeTokens'),
    t('subscriptionCard.features.subscribeMerchandise'),
    t('subscriptionCard.features.subscribePayToView'),
    t('subscriptionCard.features.subscribeCustomRequest'),
]);

const featuredUpgradeCard = computed(() => ({
    id: 2,
    title: t('subscriptionCard.titles.featuredLibrary'),
    price: '499.99',
    oldPrice: '999.99',
    followers: 'No',
    videos: '0',
    photos: '0',
    mediaCount: '5',
    isFeatured: true,
    image: bg2Url.value,
    features: switchFeatures.value,
    fullDescription: t('subscriptionCard.description'),
}));

const currentCard = computed(() => ({
    id: 3,
    title: t('subscriptionCard.titles.library'),
    price: '99.99',
    oldPrice: '999.99',
    followers: '30',
    videos: '0',
    photos: '0',
    mediaCount: '5',
    isCurrentSubscription: true,
    image: bg3Url.value,
    features: switchFeatures.value,
    fullDescription: t('subscriptionCard.description'),
}));

const downgradeCard = computed(() => ({
    id: 1,
    title: t('subscriptionCard.titles.featuredLibrary'),
    price: '30.99',
    oldPrice: '999.99',
    followers: '30',
    videos: '12',
    photos: '45',
    mediaCount: '5',
    image: bg1Url.value,
    features: switchFeatures.value,
    fullDescription: t('subscriptionCard.description'),
}));

const subscribeCard = computed(() => ({
    id: 'crave',
    title: t('subscriptionCard.plans.crave'),
    price: '1',
    checkoutPrice: '1.00',
    oldPrice: '5.00',
    videos: '1',
    photos: '4',
    mediaCount: '1',
    image: bg3Url.value,
    features: subscribeFeatures.value,
    fullDescription: t('subscriptionCard.subscribeDescription'),
}));

const freeCard = computed(() => ({
    id: 'free',
    title: t('subscriptionCard.plans.free'),
    price: 'Free',
    checkoutPrice: '0.00',
    oldPrice: '',
    videos: '0',
    photos: '0',
    mediaCount: '0',
    image: bg5Url.value,
    features: subscribeFeatures.value,
    fullDescription: t('subscriptionCard.subscribeDescription'),
}));

const importBlock = `import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: cardImageUrl } = useAssetUrl('subscriptionCard.demo.bg2');
const currentSubscriptionPrice = 99.99;`;

const switchFeaturesCode = `features: [
    t('subscriptionCard.features.freeTokens'),
    t('subscriptionCard.features.merchandise'),
    t('subscriptionCard.features.customRequest'),
    t('subscriptionCard.features.payToView'),
  ],
  fullDescription: t('subscriptionCard.description'),`;

const subscribeFeaturesCode = `features: [
    t('subscriptionCard.features.subscribeFreeTokens'),
    t('subscriptionCard.features.subscribeMerchandise'),
    t('subscriptionCard.features.subscribePayToView'),
    t('subscriptionCard.features.subscribeCustomRequest'),
  ],
  fullDescription: t('subscriptionCard.subscribeDescription'),`;

const code = computed(() => ({
    profileLoop: `import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';

<!-- ProfileSubscriptionCards.vue — only real project call site -->
<!-- ProfileSubscriptionPopup passes mode: switch | subscribe | free-paid | paid-upgrade | paid-to-free | paid-downgrade -->
<SubscriptionCard
  v-for="(card, index) in cards"
  :key="card.id"
  :card-data="card"
  :order="orders[index]"
  :is-current="currentIndex === index"
  :action-mode="mode === 'subscribe' ? 'subscribe' : 'switch'"
  :current-subscription-price="parseFloat(currentSubscription?.price || 0)"
  @card-click="moveToCenter(index)"
  @trigger-action="handleCardAction"
/>`,
    featuredUpgrade: `${importBlock}

<!-- ProfileSubscriptionCards.vue — switchCards featured + Upgrade (price > current) -->
<SubscriptionCard
  :card-data="card"
  static
  :current-subscription-price="currentSubscriptionPrice"
  action-mode="switch"
  @trigger-action="handleCardAction"
/>

const card = computed(() => ({
  id: 2,
  title: t('subscriptionCard.titles.featuredLibrary'),
  price: '499.99',
  oldPrice: '999.99',
  videos: '0',
  photos: '0',
  mediaCount: '5',
  isFeatured: true,
  image: cardImageUrl.value,
  ${switchFeaturesCode}
}));`,
    current: `${importBlock}

<!-- ProfileSubscriptionCards.vue — switchCards / namedTiers current subscription -->
<SubscriptionCard
  :card-data="card"
  static
  is-current
  :current-subscription-price="currentSubscriptionPrice"
  action-mode="switch"
/>

const card = computed(() => ({
  id: 3,
  title: t('subscriptionCard.titles.library'),
  price: '99.99',
  oldPrice: '999.99',
  videos: '0',
  photos: '0',
  mediaCount: '5',
  isCurrentSubscription: true,
  image: cardImageUrl.value,
  ${switchFeaturesCode}
}));`,
    downgrade: `${importBlock}

<!-- ProfileSubscriptionCards.vue — switchCards Downgrade (price < current) -->
<SubscriptionCard
  :card-data="card"
  static
  :current-subscription-price="currentSubscriptionPrice"
  action-mode="switch"
  @trigger-action="handleCardAction"
/>

const card = computed(() => ({
  id: 1,
  title: t('subscriptionCard.titles.featuredLibrary'),
  price: '30.99',
  oldPrice: '999.99',
  videos: '12',
  photos: '45',
  mediaCount: '5',
  image: cardImageUrl.value,
  ${switchFeaturesCode}
}));`,
    subscribe: `${importBlock}

<!-- ProfileSubscriptionCards.vue — mode === 'subscribe' (green Subscribe CTA) -->
<SubscriptionCard
  :card-data="card"
  static
  is-current
  :current-subscription-price="0"
  action-mode="subscribe"
  @trigger-action="handleCardAction"
/>

const card = computed(() => ({
  id: 'crave',
  title: t('subscriptionCard.plans.crave'),
  price: '1',
  oldPrice: '5.00',
  videos: '1',
  photos: '4',
  mediaCount: '1',
  image: cardImageUrl.value,
  ${subscribeFeaturesCode}
}));`,
    free: `${importBlock}

<!-- ProfileSubscriptionCards.vue — subscribePlans free tier (centered card) -->
<SubscriptionCard
  :card-data="card"
  static
  is-current
  :current-subscription-price="0"
  action-mode="subscribe"
  @trigger-action="handleCardAction"
/>

const card = computed(() => ({
  id: 'free',
  title: t('subscriptionCard.plans.free'),
  price: 'Free',
  oldPrice: '',
  videos: '0',
  photos: '0',
  mediaCount: '0',
  image: cardImageUrl.value,
  ${subscribeFeaturesCode}
}));`,
}));
</script>
