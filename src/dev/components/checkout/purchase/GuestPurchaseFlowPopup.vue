<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import {
  createStepStateEngine,
  attachEngineLogging,
  useShiftLogger,
} from "@/utils/stateEngine";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import { useAuthStore } from "@/stores/useAuthStore";
import mockAuthUsers from "@/config/mockAuthUsers.json";

// Components
import BasePopup from "@/components/ui/popups/BasePopup.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import AddressCard from "../reusable/AddressCard.vue";
import SectionToggleHeader from "../reusable/SectionToggleHeader.vue";
import CheckoutNotes from "../reusable/CheckoutNotes.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import TotalAmountRow from "../reusable/TotalAmountRow.vue";
import PaymentMethodNotLoggedIn from "../reusable/PaymentMethodNotLoggedIn.vue";
import PaymentMethodLoggedIn from "../reusable/PaymentMethodLoggedIn.vue";
import OrderSummary from "../reusable/OrderSummary.vue";
import CheckoutShippingFields from "../reusable/CheckoutShippingFields.vue";
import { submitCheckoutPayment } from "@/dev/utils/checkout/checkoutMockApi.js";
import ProceedPaymentAgreePopup from "@/dev/components/ui/popups/payment/ProceedPaymentAgreePopup.vue";
import PaymentSuccessfulPopup from "@/dev/components/ui/popups/payment/PaymentSuccessfulPopup.vue";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "new" },
  product: { type: Object, default: null },
  requiresShipping: { type: Boolean, default: true },
  showDebug: { type: Boolean, default: true },
  paymentScenario: { type: String, default: "" },
  preset: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "paid"]);

// --- 1. STATE ENGINE SETUP ---
const checkout = createStepStateEngine({
  flowId: "checkoutFlow",
  initialStep: 1,
  defaults: {
    email: "",
    password: "",
    username: "",
    authMode: "guest",
    isLoggedIn: false,

    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    selectedCountry: "",
    selectedState: "",
    saveAddress: false,
    sameAddress: false,
    termsAgreed: false,

    paymentCardNumber: "",
    paymentExpiry: "",
    paymentCardHolder: "",
    paymentCvv: "",
    paymentSaveCard: false,
    orderNotes: "",
    productId: "",
    productTitle: "",
    productPrice: "",
    orderSubmitted: false,
  },
});

attachEngineLogging(checkout);
useShiftLogger("GuestPurchaseFlowPopup", checkout);

const CHECKOUT_SCOPE = "guestPurchaseCheckout";
const REGISTERED_EMAILS = new Set(
  [
    "existingmember@gmail.com",
    ...(Array.isArray(mockAuthUsers?.users)
      ? mockAuthUsers.users.map((user) => user.email)
      : []),
  ]
    .filter(Boolean)
    .map((email) => String(email).trim().toLowerCase()),
);

const isRegisteredEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return !!email && REGISTERED_EMAILS.has(email);
};

const guestEmailConfig = {
  scope: CHECKOUT_SCOPE,
  id: "guestEmail",
  validation: {
    rules: [
      {
        type: "custom",
        param: (value) => !isRegisteredEmail(value),
        message:
          "It looks like you already have an account with this email. Please log in to continue.",
      },
    ],
  },
  validateOnInput: true,
};

const isExistingEmailError = computed(() => {
  const field = interactionsEngine.scopes[CHECKOUT_SCOPE]?.fields?.guestEmail;
  if (!field || field.isValid) return false;
  return (field.failedRules || []).some((rule) => rule.type === "custom");
});

checkout.addFieldRequirement(2, "paymentCardNumber", {
  required: true,
  requiredMessage: "This item is required.",
});
checkout.addFieldRequirement(2, "paymentExpiry", {
  required: true,
  requiredMessage: "This item is required.",
});
checkout.addFieldRequirement(2, "paymentCardHolder", {
  required: true,
  requiredMessage: "This item is required.",
});
checkout.addFieldRequirement(2, "paymentCvv", {
  required: true,
  requiredMessage: "This item is required.",
});

checkout.addFieldRequirement(1, "email", {
  required: true,
  requiredMessage: "Email is required.",
  rules: [
    { type: "isEmail", message: "Enter a valid email." },
    {
      type: "custom",
      param: (value) => !isRegisteredEmail(value),
      message:
        "It looks like you already have an account with this email. Please log in to continue.",
    },
  ],
});

const registerGuestEmailField = (value = "") => {
  interactionsEngine.unregister(guestEmailConfig);
  const emailEl = document.getElementById("guest-billing-email");
  interactionsEngine.register(guestEmailConfig, value, emailEl);
};

const onGuestEmailInput = (value) => {
  checkout.setState("email", value, { reason: "billing-email" });
  checkout.setState("username", usernameFromEmail(value), { reason: "billing-email" });
  interactionsEngine.processFieldChange(guestEmailConfig, value);
};

const openExistingEmailLogin = () => {
  checkout.setState("authMode", "login", { reason: "existing-email-login" });
};

const debugSnapshot = computed(() => ({
  step: checkout.step,
  substep: checkout.substep,
  lastIntent: checkout.lastIntent,
  flags: { ...checkout.flags },
  state: checkout.state,
}));

let isTrackingInputs = false;
watch(
  () => ({ ...checkout.state }),
  (next, prev) => {
    if (!isTrackingInputs || !prev) return;
    Object.keys(next).forEach((key) => {
      if (next[key] !== prev[key]) {
        checkout.setState(key, next[key], { reason: `input:${key}` });
      }
    });
  },
);

