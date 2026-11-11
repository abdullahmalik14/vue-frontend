<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.subscriptionPlanCard.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-xl">
            <!-- Subscribe login — default (old) gold card -->
            <div class="flex flex-col gap-3">
                <SubscriptionPlanCard
                    theme="defaultGold"
                    :title="t('subscriptionPlanCard.titleFeatured')"
                    :price="t('subscriptionPlanCard.price')"
                    :period="t('subscriptionCard.perMonth')"
                    :background-image="assets.featuredMediaBg"
                    :footer-text="t('subscriptionPlanCard.footerBillingCycle')"
                />
                <ShowCodeToggle :code="code.defaultGold" />
            </div>

            <!-- PurchaseFlowSubscriptionOrderPopup — upgrade: current + new -->
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-[#98A2B3]">{{ t('subscriptionCard.badges.currentSubscription') }}</span>
                    <SubscriptionPlanCard
                        theme="upgradeCurrent"
                        :title="t('subscriptionPlanCard.titleFeatured')"
                        :price="t('subscriptionPlanCard.price')"
                        :period="t('subscriptionCard.perMonth')"
                        :background-image="assets.profileSlideinBg"
                        footer-text=""
                        :logo-image="assets.planLogo"
                    />
                </div>
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-[#98A2B3]">{{ t('subscriptionPlanCard.labelNew') }}</span>
                    <SubscriptionPlanCard
                        theme="upgradeNew"
                        :title="t('subscriptionPlanCard.titleFeatured')"
                        :price="t('subscriptionPlanCard.price')"
                        :period="t('subscriptionCard.perMonth')"
                        :background-image="assets.profileSlideinBg"
                        :footer-text="t('subscriptionPlanCard.footerBillingCycle')"
                        :logo-image="assets.planLogo"
                    />
                </div>
                <ShowCodeToggle :code="code.upgrade" />
            </div>

            <!-- PurchaseFlowSubscriptionOrderPopup — subscribe / new membership -->
            <div class="flex flex-col gap-3">
                <span class="text-xs leading-normal text-[#98A2B3] dark:text-[#b0a993]">{{ t('subscriptionPlanCard.labelNew') }}</span>
                <SubscriptionPlanCard
                    theme="subscribe"
                    :title="t('subscriptionPlanCard.titleFeatured')"
                    :price="t('subscriptionPlanCard.price')"
                    :period="t('subscriptionCard.perMonth')"
                    :background-image="assets.profileSlideinBg"
                    :footer-text="t('subscriptionPlanCard.footerCheckoutStart')"
                    :logo-image="assets.planLogo"
                />
                <ShowCodeToggle :code="code.subscribe" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const importBlock = `import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();`;

const code = computed(() => ({
    defaultGold: `${importBlock}

<!-- Subscribe login — default gold card -->
<SubscriptionPlanCard
  theme="defaultGold"
  :title="t('subscriptionPlanCard.titleFeatured')"
  :price="t('subscriptionPlanCard.price')"
  :period="t('subscriptionCard.perMonth')"
  :background-image="assets.featuredMediaBg"
  :footer-text="t('subscriptionPlanCard.footerBillingCycle')"
/>`,
    upgrade: `${importBlock}

<!-- PurchaseFlowSubscriptionOrderPopup.vue — mode === 'upgrade' -->
<div class="flex flex-col gap-1">
  <span class="text-xs text-[#98A2B3]">{{ t('subscriptionCard.badges.currentSubscription') }}</span>
  <SubscriptionPlanCard
    theme="upgradeCurrent"
    :title="t('subscriptionPlanCard.titleFeatured')"
    :price="t('subscriptionPlanCard.price')"
    :period="t('subscriptionCard.perMonth')"
    :background-image="assets.profileSlideinBg"
    footer-text=""
    :logo-image="assets.planLogo"
  />
</div>
<div class="flex flex-col gap-1">
  <span class="text-xs text-[#98A2B3]">{{ t('subscriptionPlanCard.labelNew') }}</span>
  <SubscriptionPlanCard
    theme="upgradeNew"
    :title="t('subscriptionPlanCard.titleFeatured')"
    :price="t('subscriptionPlanCard.price')"
    :period="t('subscriptionCard.perMonth')"
    :background-image="assets.profileSlideinBg"
    :footer-text="t('subscriptionPlanCard.footerBillingCycle')"
    :logo-image="assets.planLogo"
  />
</div>`,
    subscribe: `${importBlock}

<!-- PurchaseFlowSubscriptionOrderPopup.vue — subscribe / new membership -->
<span class="text-xs leading-normal mb-4 text-[#98A2B3] dark:text-[#b0a993] block">
  {{ t('subscriptionPlanCard.labelNew') }}
</span>
<SubscriptionPlanCard
  theme="subscribe"
  :title="t('subscriptionPlanCard.titleFeatured')"
  :price="t('subscriptionPlanCard.price')"
  :period="t('subscriptionCard.perMonth')"
  :background-image="assets.profileSlideinBg"
  :footer-text="t('subscriptionPlanCard.footerCheckoutStart')"
  :logo-image="assets.planLogo"
/>`,
}));
</script>
