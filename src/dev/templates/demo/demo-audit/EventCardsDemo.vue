<template>
  <section class="flex flex-col gap-12">
    <DemoSectionHeader :title="t('demo.page.sections.eventCards')" />
    <p class="text-xs text-slate-500/80 -mt-8">
      {{ t('demo.eventCard.sectionDescription') }}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-12">
      <div
        v-for="item in samples"
        :key="item.variant"
        class="flex flex-col gap-4"
      >
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t(item.labelKey) }}</span>
        <EventCard :variant="item.variant" />
        <ShowCodeToggle :code="code[item.variant]" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import EventCard from '@/components/ui/card/dashboard/EventCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const samples = [
  { variant: 'orangeButton', labelKey: 'eventCard.demo.labels.orangeButton' },
  { variant: 'orangeProgress', labelKey: 'eventCard.demo.labels.orangeProgress' },
  { variant: 'pinkButton', labelKey: 'eventCard.demo.labels.pinkButton' },
  { variant: 'pinkProgress', labelKey: 'eventCard.demo.labels.pinkProgress' },
];

const code = computed(() => ({
  orangeButton: `import EventCard from '@/components/ui/card/dashboard/EventCard.vue';

<!-- Orange theme + CTA button -->
<EventCard variant="orangeButton" />

<!-- Or: theme + hasButton -->
<!-- <EventCard theme="orange" :hasButton="true" /> -->

<!-- variant: 'orangeButton' | 'orangeProgress' | 'pinkButton' | 'pinkProgress' -->
<!-- Assets (inside EventCard via useAssetUrl) -->
<!-- tier.demo.background, event.demo.catImage, icon.notification.close, icon.media.verified, event.demo.tooltip -->`,
  orangeProgress: `import EventCard from '@/components/ui/card/dashboard/EventCard.vue';

<!-- Orange theme + dual progress (no CTA) -->
<EventCard variant="orangeProgress" />`,
  pinkButton: `import EventCard from '@/components/ui/card/dashboard/EventCard.vue';

<!-- Pink theme + CTA button -->
<EventCard variant="pinkButton" />`,
  pinkProgress: `import EventCard from '@/components/ui/card/dashboard/EventCard.vue';

<!-- Pink theme + dual progress (no CTA) -->
<EventCard variant="pinkProgress" />`,
}));
</script>
