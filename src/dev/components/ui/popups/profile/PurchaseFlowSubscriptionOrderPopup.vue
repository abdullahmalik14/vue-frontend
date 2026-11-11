<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  createStepStateEngine,
  attachEngineLogging,
} from "@/utils/stateEngine";

// Components
import BasePopup from "@/components/ui/popups/BasePopup.vue";
import BasePlanDropdown from "@/components/ui/dropdowns/BasePlanDropdown.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import BaseInput from "@/components/forms/inputs/BaseInput.vue";
import AddressCard from "@/dev/components/checkout/reusable/AddressCard.vue";
import SectionToggleHeader from "@/dev/components/checkout/reusable/SectionToggleHeader.vue";
import CheckoutNotes from "@/dev/components/checkout/reusable/CheckoutNotes.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import TotalAmountRow from "@/dev/components/checkout/reusable/TotalAmountRow.vue";
import PaymentMethodNotLoggedIn from "@/dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue";
import PaymentMethodLoggedIn from "@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue";
import SubscriptionPlanCard from "@/dev/components/checkout/reusable/SubscriptionPlanCard.vue";

import { submitCheckoutPayment } from "@/dev/utils/checkout/checkoutMockApi.js";
import ProceedPaymentAgreePopup from "@/dev/components/ui/popups/payment/ProceedPaymentAgreePopup.vue";
import PaymentSuccessfulPopup from "@/dev/components/ui/popups/payment/PaymentSuccessfulPopup.vue";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
import { useCheckoutDemoAssets } from "@/dev/composables/useCheckoutDemoAssets.js";

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // ✅ NEW PROP: Controls flow ('new' or 'upgrade')
  mode: { type: String, default: "upgrade" },
  currentSubscription: { type: Object, default: null },
  newSubscription: { type: Object, default: null },
  paymentScenario: { type: String, default: "" },
  useNewCard: { type: Boolean, default: false },
  session: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "dismissed", "paid"]);

// Generate unique ID for Teleport target to avoid conflicts
const uid = `subscription-total-target-${Math.random().toString(36).substring(2, 9)}`;

// --- 1. STATE ENGINE SETUP ---
const checkout = createStepStateEngine({
  flowId: "checkoutFlow",
  // ✅ LOGIC: Agar upgrade hai to direct Step 2, warna Step 1
  initialStep: props.mode === "upgrade" ? 2 : 1,
  defaults: {
    email: "",
    // Step 1 Fields
    firstName: props.mode === "upgrade" ? "John" : "", // (dummy data for upgrade)
    lastName: props.mode === "upgrade" ? "Carley" : "",
    addressLine1: props.mode === "upgrade" ? "c1 1st floor" : "",
    addressLine2: props.mode === "upgrade" ? "London" : "",
    postalCode: props.mode === "upgrade" ? "55552" : "",
    city: props.mode === "upgrade" ? "New York" : "",
    selectedCountry: props.mode === "upgrade" ? "new-york" : "",
    selectedState: props.mode === "upgrade" ? "florida" : "",
    saveAddress: props.mode === "upgrade" ? true : false,
    sameAddress: true,
    termsAgreed: false,

    // Step 2 Fields
    paymentCardNumber: props.mode === "upgrade" ? "4242424242423507" : "",
    paymentExpiry: props.mode === "upgrade" ? "02/30" : "",
    paymentCardHolder: props.mode === "upgrade" ? "John Carter" : "",
    paymentCvv: "", // CVV
    // ✅ LOGIC: by default in upgrade popup payment will be saved
    paymentSaveCard: props.mode === "upgrade",

    orderNotes: "",
  },
});

attachEngineLogging(checkout);

// --- Config Variables ---
const purchaseFlowSubscriptionPopupConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: false,
  shouldCloseOnEscape: true,
  width: { default: "80%", "<1009": "60%","<768": "100%" },
  height: { default: "90%", "<768": "100%" },
  scrollable: false,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const billingOpen = ref(true);
const shippingOpen = ref(true);
const paymentOpen = ref(true);
const subscriptionOpen = ref(true);
const shiipingStep2Open = ref(true); // Fixed typo variable

// Options (Same as before)
const countryOptions = [
  { label: "Hong Kong", value: "hong-kong" },
  { label: "Australia", value: "australia" },
  { label: "USA", value: "usa" },
];
const stateOptions = [
  { label: "Florida", value: "florida" },
  { label: "Hawaii", value: "hawaii" },
  { label: "New York", value: "new-york" },
];

