<template>
  <section class="flex flex-col gap-12">
    <DemoSectionHeader :title="t('demo.page.sections.tierCards')" />
    <p class="text-xs text-slate-500/80 -mt-8">
      {{ t('demo.tierCard.sectionDescription') }}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-x-8 gap-y-12">
      <div
        v-for="item in samples"
        :key="item.variant"
        class="flex flex-col gap-4"
      >
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t(item.labelKey) }}</span>
        <TierCard :variant="item.variant" />
        <ShowCodeToggle :code="code[item.variant]" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TierCard from '@/components/ui/card/dashboard/TierCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const samples = [
  { variant: 'standardClaim', labelKey: 'tierCard.demo.labels.tier1StandardClaim' },
  { variant: 'spendToClaim', labelKey: 'tierCard.demo.labels.tier2SpendToClaim' },
  { variant: 'standard95', labelKey: 'tierCard.demo.labels.tier3Standard95Left' },
  { variant: 'hiddenProgress', labelKey: 'tierCard.demo.labels.tier4HiddenProgress' },
  { variant: 'subscribe', labelKey: 'tierCard.demo.labels.tier5SubscribeGreen' },
];

const code = computed(() => ({
  standardClaim: `import TierCard from '@/components/ui/card/dashboard/TierCard.vue';

<!-- Preset: pink theme + standard claim footer (5 left) -->
<TierCard variant="standardClaim" />

<!-- Or pass a real tier object (PlanPage.vue) -->
<!-- <TierCard :tier="currentTierData" /> -->

<!-- variant: 'standardClaim' | 'spendToClaim' | 'standard95' | 'hiddenProgress' | 'subscribe' -->
<!-- Assets (inside TierCard via useAssetUrl / useTierCardAssets) -->
<!-- tier.demo.background, tier.demo.buttonBgPink, tier.demo.buttonBgGreen + tierCard.icon.* -->`,
  spendToClaim: `import TierCard from '@/components/ui/card/dashboard/TierCard.vue';

<!-- Preset: gold theme + spend-to-claim footer -->
<TierCard variant="spendToClaim" />`,
  standard95: `import TierCard from '@/components/ui/card/dashboard/TierCard.vue';

<!-- Preset: pink theme + standard claim (95 left) -->
<TierCard variant="standard95" />`,
  hiddenProgress: `import TierCard from '@/components/ui/card/dashboard/TierCard.vue';

<!-- Preset: pink theme + hidden progress footer -->
<TierCard variant="hiddenProgress" />`,
  subscribe: `import TierCard from '@/components/ui/card/dashboard/TierCard.vue';

<!-- Preset: green theme + subscribe footer -->
<TierCard variant="subscribe" />`,
}));
</script>
