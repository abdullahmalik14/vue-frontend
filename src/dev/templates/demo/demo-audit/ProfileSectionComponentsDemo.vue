<template>
    <section class="flex flex-col gap-10">
    <DemoPageViewport variant="full" class="flex flex-col items-start gap-10">
      <!-- ProfileHeaderActions -->
      <div class="flex flex-col items-start gap-3 w-full">
        <ProfileHeaderActions />
        <ShowCodeToggle :code="code.profileHeaderActions" />
        </div>

      <!-- ProfileHeaderOptionButtons -->
      <div class="flex flex-col items-start gap-3 w-full">
            <ProfileHeaderOptionButtons />
            <ShowCodeToggle :code="code.profileHeaderOptionButtons" />
        </div>

      <!-- ProfileHeaderUserDesktop -->
      <div class="flex flex-col items-start gap-3 w-full">
            <ProfileHeaderUserDesktop />
            <ShowCodeToggle :code="code.profileHeaderUserDesktop" />
        </div>

      <!-- ProfileMeta — dark bg, content width only -->
      <div class="flex flex-col items-start gap-3 w-full">
        <div class="w-max bg-[#0C111D] py-2">
          <ProfileMeta handle="@sukii19" :followers="35" :likes="14" :subscribers="2" />
        </div>
            <ShowCodeToggle :code="code.profileMeta" />
        </div>

      <!-- ProfileRightButtons -->
      <div class="flex flex-col items-start gap-3 w-full">
        <div class="w-full flex justify-start">
          <ProfileRightButtons placement="static" />
        </div>
            <ShowCodeToggle :code="code.profileRightButtons" />
        </div>

      <!-- ProfileSharing — dark strip so light icons stay visible -->
      <div class="flex flex-col items-start gap-3 w-full">
        <div class="inline-flex bg-[#0C111D] p-3">
          <ProfileSharing />
        </div>
            <ShowCodeToggle :code="code.profileSharing" />
        </div>

      <!-- ProfileSubscribeCta -->
      <div class="flex flex-col items-start gap-3 w-full overflow-x-auto">
        <div class="min-w-[45rem]">
          <ProfileSubscribeCta price="$32" old-price="45" />
        </div>
            <ShowCodeToggle :code="code.profileSubscribeCta" />
        </div>

      <!-- FeedPollCard -->
      <div class="flex flex-col items-start gap-3 w-full max-w-sm">
                        <FeedPollCard
                            day="31"
                            suffix="st"
          :title="t('profile.feed.pollTitle')"
                            :options="pollOptions"
          :total-votes="400"
          :time-left="t('profile.feed.pollTimeLeft')"
                        />
        <ShowCodeToggle :code="code.feedPollCard" />
      </div>

      <!-- FeedMediaCard -->
      <div class="flex flex-col items-start gap-3 w-full max-w-sm">
                        <FeedMediaCard
                            day="31"
                            suffix="st"
          :description="t('profile.feed.mediaDescription')"
                            :likes="205"
                            :comments="16"
          :bg-image="checkoutHeader"
          :hover-bg="sampleBg"
        />
        <ShowCodeToggle :code="code.feedMediaCard" />
        </div>

      <!-- MerchCard variants — one under another -->
      <div
        v-for="item in merchItems"
        :key="item.id"
        class="flex flex-col items-start gap-3 w-full max-w-sm"
      >
                <MerchCard
                    class="aspect-square w-full"
          :bg-image="item.bgImage"
          :title="item.title"
          :currency="item.currency"
          :price="item.price"
          :final-price="item.finalPrice"
          :description="item.description"
          :discount-text="item.discountText"
          :overlay-bg="item.overlayBg"
          :overlay-hover-bg="item.overlayHoverBg"
        />
        <ShowCodeToggle :code="item.code" />
        </div>
        </DemoPageViewport>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DemoPageViewport from '@/dev/templates/demo/DemoPageViewport.vue';
import ProfileHeaderActions from '@/dev/components/profile/ProfileHeaderActions.vue';
import ProfileHeaderOptionButtons from '@/dev/components/profile/ProfileHeaderOptionButtons.vue';
import ProfileHeaderUserDesktop from '@/dev/components/profile/ProfileHeaderUserDesktop.vue';
import ProfileMeta from '@/dev/components/profile/ProfileMeta.vue';
import ProfileRightButtons from '@/dev/components/profile/ProfileRightButtons.vue';
import ProfileSharing from '@/dev/components/profile/ProfileSharing.vue';
import ProfileSubscribeCta from '@/dev/components/profile/ProfileSubscribeCta.vue';
import FeedPollCard from '@/dev/components/ui/card/dashboard/FeedPollCard.vue';
import FeedMediaCard from '@/dev/components/ui/card/dashboard/FeedMediaCard.vue';
import MerchCard from '@/dev/components/ui/card/dashboard/MerchCard.vue';
import checkoutHeader from '/images/checkout-header.webp';
import sampleBg from '/images/slide-2.webp';

const { t } = useI18n();