// --- Logic Helpers ---
const dynamicShippingAddress = computed(() => {
  const s = checkout.state;
  const parts = [
    `${s.firstName} ${s.lastName}`.trim(),
    s.addressLine1,
    s.city,
    s.selectedCountry,
  ].filter(Boolean);
  return parts.length > 0
    ? parts.join(", ")
    : "Please fill billing address first";
});

const isSubscribeMode = computed(() => props.mode === "subscribe");
const showsEmailAndPayment = computed(
  () => isSubscribeMode.value || Boolean(props.session?.loggedIn),
);

const checkoutIcons = {
  chevron: "/images/checkout-dropdown-chevron.png",
  addCard: "/images/checkout-add-card.png",
  deleteCard: "/images/checkout-delete-card.png",
  deleteCardActive: "/images/checkout-delete-card-active.png",
  visa: "/images/checkout-visa.png",
};

const sessionLoggedIn = ref(false);
const sessionUsername = ref("");
const tokenList = ref([]);
const showCardPicker = ref(false);
const hoveredTokenId = ref("");
const selectedTokenId = ref("");

const savedTokens = computed(() => tokenList.value);
const hasSavedPayment = computed(() => savedTokens.value.length > 0);
const showingSavedCard = ref(false);

const maskedToken = (card) => {
  const digits = String(card?.number || "").replace(/\D/g, "");
  const last4 = digits.slice(-4) || "0000";
  return `**** ${last4}`;
};

const hasCardFields = (s) => {
  return (
    s.paymentCardNumber?.trim().length > 0 &&
    s.paymentExpiry?.trim().length > 0 &&
    s.paymentCvv?.trim().length > 0 &&
    s.paymentCardHolder?.trim().length > 0
  );
};

const isStepValid = computed(() => {
  const s = checkout.state;
  if (isSubscribeMode.value) {
    const hasEmail = sessionLoggedIn.value || s.email?.trim().length > 0;
    const hasPayment = showingSavedCard.value || hasCardFields(s);
    return !!(hasEmail && hasPayment && s.termsAgreed === true);
  }
  if (checkout.step === 1) {
    const hasName = s.firstName?.trim() && s.lastName?.trim();
    const hasAddress =
      s.addressLine1?.trim() && s.city?.trim() && s.selectedCountry;
    const hasTerms = s.termsAgreed === true;
    return !!(hasName && hasAddress && hasTerms);
  }
  if (checkout.step === 2) {
    // Agar Saved Card view active hai, toh valid maano (assuming saved card is valid)
    if (s.paymentSaveCard) return true;
    return hasCardFields(s);
  }
  return false;
});

const buttonText = computed(() => {
  if (!isSubscribeMode.value && checkout.step === 1) return "Next";
  return "Proceed Payment";
});

const arrowIconClass = computed(() => {
  if (isStepValid.value) {
    return "w-6 h-6 brightness-0 opacity-100 contrast-[200%] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(66%)_sepia(68%)_saturate(2102%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] transition-all duration-200";
  } else {
    return "w-6 h-6 brightness-0 invert opacity-30";
  }
});

const paymentMessage = ref("");
const paymentStatus = ref("");
const isPaying = ref(false);
const showPaymentFailedToast = ref(false);
const PAYMENT_FAILED_TOAST_MS = 4000;
let paymentFailedToastTimer = null;

const clearPaymentFailedToastTimer = () => {
  if (!paymentFailedToastTimer) return;
  clearTimeout(paymentFailedToastTimer);
  paymentFailedToastTimer = null;
};

watch(showPaymentFailedToast, (open) => {
  clearPaymentFailedToastTimer();
  if (!open) return;
  paymentFailedToastTimer = setTimeout(() => {
    paymentFailedToastTimer = null;
    showPaymentFailedToast.value = false;
  }, PAYMENT_FAILED_TOAST_MS);
});

const paymentStep = computed(() => (isSubscribeMode.value ? 1 : 2));

const checkoutTotal = computed(() => {
  if (props.mode === "upgrade") return "6.99";
  return props.newSubscription?.price || (isSubscribeMode.value ? "1.00" : "499.99");
});

const successAmount = computed(() => {
  const raw = String(checkoutTotal.value).replace(/[^0-9.]/g, "");
  const [dollars, cents = "00"] = raw.split(".");
  return {
    dollars: dollars || "0",
    cents: cents.padEnd(2, "0").slice(0, 2),
  };
});

const setCheckoutOpen = (open) => {
  emit("update:modelValue", open);
  if (!open && checkout.step !== 4) emit("dismissed");
};

