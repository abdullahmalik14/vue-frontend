<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GuestPurchaseFlowPopup from "@/dev/components/checkout/purchase/GuestPurchaseFlowPopup.vue";
import UpgradeTierPopup from "@/dev/components/ui/popups/profile/UpgradeTierPopup.vue";
import PurchaseFlowSubscriptionOrderPopup from "@/dev/components/ui/popups/profile/PurchaseFlowSubscriptionOrderPopup.vue";
import ProfileSubscriptionPopup from "@/dev/components/ui/popups/profile/ProfileSubscriptionPopup.vue";
import CheckoutBeforeTipPopup from "@/dev/components/checkout/tip/CheckoutBeforeTipPopup.vue";
import {
  CHECKOUT_MOCK_SCENARIOS,
  getCheckoutMockScenario,
  getLastCheckoutMockResult,
  onCheckoutMockResult,
  setCheckoutMockScenario,
} from "@/dev/utils/checkout/checkoutMockApi.js";
import checkoutStateEngineSchema from "@/dev/utils/checkout/checkoutStateEngine.schema.json";
import {
  DEMO_PURCHASE_FLOWS,
  DEMO_PURCHASE_GROUPS,
} from "@/dev/utils/checkout/demoPurchaseFlows.js";
import { loadTranslationsForSection } from "@/systems/i18n/translationLoader.js";

const guestOpen = ref(false);
const upgradeOpen = ref(false);
const subscriptionOrderOpen = ref(false);
const tipBeforeCheckoutOpen = ref(false);
const plansOpen = ref(false);
const plansMode = ref("switch");
const newSubscriptionOpen = ref(false);
const newSubscriptionAlive = ref(false);
const selectedPlan = ref({ title: "Crave – All Access", price: "1.00" });
const activeFlowId = ref("");
const mockScenario = ref(getCheckoutMockScenario());
const lastMockResult = ref(getLastCheckoutMockResult());
const notice = ref("");

const activeFlow = computed(() =>
  DEMO_PURCHASE_FLOWS.find((flow) => flow.id === activeFlowId.value) || null,
);

const subscribeSession = computed(() =>
  activeFlow.value?.kind === "new-subscription" ? activeFlow.value.session || null : null,
);

const groupedFlows = computed(() =>
  DEMO_PURCHASE_GROUPS.map((group) => ({
    group,
    flows: DEMO_PURCHASE_FLOWS.filter((flow) => flow.group === group),
  })).filter((group) => group.flows.length),
);

const schemaText = JSON.stringify(checkoutStateEngineSchema, null, 2);

const setScenario = (name) => {
  mockScenario.value = setCheckoutMockScenario(name);
};

const closeAll = () => {
  guestOpen.value = false;
  upgradeOpen.value = false;
  subscriptionOrderOpen.value = false;
  tipBeforeCheckoutOpen.value = false;
  plansOpen.value = false;
  newSubscriptionOpen.value = false;
  newSubscriptionAlive.value = false;
};

const openFlow = (flow) => {
  closeAll();
  notice.value = "";
  activeFlowId.value = flow.id;
  setScenario(flow.forceScenario || mockScenario.value);

  if (flow.kind === "new-subscription") {
    plansMode.value = "subscribe";
    plansOpen.value = true;
    return;
  }

  if (flow.kind === "free-to-paid") {
    plansMode.value = "free-paid";
    plansOpen.value = true;
    return;
  }

  if (flow.kind === "paid-upgrade") {
    plansMode.value = "paid-upgrade";
    plansOpen.value = true;
    return;
  }

  if (flow.kind === "paid-to-free") {
    plansMode.value = "paid-to-free";
    plansOpen.value = true;
    return;
  }

  if (flow.kind === "paid-downgrade") {
    plansMode.value = "paid-downgrade";
    plansOpen.value = true;
    return;
  }

  if (flow.group === "Subscription") {
    plansMode.value = "switch";
    plansOpen.value = true;
    return;
  }

  if (flow.kind === "guest-checkout") {
    guestOpen.value = true;
    return;
  }

  if (flow.kind === "subscription-order") {
    subscriptionOrderOpen.value = true;
    return;
  }

  upgradeOpen.value = true;
};

const onPlanSubscribe = (card) => {
  selectedPlan.value = {
    title: card?.title || "Crave – All Access",
    price: card?.checkoutPrice || card?.price || "1.00",
  };
  plansOpen.value = false;
  newSubscriptionAlive.value = true;
  newSubscriptionOpen.value = true;
};

const onNoPaymentConfirmed = () => {
  notice.value = "Membership will update on the next billing cycle. No payment required.";
};

onMounted(() => {
  loadTranslationsForSection("dashboard-global");
  stopListening = onCheckoutMockResult((result) => {
    lastMockResult.value = result;
  });
});

let stopListening = () => {};

onUnmounted(() => {
  stopListening();
});
</script>