const pollOptions = computed(() => [
  { label: t('profile.feed.pollOptionOrange'), percent: 70, votes: 25, checked: true },
  { label: t('profile.feed.pollOptionApple'), percent: 20, votes: 25 },
  { label: t('profile.feed.pollOptionChicken'), percent: 10, votes: 25 },
]);

const merchCardSnippet = `import MerchCard from '@/dev/components/ui/card/dashboard/MerchCard.vue';

<!-- ProfileWrapper.vue — merch tab -->
<MerchCard
  class="aspect-square w-full"
  :bgImage="item.bgImage"
  :title="item.title"
  :currency="item.currency"
  :price="item.price"
  :finalPrice="item.finalPrice"
  :description="item.description"
  :discountText="item.discountText"
  :overlayBg="item.overlayBg"
  :overlayHoverBg="item.overlayHoverBg"
/>`;

const merchItems = computed(() => [
  {
    id: 'mango-regular',
    bgImage: checkoutHeader,
    title: t('profile.merch.title'),
    currency: t('profile.merch.currency'),
    price: t('profile.merch.price'),
    finalPrice: t('profile.merch.finalPrice'),
    description: t('profile.merch.description'),
    discountText: '',
    overlayBg: 'linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))',
    overlayHoverBg: 'linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))',
    code: merchCardSnippet,
  },
  {
    id: 'mango-discount',
    bgImage: checkoutHeader,
    title: t('profile.merch.title'),
    currency: t('profile.merch.currency'),
    price: t('profile.merch.price'),
    finalPrice: t('profile.merch.finalPrice'),
    description: t('profile.merch.description'),
    discountText: t('profile.merch.discount'),
    overlayBg: 'linear-gradient(0deg, rgba(255,205,41,0.68) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))',
    overlayHoverBg: 'linear-gradient(0deg, rgba(255,205,41,0.9) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))',
    code: merchCardSnippet,
  },
  {
    id: 'out-of-stock',
    bgImage: checkoutHeader,
    title: t('profile.merch.titleOutOfStock'),
    currency: t('profile.merch.currency'),
    price: t('profile.merch.price'),
    finalPrice: t('profile.merch.finalPrice'),
    description: t('profile.merch.descriptionOutOfStock'),
    discountText: '',
    overlayBg: 'linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))',
    overlayHoverBg: 'linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))',
    code: merchCardSnippet,
  },
]);

const code = {
  profileHeaderActions: `import ProfileHeaderActions from '@/dev/components/profile/ProfileHeaderActions.vue';

<!-- ProfileHeader.vue -->
<ProfileHeaderActions />`,

  profileHeaderOptionButtons: `import ProfileHeaderOptionButtons from '@/dev/components/profile/ProfileHeaderOptionButtons.vue';

<!-- ProfileWrapper.vue -->
<ProfileHeaderOptionButtons />`,

    profileHeaderUserDesktop: `import ProfileHeaderUserDesktop from '@/dev/components/profile/ProfileHeaderUserDesktop.vue';

<!-- ProfileWrapper.vue -->
<ProfileHeaderUserDesktop />`,

    profileMeta: `import ProfileMeta from '@/dev/components/profile/ProfileMeta.vue';

<!-- ProfileWrapper.vue -->
<ProfileMeta />`,

    profileRightButtons: `import ProfileRightButtons from '@/dev/components/profile/ProfileRightButtons.vue';

<!-- ProfileWrapper.vue -->
<ProfileRightButtons />`,

    profileSharing: `import ProfileSharing from '@/dev/components/profile/ProfileSharing.vue';

<!-- ProfileWrapper.vue -->
<ProfileSharing />`,

    profileSubscribeCta: `import ProfileSubscribeCta from '@/dev/components/profile/ProfileSubscribeCta.vue';

<!-- ProfileWrapper.vue -->
<ProfileSubscribeCta />`,

  feedPollCard: `import FeedPollCard from '@/dev/components/ui/card/dashboard/FeedPollCard.vue';

<!-- ProfileWrapper.vue — feed tab -->
      <FeedPollCard
        day="31"
        suffix="st"
  :title="t('profile.feed.pollTitle')"
        :options="[
    { label: t('profile.feed.pollOptionOrange'), percent: 70, votes: 25, checked: true },
    { label: t('profile.feed.pollOptionApple'), percent: 20, votes: 25 },
    { label: t('profile.feed.pollOptionChicken'), percent: 10, votes: 25 },
        ]"
        :totalVotes="400"
  :timeLeft="t('profile.feed.pollTimeLeft')"
/>`,

  feedMediaCard: `import FeedMediaCard from '@/dev/components/ui/card/dashboard/FeedMediaCard.vue';

<!-- ProfileWrapper.vue — feed tab -->
      <FeedMediaCard
        day="31"
        suffix="st"
  :description="t('profile.feed.mediaDescription')"
        :likes="205"
        :comments="16"
        :bgImage="checkoutHeader"
        :hoverBg="sampleBg"
/>`,
};
</script>