const applyNewCardPreset = () => {
  if (!props.useNewCard) return;
  checkout.setState("paymentSaveCard", false, { reason: "demo-new-card" });
  checkout.setState("paymentCardNumber", "", { reason: "demo-new-card" });
  checkout.setState("paymentExpiry", "", { reason: "demo-new-card" });
  checkout.setState("paymentCardHolder", "", { reason: "demo-new-card" });
  checkout.setState("paymentCvv", "", { reason: "demo-new-card" });
};

const useNewCard = () => {
  showingSavedCard.value = false;
  checkout.setState("paymentSaveCard", false, { reason: "use-new-card" });
  checkout.setState("paymentCardNumber", "", { reason: "use-new-card" });
  checkout.setState("paymentExpiry", "", { reason: "use-new-card" });
  checkout.setState("paymentCardHolder", "", { reason: "use-new-card" });
  checkout.setState("paymentCvv", "", { reason: "use-new-card" });
  showCardPicker.value = false;
};

const applySavedCard = (card, reason = "select-token") => {
  if (!card) return;
  selectedTokenId.value = card.id || card.number || "";
  showingSavedCard.value = true;
  checkout.setState("paymentCardNumber", card.number || "", { reason });
  checkout.setState("paymentExpiry", card.expiry || "", { reason });
  checkout.setState("paymentCardHolder", card.holder || "", { reason });
  checkout.setState("paymentCvv", "", { reason });
  checkout.setState("paymentSaveCard", true, { reason });
  showCardPicker.value = false;
};

const removeSavedCard = () => {
  const id = selectedTokenId.value;
  if (id) {
    tokenList.value = tokenList.value.filter((item) => (item.id || item.number) !== id);
  }
  selectedTokenId.value = "";
  showCardPicker.value = false;
  if (tokenList.value[0]) {
    applySavedCard(tokenList.value[0], "delete-card");
    return;
  }
  useNewCard();
};

const removeToken = (card) => {
  const id = card?.id || card?.number;
  tokenList.value = tokenList.value.filter((item) => (item.id || item.number) !== id);
  if (selectedTokenId.value === id) {
    if (tokenList.value[0]) applySavedCard(tokenList.value[0], "delete-token");
    else useNewCard();
  }
  if (!tokenList.value.length) showCardPicker.value = false;
};

const handleLogout = () => {
  sessionLoggedIn.value = false;
  sessionUsername.value = "";
  checkout.setState("email", "", { reason: "popup-logout" });
};

const applySession = () => {
  const session = props.session;
  tokenList.value = [];
  showingSavedCard.value = false;
  showCardPicker.value = false;
  hoveredTokenId.value = "";
  selectedTokenId.value = "";
  sessionLoggedIn.value = false;
  sessionUsername.value = "";
  if (!session?.loggedIn) return;
  sessionLoggedIn.value = true;
  sessionUsername.value = session.username || "";
  checkout.setState("email", session.email || "", { reason: "saved-session" });
  const cards = Array.isArray(session.savedCards) && session.savedCards.length
    ? session.savedCards
    : session.savedCard
      ? [session.savedCard]
      : [];
  tokenList.value = cards.map((card, index) => ({
    ...card,
    id: card.id || `card-${index + 1}`,
  }));
  if (session.useNewCard) {
    useNewCard();
    return;
  }
  if (tokenList.value[0]) applySavedCard(tokenList.value[0], "saved-session");
};

watch(() => props.session, applySession);

watch(
  () => checkout.state.paymentSaveCard,
  (saved) => {
    if (!saved || !hasSavedPayment.value) return;
    const number = String(checkout.state.paymentCardNumber || "").replace(/\s/g, "");
    if (number.length < 4) return;
    const exists = tokenList.value.some(
      (card) => String(card.number || "").replace(/\s/g, "") === number,
    );
    if (exists) return;
    const card = {
      id: `card-${Date.now()}`,
      number,
      holder: checkout.state.paymentCardHolder || "",
      expiry: checkout.state.paymentExpiry || "",
      brand: "visa",
    };
    tokenList.value = [...tokenList.value, card];
    selectedTokenId.value = card.id;
  },
);

const closeAgreeStep = () => {
  if (checkout.step !== 3) return;
  checkout.goToStep(paymentStep.value, { force: true, intent: "close-agree" });
};

const closeSuccessStep = () => {
  if (checkout.step !== 4) return;
  checkout.goToStep(paymentStep.value, { force: true, intent: "close-success" });
  emit("update:modelValue", false);
  emit("dismissed");
};