<template>
  <div class="min-h-screen bg-[#111111] text-[#F9FAFB] font-sans px-4 py-10 md:px-10">
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      <header class="flex flex-col gap-3">
        <p class="text-xs uppercase tracking-[0.16em] text-[#98A2B3]">Dev</p>
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
          Demo purchase flow
        </h1>
        <p class="text-sm leading-6 text-[#98A2B3] max-w-2xl">
          Click a flow to open the checkout popup. Cart, payment widget, and
          payment status are mocked here so we can test success, failure, and
          ask. Images stay on external hosts. This page does not preload
          checkout assets.
        </p>
      </header>

      <section class="flex flex-col gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
        <h2 class="text-sm font-semibold">Before checkout tip UI</h2>
        <button
          type="button"
          class="w-max px-4 h-10 rounded border border-[#07F468] text-sm font-medium text-[#07F468] hover:bg-[#07F468] hover:text-black"
          @click="tipBeforeCheckoutOpen = true"
        >
          Open tip popup
        </button>
      </section>

      <section class="flex flex-col gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
        <h2 class="text-sm font-semibold">Mock payment result</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="name in CHECKOUT_MOCK_SCENARIOS"
            :key="name"
            type="button"
            class="px-3 h-9 rounded border text-sm capitalize"
            :class="
              mockScenario === name
                ? 'bg-[#07F468] text-black border-[#07F468]'
                : 'bg-transparent text-[#F9FAFB] border-white/20'
            "
            @click="setScenario(name)"
          >
            {{ name }}
          </button>
        </div>
        <p class="text-xs text-[#98A2B3]">
          Flow 14 always uses failure. Other flows use the selected result.
        </p>
      </section>

      <section
        v-for="group in groupedFlows"
        :key="group.group"
        class="flex flex-col gap-3"
      >
        <h2 class="text-lg font-semibold">{{ group.group }}</h2>
        <div class="flex flex-col gap-2">
          <button
            v-for="flow in group.flows"
            :key="flow.id"
            type="button"
            class="text-left px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#07F468] hover:bg-white/10"
            @click="openFlow(flow)"
          >
            <span class="text-sm font-medium text-[#07F468] underline underline-offset-2">
              {{ flow.label }}
            </span>
            <span class="block mt-1 text-xs text-[#98A2B3]">
              {{ flow.video }}
            </span>
          </button>
        </div>
      </section>

      <p
        v-if="notice"
        class="text-sm text-[#07F468] px-4 py-3 rounded-lg bg-[#07F468]/10 border border-[#07F468]/30"
      >
        {{ notice }}
      </p>

      <section class="flex flex-col gap-3 p-4 rounded-lg bg-black/40 border border-white/10">
        <h2 class="text-sm font-semibold">Last mock API response</h2>
        <pre class="text-[11px] leading-5 text-[#07F468] overflow-auto max-h-56">{{
          lastMockResult ? JSON.stringify(lastMockResult, null, 2) : "No checkout API call yet."
        }}</pre>
      </section>

      <section class="flex flex-col gap-3 p-4 rounded-lg bg-black/40 border border-white/10">
        <h2 class="text-sm font-semibold">Checkout state-engine schema</h2>
        <pre class="text-[11px] leading-5 text-[#98A2B3] overflow-auto max-h-80">{{ schemaText }}</pre>
      </section>
    </div>

    <GuestPurchaseFlowPopup
      v-if="activeFlow?.kind === 'guest-checkout'"
      :key="activeFlowId"
      v-model="guestOpen"
      :product="activeFlow?.product"
      :requires-shipping="activeFlow?.requiresShipping !== false"
      :preset="activeFlow?.preset"
      :payment-scenario="activeFlow?.forceScenario || mockScenario"
      :show-debug="false"
      @paid="notice = 'Payment successful.'"
    />

    <UpgradeTierPopup
      v-if="activeFlow?.kind === 'subscription-confirm'"
      :key="activeFlowId"
      v-model="upgradeOpen"
      :current-subscription="activeFlow?.currentSubscription"
      :new-subscription="activeFlow?.newSubscription"
      :is-upgrade="activeFlow?.isUpgrade !== false"
      :requires-payment="activeFlow?.requiresPayment !== false"
      :payment-scenario="mockScenario"
      :use-new-card="Boolean(activeFlow?.orderPreset?.useNewCard)"
      @confirmed="onNoPaymentConfirmed"
    />

    <ProfileSubscriptionPopup
      v-model="plansOpen"
      :mode="plansMode"
      :session="activeFlow?.kind === 'free-to-paid' || activeFlow?.kind === 'paid-upgrade' || activeFlow?.kind === 'paid-downgrade' ? activeFlow.session : null"
      :payment-scenario="mockScenario"
      :requires-payment="activeFlow?.requiresPayment !== false"
      @subscribe="onPlanSubscribe"
      @downgraded="onNoPaymentConfirmed"
    />

    <PurchaseFlowSubscriptionOrderPopup
      v-if="newSubscriptionAlive"
      v-model="newSubscriptionOpen"
      mode="subscribe"
      :new-subscription="selectedPlan"
      :session="subscribeSession"
      :payment-scenario="mockScenario"
      @dismissed="newSubscriptionAlive = false"
      @paid="notice = 'Payment successful.'"
    />

    <PurchaseFlowSubscriptionOrderPopup
      v-if="activeFlow?.kind === 'subscription-order'"
      :key="activeFlowId"
      v-model="subscriptionOrderOpen"
      mode="new"
      :current-subscription="activeFlow?.currentSubscription"
      :new-subscription="activeFlow?.newSubscription"
      :payment-scenario="mockScenario"
      :use-new-card="true"
    />

    <CheckoutBeforeTipPopup
      v-model="tipBeforeCheckoutOpen"
      card-last4="3374"
      @confirm="(payload) => { notice = `Tip confirmed: $${payload.amount} for ${payload.modelIds.length} model(s).`; }"
      @skip="notice = 'Tip skipped.'"
    />
  </div>
</template>
