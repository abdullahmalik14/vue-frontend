<template>
  <section class="flex flex-col gap-10">
    <!-- TipModelCard — unselected -->
    <div class="flex flex-col gap-3">
      <TipModelCard
        :name="t('checkout.tip.demoModelName')"
        :username="t('checkout.tip.demoModelUsername')"
        :avatar-src="avatarUrl"
        :shape="2"
        :selected="false"
        :tip-label="t('checkout.tip.amount5')"
      />
      <ShowCodeToggle :code="code.tipModelCardUnselected" />
    </div>

    <!-- TipModelCard — selected -->
    <div class="flex flex-col gap-3">
      <TipModelCard
        :name="t('checkout.tip.demoModelName')"
        :username="t('checkout.tip.demoModelUsername')"
        :avatar-src="avatarUrl"
        :shape="2"
        :selected="true"
        :tip-label="t('checkout.tip.amount5')"
      />
      <ShowCodeToggle :code="code.tipModelCardSelected" />
    </div>

    <!-- TipAmountOption — unselected -->
    <div class="flex flex-col gap-3">
      <TipAmountOption
        :icon-src="iconStar"
        :label="t('checkout.tip.amount1')"
        :selected="false"
      />
      <ShowCodeToggle :code="code.tipAmountOptionUnselected" />
    </div>

    <!-- TipAmountOption — selected -->
    <div class="flex flex-col gap-3">
      <TipAmountOption
        :icon-src="iconCoffee"
        :label="t('checkout.tip.amount5')"
        icon-class="w-12 h-12 object-contain"
        :selected="true"
      />
      <ShowCodeToggle :code="code.tipAmountOptionSelected" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import TipAmountOption from '@/dev/components/checkout/tip/TipAmountOption.vue';
import TipModelCard from '@/dev/components/checkout/tip/TipModelCard.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const { url: avatarUrl } = useAssetUrl('checkout.tip.avatarCarrot');
const { url: iconStar } = useAssetUrl('checkout.tip.iconStar');
const { url: iconCoffee } = useAssetUrl('checkout.tip.iconCoffee');

const code = computed(() => ({
  tipModelCardUnselected: `import TipModelCard from '@/dev/components/checkout/tip/TipModelCard.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: avatarUrl } = useAssetUrl('checkout.tip.avatarCarrot');

<!-- CheckoutBeforeTipPopup.vue — unselected -->
<TipModelCard
  :name="t('checkout.tip.demoModelName')"
  :username="t('checkout.tip.demoModelUsername')"
  :avatar-src="avatarUrl"
  :shape="2"
  :selected="false"
  :tip-label="t('checkout.tip.amount5')"
  @select="toggleModel(model.id)"
/>`,
  tipModelCardSelected: `import TipModelCard from '@/dev/components/checkout/tip/TipModelCard.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: avatarUrl } = useAssetUrl('checkout.tip.avatarCarrot');

<!-- CheckoutBeforeTipPopup.vue — selected -->
<TipModelCard
  :name="t('checkout.tip.demoModelName')"
  :username="t('checkout.tip.demoModelUsername')"
  :avatar-src="avatarUrl"
  :shape="2"
  :selected="true"
  :tip-label="t('checkout.tip.amount5')"
  @select="toggleModel(model.id)"
  @deselect="deselectModel(model.id)"
/>`,
  tipAmountOptionUnselected: `import TipAmountOption from '@/dev/components/checkout/tip/TipAmountOption.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: iconStar } = useAssetUrl('checkout.tip.iconStar');

<!-- CheckoutBeforeTipPopup.vue — unselected -->
<TipAmountOption
  :icon-src="iconStar"
  :label="t('checkout.tip.amount1')"
  :selected="false"
  @select="selectedAmountId = '1'"
/>`,
  tipAmountOptionSelected: `import TipAmountOption from '@/dev/components/checkout/tip/TipAmountOption.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: iconCoffee } = useAssetUrl('checkout.tip.iconCoffee');

<!-- CheckoutBeforeTipPopup.vue — selected -->
<TipAmountOption
  :icon-src="iconCoffee"
  :label="t('checkout.tip.amount5')"
  icon-class="w-12 h-12 object-contain"
  :selected="true"
  @select="selectedAmountId = '5'"
/>`,
}));
</script>