const submitPayment = async () => {
  if (isPaying.value) return;
  isPaying.value = true;
  paymentMessage.value = "";
  paymentStatus.value = "";
  try {
    const result = await submitCheckoutPayment({
      flowType: "subscription",
      product: props.newSubscription,
      scenario: props.paymentScenario,
    });
    const status = result.body?.status || (result.ok ? "paid" : "failed");
    paymentStatus.value = status;
    paymentMessage.value = result.body?.message || "";
    if (status === "paid") {
      await checkout.goToStep(4, { force: true, intent: "payment-success" });
      emit("update:modelValue", false);
      emit("paid", result);
      return;
    }
    if (status === "failed") {
      paymentMessage.value = "";
    }
    closeAgreeStep();
    if (status === "failed") {
      showPaymentFailedToast.value = true;
    }
  } finally {
    isPaying.value = false;
  }
};

const confirmAgreeAndPay = async () => {
  checkout.setState("termsAgreed", true, { reason: "agree-proceed" });
  await submitPayment();
};

const handleNextStep = async () => {
  if (!isSubscribeMode.value && checkout.step === 1) {
    checkout.goToStep(2);
    return;
  }
  if (isPaying.value) return;
  await checkout.goToStep(3, { force: true, intent: "open-agree" });
};

const handleBack = () => {
  // Agar Upgrade mode hai aur step 2 par hai, toh back popup close karega (kyunki step 1 exist nahi karta user ke liye)
  if (props.mode === "upgrade" && checkout.step === 2) {
    setCheckoutOpen(false);
    return;
  }

  if (checkout.step > 1) {
    checkout.goToStep(checkout.step - 1);
  } else {
    setCheckoutOpen(false);
  }
};

// Layout Logic (Unchanged)
const LG_BREAKPOINT = 1010;
const isLargeScreen = ref(false);
const rightColumnRef = ref(null);
const isMounted = ref(false);

const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= LG_BREAKPOINT;
};

onMounted(async () => {
  checkout.initialize({ fromUrl: false });
  applySession();
  applyNewCardPreset();
  await nextTick();
  isMounted.value = true;
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize, { passive: true });
});

