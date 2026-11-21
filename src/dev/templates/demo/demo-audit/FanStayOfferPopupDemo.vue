<template>
  <section class="flex flex-col gap-6">
    <DemoSectionHeader :title="t('demo.page.sections.stayOffer')" />
    <div class="flex flex-col items-start gap-3">
      <DashboardPrimaryButton
        :text="t('fanSubscription.stayOffer.open')"
        theme="settingsSave"
        @click="showStayOffer = true"
      />
      <FanSubscriptionStayOfferPopup
        v-model="showStayOffer"
        @accept="showStayOffer = false"
        @decline="showStayOffer = false"
      />
      <ShowCodeToggle :code="code" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import FanSubscriptionStayOfferPopup from '@/dev/components/fanSubscription/FanSubscriptionStayOfferPopup.vue';

const { t } = useI18n();
const showStayOffer = ref(false);

const code = `import { ref } from 'vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import FanSubscriptionStayOfferPopup from '@/dev/components/fanSubscription/FanSubscriptionStayOfferPopup.vue';

const showStayOffer = ref(false);

<DashboardPrimaryButton
  :text="t('fanSubscription.stayOffer.open')"
  theme="settingsSave"
  @click="showStayOffer = true"
/>

<FanSubscriptionStayOfferPopup
  v-model="showStayOffer"
  @accept="showStayOffer = false"
  @decline="showStayOffer = false"
/>`;
</script>