// --- Config Variables ---
const guestPurchaseFlowPopupConfig = {
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
const shippingOpenTwo = ref(true);
const paymentOpen = ref(true);
const billingMailOpen = ref(true);
const orderSummaryOpen = ref(true);

const countryOptions = [
  { label: "Hong Kong", value: "hong-kong" },
  { label: "Australia", value: "australia" },
  { label: "USA", value: "usa" },
  { label: "Thailand", value: "thailand" },
  { label: "Canada", value: "canada" },
  { label: "United Kingdom", value: "united-kingdom" },
  { label: "Japan", value: "japan" },
  { label: "Singapore", value: "singapore" },
];
const stateOptions = [
  { label: "Florida", value: "florida" },
  { label: "Hawaii", value: "hawaii" },
  { label: "New York", value: "new-york" },
  { label: "California", value: "california" },
  { label: "Texas", value: "texas" },
  { label: "Kwai Chung", value: "kwai-chung" },
  { label: "Bangkok", value: "bangkok" },
];
const showPassword = ref(false);
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
const shippingFieldsRef = ref(null);
const useNewAddress = ref(false);
const editingAddressId = ref("");
const showAddressPicker = ref(false);
const addressList = ref([]);
const selectedAddressId = ref("");
const hoveredAddressId = ref("");
const showCardPicker = ref(false);
const selectedTokenId = ref("");
const tokenList = ref([]);
const hoveredTokenId = ref("");
const authStore = useAuthStore();

const checkoutIcons = {
  chevron: "/images/checkout-dropdown-chevron.png",
  addCard: "/images/checkout-add-card.png",
  useNew: "/images/checkout-use-new.png",
  deleteCard: "/images/checkout-delete-card.png",
  deleteCardActive: "/images/checkout-delete-card-active.png",
  editAddress: "/images/checkout-edit-address.png",
  editAddressActive: "/images/checkout-edit-address-active.png",
  visa: "/images/checkout-visa.png",
};

const resolveSessionUser = () => {
  const user = authStore.currentUser || {};
  const raw = user.raw || {};
  const email = user.email || authStore.userEmail || "";
  const username =
    user.username ||
    user.name ||
    raw.nickname ||
    raw.name ||
    raw.preferred_username ||
    (email ? email.split("@")[0] : "");

  return {
    email: String(email || "").trim(),
    username: String(username || "").trim(),
  };
};

const isUserLoggedIn = computed(
  () =>
    authStore.isAuthenticated ||
    checkout.state.isLoggedIn ||
    Boolean(props.preset?.loggedIn),
);

const usernameFromEmail = (email) => {
  const local = String(email || "").trim().split("@")[0];
  return local || "";
};

const displayUsername = computed(() => {
  const sessionName = resolveSessionUser().username;
  const savedName = checkout.state.username;
  const emailName = usernameFromEmail(displayEmail.value || checkout.state.email);
  if (authStore.isAuthenticated) return sessionName || emailName;
  return savedName || props.preset?.username || sessionName || emailName;
});

const displayEmail = computed(() => {
  if (authStore.isAuthenticated) return resolveSessionUser().email;
  return checkout.state.email || props.preset?.email || resolveSessionUser().email;
});

const syncSessionUser = () => {
  if (!authStore.isAuthenticated) return;
  const session = resolveSessionUser();
  checkout.setState("isLoggedIn", true, { reason: "session-sync" });
  checkout.setState("authMode", "guest", { reason: "session-sync" });
  if (session.email) checkout.setState("email", session.email, { reason: "session-sync" });
  if (session.username) checkout.setState("username", session.username, { reason: "session-sync" });
};

const syncSelectedProduct = () => {
  const product = props.product;
  checkout.setState("productId", product?.id || "", { reason: "selected-product" });
  checkout.setState("productTitle", product?.title || "", { reason: "selected-product" });
  checkout.setState(
    "productPrice",
    product?.finalPrice || product?.price || "",
    { reason: "selected-product" },
  );
};

const formatMoney = (value, fallback = "$0") => {
  if (value == null || value === "") return fallback;
  const raw = String(value).trim();
  return raw.startsWith("$") ? raw : `$${raw}`;
};

const cartItems = computed(() => {
  const product = props.product;
  if (!product) return [];

  const currentPrice = formatMoney(product.finalPrice || product.price, "$25");
  const oldPrice = formatMoney(product.price, currentPrice);

  return [
    {
      name: product.title || "Product",
      image: product.bgImage || product.image || "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
      creatorName: product.creatorName || "Princess Carrot Pop",
      creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
      isVerified: true,
      price: currentPrice,
      oldPrice: oldPrice !== currentPrice ? oldPrice : "",
    },
  ];
});

const orderTotal = computed(() => {
  const product = props.product;
  const currency = product?.currency || "USD";
  const currencyLabel = String(currency).endsWith("$") ? currency : `${currency}$`;
  const amount = formatMoney(product?.finalPrice || product?.price, "$25").replace(/^\$/, "");
  return `${currencyLabel}${amount}`;
});

const successAmount = computed(() => {
  const raw = formatMoney(props.product?.finalPrice || props.product?.price, "$0").replace(/[^0-9.]/g, "");
  const [dollars, cents = "00"] = raw.split(".");
  return {
    dollars: dollars || "0",
    cents: cents.padEnd(2, "0").slice(0, 2),
  };
});

const countryLabel = (value) =>
  countryOptions.find((option) => option.value === value)?.label || value || "";

const dynamicShippingAddress = computed(() => {
  const s = checkout.state;
  const parts = [
    `${s.firstName} ${s.lastName}`.trim(),
    s.addressLine1,
    s.addressLine2,
    s.postalCode,
    s.city,
    countryLabel(s.selectedCountry),
  ].filter(Boolean);
  return parts.length > 0
    ? parts.join(", ")
    : "Please fill shipping address first";
});

const savedTokens = computed(() => tokenList.value);

const syncTokenList = (preset) => {
  const cards = Array.isArray(preset?.savedCards) && preset.savedCards.length
    ? preset.savedCards
    : preset?.savedCard
      ? [preset.savedCard]
      : [];
  tokenList.value = cards.map((card) => ({ ...card }));
};

const removeToken = (card) => {
  const id = card?.id || card?.number;
  tokenList.value = tokenList.value.filter((item) => (item.id || item.number) !== id);
  if (selectedTokenId.value !== id) return;
  if (tokenList.value[0]) {
    applySavedCard(tokenList.value[0], "delete-token");
    return;
  }
  useNewCard();
  showCardPicker.value = false;
};

watch(
  () => checkout.state.paymentSaveCard,
  (saved) => {
    if (!saved) return;
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

const applySavedCard = (card, reason = "select-token") => {
  if (!card) return;
  selectedTokenId.value = card.id || card.number || "";
  checkout.setState("paymentCardNumber", card.number || "", { reason });
  checkout.setState("paymentExpiry", card.expiry || "", { reason });
  checkout.setState("paymentCardHolder", card.holder || "", { reason });
  checkout.setState("paymentCvv", "", { reason });
  checkout.setState("paymentSaveCard", true, { reason });
};

const applySavedShipping = (shipping, reason = "saved-shipping") => {
  if (!shipping) return;
  checkout.setState("firstName", shipping.firstName || "", { reason });
  checkout.setState("lastName", shipping.lastName || "", { reason });
  checkout.setState("addressLine1", shipping.addressLine1 || "", { reason });
  checkout.setState("addressLine2", shipping.addressLine2 || "", { reason });
  checkout.setState("postalCode", shipping.postalCode || "", { reason });
  checkout.setState("city", shipping.city || "", { reason });
  checkout.setState("selectedCountry", shipping.selectedCountry || "", { reason });
  checkout.setState("selectedState", shipping.selectedState || "", { reason });
  checkout.setState("saveAddress", true, { reason });
  checkout.setState("sameAddress", true, { reason });
};

const clearShippingFields = (reason = "new-address") => {
  checkout.setState("firstName", "", { reason });
  checkout.setState("lastName", "", { reason });
  checkout.setState("addressLine1", "", { reason });
  checkout.setState("addressLine2", "", { reason });
  checkout.setState("postalCode", "", { reason });
  checkout.setState("city", "", { reason });
  checkout.setState("selectedCountry", "", { reason });
  checkout.setState("selectedState", "", { reason });
  checkout.setState("saveAddress", false, { reason });
};

const formatSavedAddress = (address) => {
  const parts = [
    `${address?.firstName || ""} ${address?.lastName || ""}`.trim(),
    address?.addressLine1,
    address?.addressLine2,
    address?.postalCode,
    address?.city,
    countryLabel(address?.selectedCountry),
  ].filter(Boolean);
  return parts.join(",");
};

const syncAddressList = (preset) => {
  const list = Array.isArray(preset?.savedAddresses) && preset.savedAddresses.length
    ? preset.savedAddresses
    : preset?.shipping
      ? [preset.shipping]
      : [];
  addressList.value = list.map((address, index) => ({
    ...address,
    id: address.id || `addr-${index + 1}`,
  }));
};

const selectSavedAddress = (address) => {
  if (!address) return;
  selectedAddressId.value = address.id || "";
  editingAddressId.value = "";
  applySavedShipping(address, "select-address");
  useNewAddress.value = false;
  showAddressPicker.value = false;
};

const editSavedAddress = (address) => {
  editingAddressId.value = address?.id || "";
  selectedAddressId.value = address?.id || "";
  applySavedShipping(address, "edit-address");
  useNewAddress.value = true;
  showAddressPicker.value = false;
};

const editDisplayedAddress = () => {
  const current = addressList.value.find((item) => item.id === selectedAddressId.value) || addressList.value[0];
  if (current) {
    editSavedAddress(current);
    return;
  }
  editingAddressId.value = "";
  useNewAddress.value = true;
  showAddressPicker.value = false;
};

const startNewAddress = () => {
  editingAddressId.value = "";
  clearShippingFields("new-address");
  useNewAddress.value = true;
  showAddressPicker.value = false;
};

const cancelAddressEdit = () => {
  const current = addressList.value.find((item) => item.id === selectedAddressId.value) || addressList.value[0];
  if (current) applySavedShipping(current, "cancel-address");
  editingAddressId.value = "";
  useNewAddress.value = false;
};

const updateAddress = () => {
  if (shippingFieldsRef.value?.validate && !shippingFieldsRef.value.validate()) return;
  const next = {
    id: editingAddressId.value || `addr-${Date.now()}`,
    firstName: checkout.state.firstName,
    lastName: checkout.state.lastName,
    addressLine1: checkout.state.addressLine1,
    addressLine2: checkout.state.addressLine2,
    postalCode: checkout.state.postalCode,
    city: checkout.state.city,
    selectedCountry: checkout.state.selectedCountry,
    selectedState: checkout.state.selectedState,
  };
  if (editingAddressId.value) {
    addressList.value = addressList.value.map((item) => (item.id === next.id ? { ...item, ...next } : item));
  } else {
    addressList.value = [...addressList.value, next];
  }
  selectedAddressId.value = next.id;
  editingAddressId.value = "";
  useNewAddress.value = false;
};

const maskedToken = (card) => {
  const last4 = String(card?.number || "").slice(-4) || "0000";
  return `**** ${last4}`;
};

const isStepValid = computed(() => {
  const s = checkout.state;
  if (s.authMode !== "guest" && !isUserLoggedIn.value) return false;

  if (checkout.step === 1) {
    const hasEmail = (displayEmail.value || s.email)?.trim().length > 0;
    const hasName = s.firstName?.trim() && s.lastName?.trim();
    const hasAddress =
      s.addressLine1?.trim() && s.city?.trim() && s.selectedCountry;
    const hasTerms = s.termsAgreed === true;
    const emailBlocksNext = !isUserLoggedIn.value && isExistingEmailError.value;
    const shippingOk = !props.requiresShipping || (hasName && hasAddress);
    return !!(hasEmail && shippingOk && hasTerms && !emailBlocksNext);
  }
  if (checkout.step === 2 || checkout.step === 3 || checkout.step === 4) {
    return props.preset ? s.termsAgreed === true : true;
  }
  return false;
});

const buttonText = computed(() => {
  if (checkout.step === 1) return "Next";
  return "Proceed Payment";
});

const arrowIconClass = computed(() => {
  if (isStepValid.value) {
    return "w-6 h-6 brightness-0 opacity-100 contrast-[200%] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(66%)_sepia(68%)_saturate(2102%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] transition-all duration-200";
  } else {
    return "w-6 h-6 brightness-0 invert opacity-30";
  }
});

const applyPreset = async () => {
  const preset = props.preset;
  paymentMessage.value = "";
  paymentStatus.value = "";
  isPaying.value = false;
  showPaymentFailedToast.value = false;
  useNewAddress.value = false;
  showAddressPicker.value = false;
  hoveredAddressId.value = "";
  syncAddressList(preset);
  showCardPicker.value = false;
  selectedTokenId.value = "";
  hoveredTokenId.value = "";
  syncTokenList(preset);
  if (!preset) return;

  if (preset.email) {
    checkout.setState("email", preset.email, { reason: "demo-preset" });
  }
  if (preset.username) {
    checkout.setState("username", preset.username, { reason: "demo-preset" });
  }
  if (preset.loggedIn) {
    checkout.setState("isLoggedIn", true, { reason: "demo-preset" });
    checkout.setState("authMode", "guest", { reason: "demo-preset" });
  }

  if (preset.shipping) {
    applySavedShipping(preset.shipping, "demo-preset");
    selectedAddressId.value = preset.shipping.id || addressList.value[0]?.id || "";
  } else {
    clearShippingFields("demo-preset");
    selectedAddressId.value = "";
    editingAddressId.value = "";
    checkout.setState("sameAddress", false, { reason: "demo-preset" });
  }

  const savedCard = preset.savedCard || preset.savedCards?.[0];
  if (savedCard && !preset.useNewCard) {
    applySavedCard(savedCard, "demo-preset");
  } else {
    checkout.setState("paymentSaveCard", false, { reason: "demo-preset" });
    checkout.setState("paymentCardNumber", "", { reason: "demo-preset" });
    checkout.setState("paymentExpiry", "", { reason: "demo-preset" });
    checkout.setState("paymentCardHolder", "", { reason: "demo-preset" });
    checkout.setState("paymentCvv", "", { reason: "demo-preset" });
  }

  const startStep = Number(preset.startStep || 0);
  if (startStep === 2 && checkout.step !== 2) {
    await checkout.goToStep(2, { force: true });
  }
};

const closeAgreeStep = () => {
  if (checkout.step !== 3) return;
  checkout.goToStep(2, { force: true, intent: "close-agree" });
};

const closeSuccessStep = () => {
  if (checkout.step !== 4) return;
  checkout.goToStep(2, { force: true, intent: "close-success" });
  emit("update:modelValue", false);
};

const submitPayment = async () => {
  if (isPaying.value) return;
  isPaying.value = true;
  paymentMessage.value = "";
  paymentStatus.value = "";
  try {
    const result = await submitCheckoutPayment({
      flowType: props.product?.type || "order",
      product: props.product,
      items: cartItems.value,
      notes: checkout.state.orderNotes,
      scenario: props.paymentScenario,
    });
    const status = result.body?.status || (result.ok ? "paid" : "failed");
    paymentStatus.value = status;
    paymentMessage.value = result.body?.message || "";
    if (status === "paid") {
      checkout.setState("orderSubmitted", true, { reason: "submit-order" });
      emit("paid", result);
      await checkout.goToStep(4, { force: true, intent: "payment-success" });
      emit("update:modelValue", false);
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

const handleNextStep = async () => {
  if (checkout.step === 1) {
    if (!isUserLoggedIn.value) {
      interactionsEngine.processFieldChange(guestEmailConfig, checkout.state.email);
      if (isExistingEmailError.value) return;
    }
    await checkout.goToStep(2, { force: isUserLoggedIn.value });
  } else if (checkout.step === 2) {
    if (isPaying.value) return;
    if (props.requiresShipping && useNewAddress.value) {
      const shippingOk = shippingFieldsRef.value?.validate?.() ?? false;
      if (!shippingOk) return;
    }
    await checkout.goToStep(3, { force: true, intent: "open-agree" });
  }
};

const confirmAgreeAndPay = async () => {
  checkout.setState("termsAgreed", true, { reason: "agree-proceed" });
  await submitPayment();
};

const handleBack = () => {
  if (props.mode === "upgrade" && checkout.step === 2) {
    emit("update:modelValue", false);
    return;
  }
  if (checkout.step > 1) {
    checkout.goToStep(checkout.step - 1);
  } else {
    emit("update:modelValue", false);
  }
};

const handleLogin = () => {
  const session = resolveSessionUser();
  if (!checkout.state.email) {
    checkout.setState(
      "email",
      session.email || "existingmember@gmail.com",
      { reason: "popup-login" },
    );
  }
  if (!checkout.state.username) {
    checkout.setState(
      "username",
      session.username || checkout.state.email.split("@")[0] || "",
      { reason: "popup-login" },
    );
  }
  checkout.setState("isLoggedIn", true, { reason: "popup-login" });
  checkout.setState("authMode", "guest", { reason: "popup-login" });
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

const useNewCard = () => {
  checkout.setState("paymentSaveCard", false, { reason: "use-new-card" });
  checkout.setState("paymentCardNumber", "", { reason: "use-new-card" });
  checkout.setState("paymentExpiry", "", { reason: "use-new-card" });
  checkout.setState("paymentCardHolder", "", { reason: "use-new-card" });
  checkout.setState("paymentCvv", "", { reason: "use-new-card" });
};

const handleLogout = async () => {
  checkout.setState("isLoggedIn", false, { reason: "popup-logout" });
  checkout.setState("email", "", { reason: "popup-logout" });
  checkout.setState("username", "", { reason: "popup-logout" });
  checkout.setState("password", "", { reason: "popup-logout" });
  checkout.setState("authMode", "guest", { reason: "popup-logout" });
  if (authStore.isAuthenticated) {
    await authStore.logout();
  }
  if (checkout.step === 2) {
    checkout.goToStep(1);
  }
};

watch(
  () => [props.modelValue, authStore.isAuthenticated],
  async ([isOpen]) => {
    if (!isOpen) return;
    syncSessionUser();
    syncSelectedProduct();
    await applyPreset();
    await nextTick();
    registerGuestEmailField(checkout.state.email);
    if (checkout.state.email) {
      interactionsEngine.processFieldChange(guestEmailConfig, checkout.state.email);
    }
  },
  { immediate: true },
);

watch(
  () => props.product,
  () => {
    if (props.modelValue) syncSelectedProduct();
  },
);

const LG_BREAKPOINT = 1010;
const isLargeScreen = ref(false);
const rightColumnRef = ref(null);
const isMounted = ref(false);

const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= LG_BREAKPOINT;
};

onMounted(async () => {
  checkout.initialize({ fromUrl: false });
  await nextTick();
  isMounted.value = true;
  registerGuestEmailField(checkout.state.email);
  isTrackingInputs = true;
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize, { passive: true });
});

onUnmounted(() => {
  isTrackingInputs = false;
  clearPaymentFailedToastTimer();
  interactionsEngine.clearScope(CHECKOUT_SCOPE);
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popupConfig="guestPurchaseFlowPopupConfig"
  >
    <button
      type="button"
      class="absolute right-0 top-0 z-[80] hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#3A3A3A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] md:flex"
      @click="emit('update:modelValue', false)"
    >
      <img
        src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp"
        alt="close"
        class="h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(100%)]"
      />
    </button>
    <div
      class="bg-[#FFFFFF1A] h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#35393b]"
    >
      <div
        class="relative flex flex-col h-full shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] md:rounded-t-[0.625rem] lg:rounded-[0.625rem] dark:bg-[#181a1b]/10"
      >
        <div
          class="absolute inset-0 backdrop-blur-[50px] pointer-events-none z-[-1] lg:backdrop-blur-[100px]"
        ></div>

        <div
          @click="emit('update:modelValue', false)"
          class="flex items-center gap-1 px-2 py-1 md:hidden"
        >
          <div
            class="flex justify-center items-center w-10 h-10 cursor-pointer"
          >
            <img
              src="https://i.ibb.co.com/Gvkq58F5/chevron-left.webp"
              alt="chevron-left"
              class="w-6 h-6"
            />
          </div>
        </div>

        <div
          class="flex flex-col gap-6 px-2 grow md:px-4 md:pt-6 lg:flex-row lg:p-0 lg:gap-0 lg:h-full"
        >
          <div
            class="flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:py-6 lg:grow lg:h-full lg:overflow-y-auto"
          >
            <template v-if="checkout.step === 1">
              <SectionToggleHeader
                title="BILLING EMAIL"
                icon="https://i.ibb.co.com/XfdvLvLC/mail.webp"
                v-model="billingMailOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div
                  v-if="isUserLoggedIn"
                  class="flex justify-between items-end"
                >
                  <div class="flex items-center gap-2 py-1">
                    <div class="flex justify-center items-center w-10 h-9">
                      <img
                        src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                        alt="avatar"
                        class="h-full object-cover"
                      />
                    </div>
                    <div class="flex flex-col">
                      <h3
                        class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]"
                      >
                        {{ displayUsername }}
                      </h3>
                      <span
                        class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                        >{{ displayEmail }}</span
                      >
                    </div>
                  </div>
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="handleLogout"
                  >
                    <img
                      src="https://i.ibb.co.com/Gfb88yFY/log-out.webp"
                      alt="log-out"
                      class="w-3 h-3 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                      >Log out</span
                    >
                  </button>
                </div>

                <div
                  v-else-if="checkout.state.authMode === 'login'"
                  class="flex flex-col gap-4"
                >
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer w-fit"
                    @click="checkout.state.authMode = 'guest'"
                  >
                    <img
                      src="https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp"
                      alt="arrow left"
                      class="w-4 h-4"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                      >Continue as guest</span
                    >
                  </button>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        type="email"
                        placeholder="Email"
                        v-model="checkout.state.email"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp"
                        alt="alert-circle"
                        class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex"
                      />
                    </div>
                    <p
                      class="text-sm text-[#FF692E] hidden group-[.error]/input:inline"
                    >
                      It looks like you already have an account with this email.
                    </p>
                  </div>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Password"
                        v-model="checkout.state.password"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/675rpz03/eye.webp"
                        alt="toggle password"
                        @click="showPassword = !showPassword"
                        :class="showPassword ? 'opacity-100' : 'opacity-60'"
                        class="w-4 h-4 cursor-pointer [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(11%)_saturate(403%)_hue-rotate(179deg)_brightness(89%)_contrast(86%)]"
                      />
                    </div>
                    <span
                      @click="checkout.state.authMode = 'forgot'"
                      class="text-sm text-white dark:text-[#e8e6e3] w-fit cursor-pointer"
                      >Forgot Password?</span
                    >
                  </div>
                  <div class="flex flex-col items-center gap-2 sm:flex-row">
                    <button
                      class="w-full group h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] hover:bg-[#0C111D] dark:bg-[#0aff78] dark:hover:bg-[#162036]"
                      @click="handleLogin"
                    >
                      <span
                        class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover:text-[#07F468]"
                        >Log in</span
                      >
                    </button>
                    <DashboardPrimaryButton
                      text="Continue with X (Twitter)"
                      variant="actionGreen"
                      leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
                      leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]"
                    />
                  </div>
                </div>

                <div
                  v-else-if="checkout.state.authMode === 'forgot'"
                  class="flex flex-col gap-4"
                >
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="checkout.state.authMode = 'login'"
                  >
                    <img
                      src="https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp"
                      alt="arrow left"
                      class="w-4 h-4"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                      >Back to Log in</span
                    >
                  </button>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        type="email"
                        placeholder="Email"
                        v-model="checkout.state.email"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp"
                        alt="alert-circle"
                        class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex"
                      />
                    </div>
                    <p
                      class="text-sm text-[#FF692E] hidden group-[.error]/input:inline"
                    >
                      It looks like you already have an account with this email.
                    </p>
                  </div>
                  <button
                    class="w-full h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] group/button hover:bg-[#0C111D] [&.disabled]:bg-white/20 [&.disabled]:cursor-not-allowed [&.disabled]:border-none dark:bg-[#0aff78] dark:hover:bg-[#162036] dark:[&.disabled]:bg-[#181a1b]/20"
                  >
                    <span
                      class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover/button:text-[#07F468] group-[.disabled]/button:text-white/30 dark:text-[#dbd8d3] dark:group-hover/button:text-[#23f97b] dark:group-[.disabled]/button:text-[#e8e6e3]/30"
                      >RESET PASSWORD</span
                    >
                  </button>
                </div>

                <div v-else>
                  <p
                    class="text-sm leading-normal tracking-[0.0175rem] text-text"
                  >
                    Already have an account?
                    <span
                      @click="checkout.setState('authMode', 'login', { reason: 'open-login' })"
                      class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b] cursor-pointer font-bold"
                      >Log in</span
                    >
                  </p>
                  <div class="flex flex-col gap-1.5 w-full mt-4">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b bg-[#FFFFFF1A] shadow-[0_1px_2px_0_#1018280D]"
                      :class="isExistingEmailError ? 'border-[#FF692E]' : 'border-[#D0D5DD]'"
                    >
                      <input
                        id="guest-billing-email"
                        type="email"
                        placeholder="Email"
                        :value="checkout.state.email"
                        @input="onGuestEmailInput($event.target.value)"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        v-show="isExistingEmailError"
                        src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp"
                        alt="alert-circle"
                        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(72%)_saturate(2146%)_hue-rotate(346deg)_brightness(101%)_contrast(96%)]"
                      />
                    </div>
                    <p
                      v-if="isExistingEmailError"
                      class="text-[14px] font-normal leading-normal text-[#FF692E]"
                    >
                      It looks like you already have an account with this email. Please
                      <button
                        type="button"
                        class="underline font-medium text-[#FF692E] bg-transparent border-none p-0 cursor-pointer"
                        @click="openExistingEmailLogin"
                      >
                        log in
                      </button>
                      to continue.
                    </p>
                  </div>
                </div>
              </SectionToggleHeader>

              <div id="mobile-guest-target" class="w-full lg:hidden"></div>

              <SectionToggleHeader
                v-if="requiresShipping"
                title="SHIPPING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpen"
              >
                <CheckoutShippingFields
                  :state="checkout.state"
                  :country-options="countryOptions"
                  :state-options="stateOptions"
                />
              </SectionToggleHeader>
              <SectionToggleHeader
                v-if="requiresShipping"
                title="BILLING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen"
              >
                <div class="flex flex-col gap-4">
                  <CheckboxGroup
                    v-if="!checkout.state.sameAddress"
                    label="Same as Shipping Address"
                    v-model="checkout.state.sameAddress"
                    checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center"
                  />
                  <AddressCard
                    v-if="checkout.state.sameAddress"
                    :address="dynamicShippingAddress"
                  />
                </div>
              </SectionToggleHeader>
            </template>

            <template v-else-if="checkout.step >= 2">
              <SectionToggleHeader
                title="BILLING EMAIL"
                icon="https://i.ibb.co.com/XfdvLvLC/mail.webp"
                v-model="billingMailOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div class="flex justify-between items-end">
                  <div class="flex items-center gap-2 py-1">
                    <div class="flex justify-center items-center w-10 h-9">
                      <img
                        src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                        alt="avatar"
                        class="h-full object-cover"
                      />
                    </div>
                    <div class="flex flex-col">
                      <h3
                        class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]"
                      >
                        {{ displayUsername }}
                      </h3>
                      <span
                        class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                        >{{ displayEmail }}</span
                      >
                    </div>
                  </div>

                  <!-- log-out-button -->
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="handleLogout"
                  >
                    <img
                      src="https://i.ibb.co.com/Gfb88yFY/log-out.webp"
                      alt="log-out"
                      class="w-3 h-3 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                      >Log out</span
                    >
                  </button>
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                v-if="requiresShipping"
                title="SHIPPING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpenTwo"
                :showChevron="false"
                :toggleable="false"
              >
                <template #headerAction>
                  <button
                    v-if="addressList.length || preset?.shipping"
                    type="button"
                    class="flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                    @click="showAddressPicker = !showAddressPicker"
                  >
                    <span class="text-xs leading-normal font-medium text-[#98A2B3]">Change Address</span>
                    <img
                      :src="checkoutIcons.chevron"
                      alt=""
                      class="w-[10px] h-[7px] transition-transform duration-200"
                      :class="showAddressPicker ? 'rotate-180' : ''"
                    />
                  </button>
                </template>
                <div class="flex flex-col gap-4">
                  <div
                    v-if="showAddressPicker"
                    class="w-full rounded-[6px] border border-[#EAECF080] backdrop-blur-[100px] bg-[#00000040]"
                  >
                    <div
                      v-for="(address, index) in addressList"
                      :key="address.id"
                      class="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#00000080]"
                      :class="index === 0 ? 'border-b border-solid border-b-[#EAECF080]' : ''"
                      @click="selectSavedAddress(address)"
                    >
                      <span class="min-w-0 flex-1 text-sm font-medium text-[#F9FAFB]">
                        {{ formatSavedAddress(address) }}
                      </span>
                      <button
                        type="button"
                        class="shrink-0 bg-transparent border-none p-0 cursor-pointer"
                        @mouseenter="hoveredAddressId = address.id"
                        @mouseleave="hoveredAddressId = ''"
                        @click.stop="editSavedAddress(address)"
                      >
                        <img
                          :src="hoveredAddressId === address.id ? checkoutIcons.editAddressActive : checkoutIcons.editAddress"
                          alt="edit address"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 border-t border-solid border-t-[#EAECF080] bg-transparent p-4 cursor-pointer hover:bg-[#00000080]"
                      @click="startNewAddress"
                    >
                      <img :src="checkoutIcons.addCard" alt="" class="w-4 h-4" />
                      <span class="text-sm font-medium text-[#07F468] whitespace-nowrap">Use New Address</span>
                    </button>
                  </div>
                  <template v-else-if="useNewAddress">
                    <CheckoutShippingFields
                      ref="shippingFieldsRef"
                      :state="checkout.state"
                      :country-options="countryOptions"
                      :state-options="stateOptions"
                    />
                    <div v-if="editingAddressId" class="flex justify-end gap-2">
                      <DashboardPrimaryButton
                        text="Cancel"
                        theme="guestAddressCancel"
                        @click="cancelAddressEdit"
                      />
                      <DashboardPrimaryButton
                        text="Update"
                        theme="guestAddressUpdate"
                        @click="updateAddress"
                      />
                    </div>
                  </template>
                  <AddressCard v-else :address="dynamicShippingAddress" @address-edit="editDisplayedAddress" />
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png"
                v-model="paymentOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <template #headerAction>
                  <div class="relative">
                    <button
                      v-if="savedTokens.length"
                      type="button"
                      class="flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                      @click="showCardPicker = !showCardPicker"
                    >
                      <span class="text-xs leading-normal font-medium text-[#98A2B3]">Change Card</span>
                      <img
                        :src="checkoutIcons.chevron"
                        alt=""
                        class="w-[10px] h-[7px] transition-transform duration-200"
                        :class="showCardPicker ? 'rotate-180' : ''"
                      />
                    </button>
                    <button
                      v-else
                      type="button"
                      class="flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                      @click="useNewCard(); showCardPicker = false"
                    >
                      <img :src="checkoutIcons.addCard" alt="" class="w-4 h-4" />
                      <span class="text-sm font-medium text-[#07F468] whitespace-nowrap">Use New Card</span>
                    </button>
                    <div
                      v-if="showCardPicker && savedTokens.length"
                      class="absolute top-full right-0 z-30 mt-1 w-max rounded-[6px] border border-[#EAECF080] backdrop-blur-[100px] bg-[#00000040]"
                    >
                      <div class="grid grid-cols-[max-content_max-content_max-content_max-content_max-content] gap-x-4">
                        <div
                          v-for="(card, index) in savedTokens"
                          :key="card.id || card.number"
                          class="col-span-5 grid grid-cols-subgrid items-center px-4 py-4 cursor-pointer hover:bg-[#00000080]"
                          :class="index === 0 ? 'border-b border-solid border-b-[#EAECF080]' : ''"
                          @click="applySavedCard(card); showCardPicker = false"
                        >
                          <span class="text-[16px] font-[500] text-[#ffffff] whitespace-nowrap">{{ card.holder }}</span>
                          <span class="text-[12x] font-[600] text-[#ffffff] whitespace-nowrap">{{ maskedToken(card) }}</span>
                          <span class="text-[12px] font-[400] text-[#ffffff] whitespace-nowrap">EXP {{ card.expiry }}</span>
                          <img
                            :src="checkoutIcons.visa"
                            alt="Visa"
                            class="h-3 w-auto justify-self-end"
                          />
                          <button
                            type="button"
                            class="bg-transparent border-none p-0 cursor-pointer justify-self-end"
                            @mouseenter="hoveredTokenId = card.id || card.number"
                            @mouseleave="hoveredTokenId = ''"
                            @click.stop="removeToken(card)"
                          >
                            <img
                              :src="hoveredTokenId === (card.id || card.number) ? checkoutIcons.deleteCardActive : checkoutIcons.deleteCard"
                              alt="delete card"
                              class="w-4 h-4"
                            />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="flex w-full items-center gap-2 border-t border-solid border-t-[#EAECF080] bg-transparent p-4 cursor-pointer hover:bg-[#00000080]"
                        @click="useNewCard(); showCardPicker = false"
                      >
                        <img :src="checkoutIcons.addCard" alt="" class="w-4 h-4" />
                        <span class="text-sm font-medium text-[#07F468] whitespace-nowrap">Add New Credit Card</span>
                      </button>
                    </div>
                  </div>
                </template>
                <div class="relative w-full">
                  <div v-if="checkout.state.paymentSaveCard" class="w-full">
                    <PaymentMethodLoggedIn
                      class="w-full"
                      :holderName="checkout.state.paymentCardHolder"
                      :cardNumber="checkout.state.paymentCardNumber"
                      :expiry="checkout.state.paymentExpiry"
                      :brandSrc="checkoutIcons.visa"
                      variant="large"
                      @card-remove="removeSavedCard"
                    />
                  </div>
                  <div v-else class="w-full">
                    <PaymentMethodNotLoggedIn
                      wrapperClass="w-full"
                      :brandSrc="checkoutIcons.visa"
                      v-model:cardNumber="checkout.state.paymentCardNumber"
                      v-model:expiry="checkout.state.paymentExpiry"
                      v-model:cardHolder="checkout.state.paymentCardHolder"
                      v-model:cvv="checkout.state.paymentCvv"
                      v-model:saveCard="checkout.state.paymentSaveCard"
                    />
                  </div>
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                v-if="requiresShipping"
                title="BILLING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen"
              >
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
            </template>

            <div
              v-if="showDebug"
              class="debugSection grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700"
            >
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-blue-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow State
                </h3>
                <pre
                  class="max-h-64 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono"
                  >{{ JSON.stringify(debugSnapshot, null, 2) }}</pre
                >
              </div>
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-green-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow Logs
                </h3>
                <pre
                  class="max-h-64 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono"
                  >{{ checkout.logs.slice(-50).join("\n") }}</pre
                >
              </div>
            </div>
          </div>

          <div
            ref="rightColumnRef"
            class="flex flex-col gap-6 group/right-col [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:pt-6 lg:-mb-[1px] lg:grow lg:bg-[#00000080] dark:lg:bg-[#181a1b]/50 lg:h-full lg:overflow-y-auto pb-[170px] relative"
          >
            <CheckoutNotes
              :showAvatars="true"
              v-model="checkout.state.orderNotes"
            />

            <Teleport
              to="#mobile-guest-target"
              :disabled="isLargeScreen"
              v-if="isMounted"
            >
              <SectionToggleHeader
                title="ORDER SUMMARY"
                icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
                v-model="orderSummaryOpen"
              >
                <OrderSummary :items="cartItems" />
              </SectionToggleHeader>
            </Teleport>
            <div id="guest-total-target"></div>
          </div>
        </div>

        <Teleport
          to="#guest-total-target"
          :disabled="!isLargeScreen"
          v-if="isMounted"
        >
          <div
            data-total-section
            class="fixed bottom-0 mt-6 w-full bg-[linear-gradient(0deg,rgba(0,0,0,0.4),rgba(0,0,0,0.4)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)] [&.at-bottom]:[background:transparent] backdrop-blur-[35px] group/wrapper shadow-[0px_0px_1px_0px_black] [&.at-bottom]:shadow-none z-[10001] [&.at-bottom]:backdrop-blur-0 lg:w-1/2 md:backdrop-blur-[2.5px] lg:mt-auto lg:-ml-4"
          >
            <div
              class="flex flex-col gap-4 px-2 pb-6 md:px-4 md:rounded-b-[0.625rem] lg:rounded-b-none"
            >
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-0.5">
                  <TotalAmountRow :amount="orderTotal" />
                  <span
                    class="text-xs leading-normal underline text-[#F9FAFB] dark:text-[#e5e3df] inline lg:hidden"
                    >See Summary</span
                  >
                </div>
                <p
                  v-if="paymentMessage"
                  class="text-sm"
                  :class="paymentStatus === 'paid' ? 'text-[#07F468]' : paymentStatus === 'ask' ? 'text-[#FDB022]' : 'text-[#FF692E]'"
                >
                  {{ paymentMessage }}
                </p>
                <CheckboxGroup
                  v-if="checkout.step === 1 || preset"
                  v-model="checkout.state.termsAgreed"
                  checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                  wrapperClass="flex items-center gap-2"
                >
                  I agree to Fansocial’s
                  <a
                    href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer"
                    >Terms and Condition</a
                  >
                  and
                  <a
                    href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer"
                    >Privacy Policy</a
                  >.
                </CheckboxGroup>
                <DashboardPrimaryButton
                  :key="isStepValid"
                  :text="buttonText"
                  :theme="isStepValid ? 'checkoutProceed' : ''"
                  :variant="isStepValid ? 'primary' : 'disableBtn'"
                  :disabled="!isStepValid"
                  :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                  :rightIconClass="arrowIconClass"
                  @click="handleNextStep"
                />
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