onUnmounted(() => {
  clearPaymentFailedToastTimer();
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<template>
  <BasePopup :modelValue="modelValue" @update:modelValue="setCheckoutOpen"
    :popupConfig="purchaseFlowSubscriptionPopupConfig">
    <button
      type="button"
      class="absolute right-0 top-0 z-[80] hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#3A3A3A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] md:flex"
      @click="setCheckoutOpen(false)"
    >
      <img
        src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp"
        alt="close"
        class="h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(100%)]"
      />
    </button>
    <div
      class="bg-[#FFFFFF1A] backdrop-blur-[50px] flex h-full flex-col overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#35393b] lg:block">
      <div
        class="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] md:rounded-t-[0.625rem] lg:h-full lg:overflow-visible dark:bg-[#181a1b]/10">
        <div class="absolute inset-0  pointer-events-none z-[-1] lg:backdrop-blur-[10px]"></div>

        <div @click="setCheckoutOpen(false)" class="flex items-center gap-1 px-2 py-1 md:hidden">
          <div class="flex justify-center items-center w-10 h-10 cursor-pointer">
            <img src="https://i.ibb.co.com/Gvkq58F5/chevron-left.webp" alt="chevron-left" class="w-6 h-6" />
          </div>
        </div>

        <div class="flex min-h-0 grow flex-col gap-6 overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] md:px-4 md:pt-6 lg:h-full lg:min-h-0 lg:flex-row lg:gap-0 lg:overflow-visible lg:p-0">
          <div v-if="!showsEmailAndPayment" id="mobile-summary-target-subscription" class="w-full lg:hidden"></div>

          <div
            class="flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:py-6 lg:grow lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <template v-if="showsEmailAndPayment">
              <SectionToggleHeader title="BILLING EMAIL" icon="https://i.ibb.co.com/XfdvLvLC/mail.webp"
                v-model="billingOpen" :showChevron="false" :toggleable="false">
                <div v-if="sessionLoggedIn" class="flex justify-between items-end">
                  <div class="flex items-center gap-2 py-1">
                    <div class="flex justify-center items-center w-10 h-9">
                      <img src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp" alt="avatar"
                        class="h-full object-cover" />
                    </div>
                    <div class="flex flex-col">
                      <h3 class="text-xs leading-normal font-semibold text-white">{{ sessionUsername }}</h3>
                      <span class="text-xs leading-normal font-medium text-[#98A2B3]">{{ checkout.state.email }}</span>
                    </div>
                  </div>
                  <button type="button"
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="handleLogout">
                    <img src="https://i.ibb.co.com/Gfb88yFY/log-out.webp" alt="log-out"
                      class="w-3 h-3 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]" />
                    <span class="text-xs leading-normal font-medium text-[#98A2B3]">Log out</span>
                  </button>
                </div>
                <div v-else class="flex flex-col gap-4">
                  <p class="text-sm text-white">
                    Already have an account?
                    <span class="text-[#07F468] font-bold cursor-pointer">Log in</span>
                  </p>
                  <div
                    class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-[#FFFFFF1A] shadow-[0_1px_2px_0_#1018280D]">
                    <input type="email" placeholder="Email" v-model="checkout.state.email"
                      class="text-base text-white placeholder:text-[#F9FAFB]/50 w-full outline-none border-none bg-transparent" />
                  </div>
                </div>
              </SectionToggleHeader>

              <div id="mobile-summary-target-subscription" class="w-full lg:hidden"></div>

              <SectionToggleHeader title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png" v-model="paymentOpen"
                :showChevron="false" :toggleable="false">
                <template v-if="hasSavedPayment" #headerAction>
                  <div class="relative">
                    <button type="button"
                      class="flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                      @click="showCardPicker = !showCardPicker">
                      <span class="text-xs leading-normal font-medium text-[#98A2B3]">Change Card</span>
                      <img :src="checkoutIcons.chevron" alt="" class="w-[10px] h-[7px] transition-transform duration-200"
                        :class="showCardPicker ? 'rotate-180' : ''" />
                    </button>
                    <div v-if="showCardPicker"
                      class="absolute top-full right-0 z-30 mt-1 w-max rounded-[6px] border border-[#EAECF080] backdrop-blur-[100px] bg-[#00000040]">
                      <div class="grid grid-cols-[max-content_max-content_max-content_max-content_max-content] gap-x-4">
                        <div v-for="(card, index) in savedTokens" :key="card.id || card.number"
                          class="col-span-5 grid grid-cols-subgrid items-center px-4 py-4 cursor-pointer hover:bg-[#00000080]"
                          :class="index === 0 ? 'border-b border-solid border-b-[#EAECF080]' : ''"
                          @click="applySavedCard(card)">
                          <span class="text-[16px] font-[500] text-[#ffffff] whitespace-nowrap">{{ card.holder }}</span>
                          <span class="text-[12px] font-[600] text-[#ffffff] whitespace-nowrap">{{ maskedToken(card) }}</span>
                          <span class="text-[12px] font-[400] text-[#ffffff] whitespace-nowrap">EXP {{ card.expiry }}</span>
                          <img :src="checkoutIcons.visa" alt="Visa" class="h-3 w-auto justify-self-end" />
                          <button type="button" class="bg-transparent border-none p-0 cursor-pointer justify-self-end"
                            @mouseenter="hoveredTokenId = card.id || card.number" @mouseleave="hoveredTokenId = ''"
                            @click.stop="removeToken(card)">
                            <img
                              :src="hoveredTokenId === (card.id || card.number) ? checkoutIcons.deleteCardActive : checkoutIcons.deleteCard"
                              alt="delete card" class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button type="button"
                        class="flex w-full items-center gap-2 border-t border-solid border-t-[#EAECF080] bg-transparent p-4 cursor-pointer hover:bg-[#00000080]"
                        @click="useNewCard">
                        <img :src="checkoutIcons.addCard" alt="" class="w-4 h-4" />
                        <span class="text-sm font-medium text-[#07F468] whitespace-nowrap">Add New Credit Card</span>
                      </button>
                    </div>
                  </div>
                </template>
                <PaymentMethodLoggedIn v-if="hasSavedPayment && showingSavedCard" class="w-full"
                  :holderName="checkout.state.paymentCardHolder" :cardNumber="checkout.state.paymentCardNumber"
                  :expiry="checkout.state.paymentExpiry" :brandSrc="checkoutIcons.visa" variant="large"
                  @card-remove="removeSavedCard" />
                <PaymentMethodNotLoggedIn v-else wrapperClass="w-full" brandSrc="/images/checkout-visa.png"
                  v-model:cardNumber="checkout.state.paymentCardNumber" v-model:expiry="checkout.state.paymentExpiry"
                  v-model:cardHolder="checkout.state.paymentCardHolder" v-model:cvv="checkout.state.paymentCvv"
                  v-model:saveCard="checkout.state.paymentSaveCard" />
              </SectionToggleHeader>
            </template>

            <template v-else-if="checkout.step === 1">
              <SectionToggleHeader title="BILLING ADDRESS" icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpen">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 w-full">
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.lastName" label="Last Name" labelFor="last-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Last Name" />
                      </div>
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.firstName" label="First Name" labelFor="first-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="First Name" />
                      </div>
                    </div>
                    <BaseInput type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine1" label="Address Line 1" labelFor="Address-Line-1"
                      labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Address Line 1" />
                    <BaseInput type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine2" label="Address Line 2" labelFor="Address-Line-2"
                      labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Address Line 2" />
                    <div class="flex items-center gap-2">
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.postalCode" label="Postal Code" labelFor="postal-code"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Postal Code" />
                      </div>
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.city" label="City" labelFor="City"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="City" />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <BasePlanDropdown variant="checkout" label="Country" :options="countryOptions" v-model="checkout.state.selectedCountry" />
                      <BasePlanDropdown variant="checkout" label="State" :options="stateOptions" v-model="checkout.state.selectedState"
                        placeholder="" />
                    </div>
                  </div>
                  <CheckboxGroup label="Save this address for future use." v-model="checkout.state.saveAddress"
                    checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center" />
                </div>
              </SectionToggleHeader>
            </template>

            <template v-else-if="checkout.step === 2">
              <SectionToggleHeader title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png" v-model="paymentOpen"
                :showChevron="false" :toggleable="false">
                <template v-if="hasSavedPayment" #headerAction>
                  <div class="relative">
                    <button type="button"
                      class="flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                      @click="showCardPicker = !showCardPicker">
                      <span class="text-xs leading-normal font-medium text-[#98A2B3]">Change Card</span>
                      <img :src="checkoutIcons.chevron" alt="" class="w-[10px] h-[7px] transition-transform duration-200"
                        :class="showCardPicker ? 'rotate-180' : ''" />
                    </button>
                    <div v-if="showCardPicker"
                      class="absolute top-full right-0 z-30 mt-1 w-max rounded-[6px] border border-[#EAECF080] backdrop-blur-[100px] bg-[#00000040]">
                      <div class="grid grid-cols-[max-content_max-content_max-content_max-content_max-content] gap-x-4">
                        <div v-for="(card, index) in savedTokens" :key="card.id || card.number"
                          class="col-span-5 grid grid-cols-subgrid items-center px-4 py-4 cursor-pointer hover:bg-[#00000080]"
                          :class="index === 0 ? 'border-b border-solid border-b-[#EAECF080]' : ''"
                          @click="applySavedCard(card)">
                          <span class="text-[16px] font-[500] text-[#ffffff] whitespace-nowrap">{{ card.holder }}</span>
                          <span class="text-[12px] font-[600] text-[#ffffff] whitespace-nowrap">{{ maskedToken(card) }}</span>
                          <span class="text-[12px] font-[400] text-[#ffffff] whitespace-nowrap">EXP {{ card.expiry }}</span>
                          <img :src="checkoutIcons.visa" alt="Visa" class="h-3 w-auto justify-self-end" />
                          <button type="button" class="bg-transparent border-none p-0 cursor-pointer justify-self-end"
                            @mouseenter="hoveredTokenId = card.id || card.number" @mouseleave="hoveredTokenId = ''"
                            @click.stop="removeToken(card)">
                            <img
                              :src="hoveredTokenId === (card.id || card.number) ? checkoutIcons.deleteCardActive : checkoutIcons.deleteCard"
                              alt="delete card" class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button type="button"
                        class="flex w-full items-center gap-2 border-t border-solid border-t-[#EAECF080] bg-transparent p-4 cursor-pointer hover:bg-[#00000080]"
                        @click="useNewCard">
                        <img :src="checkoutIcons.addCard" alt="" class="w-4 h-4" />
                        <span class="text-sm font-medium text-[#07F468] whitespace-nowrap">Add New Credit Card</span>
                      </button>
                    </div>
                  </div>
                </template>
                <div v-if="checkout.state.paymentSaveCard">
                  <div class="hidden lg:flex">
                    <PaymentMethodLoggedIn :holderName="checkout.state.paymentCardHolder"
                      :cardNumber="checkout.state.paymentCardNumber" :expiry="checkout.state.paymentExpiry"
                      @remove="checkout.state.paymentSaveCard = false" variant="large" />
                  </div>
                  <div class="lg:hidden">
                    <PaymentMethodLoggedIn :holderName="checkout.state.paymentCardHolder"
                      :cardNumber="checkout.state.paymentCardNumber" :expiry="checkout.state.paymentExpiry"
                      @remove="checkout.state.paymentSaveCard = false" />
                  </div>
                </div>
                <div v-else>
                  <PaymentMethodNotLoggedIn wrapperClass="max-w-[29.6875rem]"
                    v-model:cardNumber="checkout.state.paymentCardNumber" v-model:expiry="checkout.state.paymentExpiry"
                    v-model:cardHolder="checkout.state.paymentCardHolder" v-model:cvv="checkout.state.paymentCvv"
                    v-model:saveCard="checkout.state.paymentSaveCard" />
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader title="BILLING ADDRESS" icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen">
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
            </template>

            <div
              v-if="!showsEmailAndPayment"
              class="debugSection hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700">
              <div class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md">
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-blue-500 pb-2 mb-2 uppercase tracking-wider">
                  Flow State
                </h3>
                <pre class="max-h-48 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono">{{
                  JSON.stringify(checkout.state, null, 2) }}</pre>
              </div>
              <div class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md">
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-green-500 pb-2 mb-2 uppercase tracking-wider">
                  Flow Logs
                </h3>
                <pre class="max-h-48 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono">{{
                  checkout.logs.slice(-20).join("\n") }}</pre>
              </div>
            </div>
          </div>

          <div ref="rightColumnRef"
            class="relative flex flex-col gap-6 group/right-col [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:h-full lg:min-h-0 lg:w-1/2 lg:grow lg:-mb-[1px] lg:overflow-y-auto lg:bg-black/50 lg:px-4 lg:pb-[260px] lg:pt-6 dark:lg:bg-[#181a1b]/50">
            <Teleport to="#mobile-summary-target-subscription" :disabled="isLargeScreen" v-if="isMounted">
              <SectionToggleHeader title="SUBSCRIPTION" icon="https://i.ibb.co.com/chd372MJ/logo-bg.webp"
                v-model="subscriptionOpen" :showChevron="false" :toggleable="false">
                <div v-if="mode === 'upgrade'" class="flex flex-col gap-4">
                  <p class="text-sm text-white">
                    You are about to change your membership tier as follows:
                  </p>

                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-[#98A2B3]">{{ t('subscriptionCard.badges.currentSubscription') }}</span>
                    <SubscriptionPlanCard
                      theme="upgradeCurrent"
                      :title="currentSubscription?.title || t('subscriptionPlanCard.titleFeatured')"
                      :price="`USD$${currentSubscription?.price || '499.99'}`"
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
                      :title="newSubscription?.title || t('subscriptionPlanCard.titleFeatured')"
                      :price="`USD$${newSubscription?.price || '499.99'}`"
                      :period="t('subscriptionCard.perMonth')"
                      :background-image="assets.profileSlideinBg"
                      :footer-text="t('subscriptionPlanCard.footerBillingCycle')"
                      :logo-image="assets.planLogo"
                    />
                  </div>
                </div>

                <div v-else-if="isSubscribeMode">
                  <span class="text-xs leading-normal mb-4 text-[#98A2B3] dark:text-[#b0a993] block">{{ t('subscriptionPlanCard.labelNew') }}</span>
                  <SubscriptionPlanCard
                    theme="subscribe"
                    :title="newSubscription?.title || t('subscriptionPlanCard.titleFeatured')"
                    :price="`USD$${newSubscription?.price || '1.00'}`"
                    :period="t('subscriptionCard.perMonth')"
                    :background-image="assets.profileSlideinBg"
                    :footer-text="t('subscriptionPlanCard.footerCheckoutStart')"
                    :logo-image="assets.planLogo"
                  />
                </div>

                <div v-else>
                  <span class="text-xs leading-normal mb-4 text-[#98A2B3] dark:text-[#b0a993] block">{{ t('subscriptionPlanCard.labelNew') }}</span>
                  <SubscriptionPlanCard
                    theme="subscribe"
                    :title="t('subscriptionPlanCard.titleFeatured')"
                    :price="t('subscriptionPlanCard.price')"
                    :period="t('subscriptionCard.perMonth')"
                    :background-image="assets.profileSlideinBg"
                    :footer-text="t('subscriptionPlanCard.footerCheckoutStart')"
                    :logo-image="assets.planLogo"
                  />
                </div>
              </SectionToggleHeader>
            </Teleport>

            <CheckoutNotes :showAvatars="true" v-model="checkout.state.orderNotes" />

            <div :id="uid"></div>
          </div>

        </div>

        <Teleport :to="`#${uid}`" :disabled="!isLargeScreen" v-if="isMounted">
          <div data-total-section
            class="z-[10001] mt-6 w-full shrink-0 overflow-visible backdrop-blur-[50px] group/wrapper shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] lg:fixed lg:bottom-0 lg:mt-auto lg:-ml-4 lg:w-1/2 lg:rounded-br-[0.625rem]">
            <div class="flex flex-col gap-4 px-2 pb-6 md:px-4 md:rounded-b-[0.625rem] lg:rounded-b-none">
              <div class="flex flex-col gap-4 w-full">
                <p v-if="mode === 'upgrade'"
                  class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] dark:text-[#b0a993]">
                  You will be charged
                  <span
                    class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">$6.99</span>
                  at checkout, which is a prorated amount based on the remaining
                  days in this billing cycle. After that, the full monthly fee
                  of
                  <span
                    class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">$50.00</span>
                  will be charged on XX-XX-XXXX and on the same date each month.
                  Your subscription auto-renews, and you can cancel anytime in
                  your account.
                </p>
                <p v-else-if="isSubscribeMode" class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] dark:text-[#b0a993]">
                  You will be charged
                  <span class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">USD${{
                    newSubscription?.price || '1.00' }}</span>
                  today (04-09-2026) and on the same day each month. This subscription renews automatically, and you can
                  cancel anytime in your account.
                </p>
                <p v-else class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] dark:text-[#b0a993]">
                  You will be charged
                  <span class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">${{
                    newSubscription?.price || '499.99' }}</span> today (02-26-2025) and on the same day each month. This
                  subscription renews automatically, and you can cancel anytime
                  in your account.
                </p>
                <TotalAmountRow :amount="`USD$${mode === 'upgrade' ? '6.99' : (isSubscribeMode ? (newSubscription?.price || '1.00') : (newSubscription?.price || '499.99'))}`" />

                <CheckboxGroup v-if="checkout.step === 1 || isSubscribeMode" v-model="checkout.state.termsAgreed"
                  checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                  wrapperClass="flex items-center gap-2">
                  <template v-if="isSubscribeMode">
                    I agree to Fansocial's
                    <a href=""
                      class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Terms
                      and Conditions</a>
                    and
                    <a href=""
                      class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Privacy
                      Policy</a>, and consent to the creation of an account on my behalf.
                  </template>
                  <template v-else>
                    I agree to Our Website's
                    <a href=""
                      class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Terms
                      and Condition</a>
                    and
                    <a href=""
                      class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Privacy
                      Policy</a>.
                  </template>
                </CheckboxGroup>

                <p
                  v-if="paymentMessage"
                  class="text-sm"
                  :class="paymentStatus === 'paid' ? 'text-[#07F468]' : paymentStatus === 'ask' ? 'text-[#FDB022]' : 'text-[#FF692E]'"
                >
                  {{ paymentMessage }}
                </p>
                <div :class="isStepValid ? 'pb-3 [filter:drop-shadow(0_10px_18px_#07F46899)]' : ''">
                  <DashboardPrimaryButton :key="isStepValid" :text="buttonText" :variant="isStepValid ? 'checkoutProceedpayment' : 'disableBtn'
                    " :disabled="!isStepValid" :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                    :rightIconClass="arrowIconClass" @click="handleNextStep" />
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </BasePopup>

  <ProceedPaymentAgreePopup
    :modelValue="checkout.step === 3"
    :disabled="isPaying"
    :loading="isPaying"
    @update:modelValue="(open) => { if (!open) closeAgreeStep(); }"
    @agree="confirmAgreeAndPay"
  />

  <PaymentSuccessfulPopup
    :modelValue="checkout.step === 4"
    :dollars="successAmount.dollars"
    :cents="successAmount.cents"
    @update:modelValue="(open) => { if (!open) closeSuccessStep(); }"
  />

  <Teleport to="body">
    <div
      v-if="showPaymentFailedToast"
      class="payment-fail-toast fixed top-4 right-4 z-[13000] w-[min(32rem,calc(100vw-2rem))]"
      @click.stop
    >
      <NotificationCard
        v-model="showPaymentFailedToast"
        variant="limit-exceeded"
        title="Payment unsuccessful"
        description="Payment was unsuccessful due to a poor network connection. Please try again later"
        left-border-class="bg-[#FF4405]"
        title-class="text-[#FF4405] text-[14px] font-[600]"
      >
        <template #icon>
          <div class="relative h-[40px] w-[40px]">
            <div class="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[rgba(255,68,5,0.12)]">
              <img src="/images/checkout-payment-fail-cart.png" alt="" class="block h-[23px] w-[23px] object-contain" />
            </div>
            <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center rounded-[8px] bg-[#FF4405]">
              <img src="/images/checkout-payment-fail-warning.png" alt="" class="block h-[12px] w-[12px] object-contain" />
            </div>
          </div>
        </template>
      </NotificationCard>
    </div>
  </Teleport>
</template>

<style scoped>
.payment-fail-toast :deep(.border-b) {
  border-bottom-color: transparent;
}

.payment-fail-toast :deep(.dashboard-toast-inner-wrapper) {
  background: #000000e5 !important;
}

.payment-fail-toast :deep(.dashboard-toast-inner-wrapper::before) {
  content: none;
}

.payment-fail-toast :deep(.text-\[\#0F172A\]) {
  color: #f2f4f7;
}
</style>
