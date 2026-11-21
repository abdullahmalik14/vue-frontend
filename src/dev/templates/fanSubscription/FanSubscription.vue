<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import FanSubscriptionCard from '@/dev/components/fanSubscription/FanSubscriptionCard.vue';
import FanSubscriptionUnsubscribePopup from '@/dev/components/fanSubscription/FanSubscriptionUnsubscribePopup.vue';
import FanSubscriptionCancelledPopup from '@/dev/components/fanSubscription/FanSubscriptionCancelledPopup.vue';
import FanSubscriptionHistoryPopup from '@/dev/components/fanSubscription/FanSubscriptionHistoryPopup.vue';

const { t } = useI18n();
const unsubscribeStep = ref(null);
const historyCardId = ref(null);
const unsubscribedCard = ref(null);
const showToast = ref(false);
let toastTimer = null;

const toastTitle = computed(() =>
  t('fanSubscription.card.unsubscribedToast', {
    name: unsubscribedCard.value?.title || t('fanSubscription.card.title'),
  }),
);

function onCardUnsubscribe(card) {
  unsubscribedCard.value = card;
  unsubscribeStep.value = 'offer';
}

function onUnsubscribeConfirmed() {
  unsubscribeStep.value = 'cancelled';
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
    toastTimer = null;
  }, 4500);
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

const asset = (file) => `/dev/cdn/fan-subscription/${file}`;

const sharedThumbnails = [
  {
    src: asset('thumb-shared-a.png'),
    style: { height: '235.57%', left: '-23.42%', top: '-135.09%', width: '177.37%' },
  },
  {
    src: asset('thumb-shared-b.png'),
    style: { height: '216.75%', left: '-17.43%', top: '-113.37%', width: '163.2%' },
  },
  {
    src: asset('thumb-shared-a.png'),
    style: { height: '198.33%', left: '-2.87%', top: '-51.12%', width: '149.33%' },
  },
];

const cardMedia = [
  {
    cover: asset('cover-1.png'),
    thumbnails: [
      { src: asset('thumb-1a.png') },
      { src: asset('thumb-1b.png') },
      { src: asset('thumb-1c.png') },
    ],
  },
  { cover: asset('cover-2.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-3.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-4.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-5.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-6.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-7.png'), thumbnails: sharedThumbnails },
  { cover: asset('cover-8.png'), thumbnails: sharedThumbnails },
];

const cards = computed(() =>
  cardMedia.map((item, index) => ({
    id: index + 1,
    cover: item.cover,
    thumbnails: item.thumbnails,
    handle: t('fanSubscription.card.handle'),
    title: t('fanSubscription.card.title'),
    updated: t('fanSubscription.card.updated'),
    followers: t('fanSubscription.card.followersValue'),
    likes: t('fanSubscription.card.likesValue'),
    subscribers: t('fanSubscription.card.subscribersValue'),
    videoCount: 10,
    imageCount: 15,
    galleryCount: 10,
    audioCount: 5,
    bio: t('fanSubscription.card.bio'),
  })),
);
</script>

<template>
  <DashboardSharedTwoColLayout>
    <div
      data-component="fan-subscription-page"
      class="relative flex min-h-screen flex-col"
    >
      <div class="relative z-[1] flex flex-1 flex-col p-2 md:px-10 md:py-8">
        <header class="relative z-[1] shrink-0">
          <Heading
            tag="h1"
            theme="custom"
            no-wrap
            add-class="text-[30px] font-medium leading-normal text-[#475467] md:text-[1.75rem] dark:text-[#bdb8af]"
            :text="t('fanSubscription.page.title')"
          />
        </header>

        <ul class="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <li
            v-for="card in cards"
            :key="card.id"
            class="min-w-0"
            :class="historyCardId != null && historyCardId !== card.id ? 'opacity-20' : ''"
          >
            <FanSubscriptionCard
              :cover="card.cover"
              @unsubscribe="onCardUnsubscribe(card)"
              @history="historyCardId = card.id"
              :thumbnails="card.thumbnails"
              :handle="card.handle"
              :title="card.title"
              :updated="card.updated"
              :followers="card.followers"
              :likes="card.likes"
              :subscribers="card.subscribers"
              :video-count="card.videoCount"
              :image-count="card.imageCount"
              :gallery-count="card.galleryCount"
              :audio-count="card.audioCount"
              :bio="card.bio"
            />
          </li>
        </ul>
      </div>
    </div>
    <FanSubscriptionUnsubscribePopup
      :model-value="unsubscribeStep === 'offer' || unsubscribeStep === 'confirm'"
      :step="unsubscribeStep === 'confirm' ? 'confirm' : 'offer'"
      @update:model-value="(open) => { if (!open && (unsubscribeStep === 'offer' || unsubscribeStep === 'confirm')) unsubscribeStep = null }"
      @to-confirm="unsubscribeStep = 'confirm'"
      @confirm="onUnsubscribeConfirmed"
    />
    <Teleport to="body">
      <div
        v-if="showToast"
        class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto sm:left-auto sm:right-2 sm:top-2 sm:w-[min(30rem,calc(100vw-1rem))]"
      >
        <NotificationCard
          v-model="showToast"
          variant="notice"
          :title="toastTitle"
          :closable="false"
        >
          <template #icon>
            <img
              :src="unsubscribedCard?.cover"
              alt=""
              class="h-10 w-10 rounded-[4px] object-cover"
            />
          </template>
        </NotificationCard>
      </div>
    </Teleport>
    <FanSubscriptionHistoryPopup
      :model-value="historyCardId != null"
      @update:model-value="(open) => { if (!open) historyCardId = null }"
    />
    <FanSubscriptionCancelledPopup
      :model-value="unsubscribeStep === 'cancelled'"
      @update:model-value="(open) => { if (!open) unsubscribeStep = null }"
    />
  </DashboardSharedTwoColLayout>
</template>
