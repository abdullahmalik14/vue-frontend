<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-10 w-full max-w-3xl">
      <!-- SubscriptionVariations — unlimited usage -->
    <div class="flex flex-col gap-3">
        <PlanUsageBadge unlimited />
        <ShowCodeToggle :code="code.usageUnlimited" />
    </div>

      <!-- SubscriptionVariations — counted usage -->
    <div class="flex flex-col gap-3">
        <PlanUsageBadge usage-start="0" usage-limit="100" />
        <ShowCodeToggle :code="code.usageCounted" />
    </div>

      <!-- LuckyDrawSection — offer tag -->
    <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
          <LuckyDrawOfferTag
            :label="t('plan.variation.mock.item90Off1y')"
            :tokens="t('plan.variation.mock.tokens1of1')"
          />
          <LuckyDrawOfferTag
            :label="t('plan.variation.mock.itemFree1m')"
            :tokens="t('plan.variation.mock.tokens50of50')"
          />
          <LuckyDrawOfferTag
            :label="t('plan.variation.mock.itemLifetime50')"
            :tokens="t('plan.variation.mock.tokens1of1')"
          />
        </div>
        <ShowCodeToggle :code="code.offerTag" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PlanUsageBadge from '@/dev/components/plan/parts/PlanUsageBadge.vue';
import LuckyDrawOfferTag from '@/dev/components/plan/parts/LuckyDrawOfferTag.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const code = computed(() => ({
  usageUnlimited: `import PlanUsageBadge from '@/dev/components/plan/parts/PlanUsageBadge.vue';

<!-- SubscriptionVariations.vue -->
<PlanUsageBadge unlimited />`,
  usageCounted: `import PlanUsageBadge from '@/dev/components/plan/parts/PlanUsageBadge.vue';

<!-- SubscriptionVariations.vue -->
<PlanUsageBadge
  :usage-start="plan.usageStart"
  :usage-limit="plan.usageLimit"
/>`,
  offerTag: `import LuckyDrawOfferTag from '@/dev/components/plan/parts/LuckyDrawOfferTag.vue';

<!-- LuckyDrawSection.vue -->
<LuckyDrawOfferTag
  :label="t('plan.variation.mock.item90Off1y')"
  :tokens="t('plan.variation.mock.tokens1of1')"
/>`,
}));
</script>
