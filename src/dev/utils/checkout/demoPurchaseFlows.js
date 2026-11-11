const DEMO_CREATOR = "CosManiaa Creator";
const DEMO_IMAGE = "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp";
const DEMO_AVATAR = "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp";

const DEMO_SESSION = {
  loggedIn: true,
  email: "nhs161453@nhs.com",
  username: "nhs161453",
};

const SAVED_CARD = {
  id: "visa-0042",
  number: "4242424242420042",
  holder: "s1 NHS",
  expiry: "11/33",
  brand: "visa",
};

const SAVED_CARDS = [
  SAVED_CARD,
  {
    id: "mc-0015",
    number: "5454545454540015",
    holder: "sl 3ds",
    expiry: "11/33",
    brand: "mastercard",
  },
  {
    id: "visa-4242",
    number: "4242424242424242",
    holder: "S13 no3ds",
    expiry: "11/33",
    brand: "visa",
  },
];

const SAVED_SHIPPING = {
  id: "addr-1",
  firstName: "Chan",
  lastName: "Tai Man",
  addressLine1: "10/F Block5",
  addressLine2: "Fook Yip Bldg",
  postalCode: "12345",
  city: "Kwai Chung",
  selectedCountry: "hong-kong",
  selectedState: "",
};

const SAVED_ADDRESSES = [1, 2, 3, 4].map((index) => ({
  ...SAVED_SHIPPING,
  id: `addr-${index}`,
}));

function product({ id, title, price, type }) {
  return {
    id,
    title,
    price,
    finalPrice: price,
    currency: "USD",
    type,
    creatorName: DEMO_CREATOR,
    bgImage: DEMO_IMAGE,
    image: DEMO_IMAGE,
    creatorAvatar: DEMO_AVATAR,
  };
}

const NEW_SUBSCRIPTION = {
  title: "Crave – All Access",
  price: "1.00",
};

export const DEMO_PURCHASE_FLOWS = [
  {
    id: "1-new-subscription",
    video: "1. New Sub Flow",
    group: "Subscription",
    label: "New Subscription Flow",
    kind: "new-subscription",
    newSubscription: NEW_SUBSCRIPTION,
  },
  {
    id: "2-new-sub-saved-tokens",
    video: "2. New Sub Flow (with saved token)",
    group: "Subscription",
    label: "New Subscription (saved tokens)",
    kind: "new-subscription",
    newSubscription: NEW_SUBSCRIPTION,
    session: {
      ...DEMO_SESSION,
      savedCards: SAVED_CARDS,
    },
  },
  {
    id: "3-new-sub-saved-use-new-card",
    video: "3. New Sub Flow (with saved option BUT use new card instead)",
    group: "Subscription",
    label: "New Subscription (saved email and card)",
    kind: "new-subscription",
    newSubscription: NEW_SUBSCRIPTION,
    session: {
      loggedIn: true,
      username: "nhs04spe23292",
      email: "nhs04spe@nhs.com",
      savedCard: {
        id: "visa-4242",
        number: "4242424242424242",
        holder: "NHS",
        expiry: "11/2033",
        brand: "visa",
      },
    },
  },
  {
    id: "4-free-to-paid-saved-card",
    video: "4. free to paid subscription switch ( saved card )",
    group: "Subscription",
    label: "Free → paid (saved card)",
    kind: "free-to-paid",
    session: {
      loggedIn: true,
      username: "nhs04spe23292",
      email: "nhs04spe@nhs.com",
      savedCard: {
        id: "visa-4242",
        number: "4242424242424242",
        holder: "NHS",
        expiry: "11/2033",
        brand: "visa",
      },
    },
  },
  {
    id: "5-free-to-paid-new-card",
    video: "5. free to paid subscription switch ( new card )",
    group: "Subscription",
    label: "Free → paid (new card)",
    kind: "free-to-paid",
    session: {
      loggedIn: true,
      username: "nhs04spe23292",
      email: "nhs04spe@nhs.com",
      useNewCard: true,
    },
  },
  {
    id: "6-paid-upgrade-saved-card",
    video: "6. paid to paid upgrade subscription switch ( saved card )",
    group: "Subscription",
    label: "Paid → paid upgrade (saved card)",
    kind: "paid-upgrade",
    session: {
      ...DEMO_SESSION,
      savedCards: SAVED_CARDS,
      useNewCard: false,
    },
  },
  {
    id: "7-paid-upgrade-new-card",
    video: "7. paid to paid upgrade subscription switch ( new card )",
    group: "Subscription",
    label: "Paid → paid upgrade (new card)",
    kind: "paid-upgrade",
    session: {
      ...DEMO_SESSION,
      savedCards: SAVED_CARDS,
      useNewCard: true,
    },
  },
  {
    id: "8-paid-to-free-no-payment",
    video: "8. paid to free downgrade subscription switch ( No payment required )",
    group: "Subscription",
    label: "Paid → free downgrade (no payment)",
    kind: "paid-to-free",
    requiresPayment: false,
  },
  {
    id: "9-paid-downgrade-saved-card",
    video: "9. paid to paid downgrade subscription switch ( saved card )",
    group: "Subscription",
    label: "Paid → paid downgrade (saved card)",
    kind: "paid-downgrade",
    session: {
      ...DEMO_SESSION,
      savedCards: SAVED_CARDS,
      useNewCard: false,
    },
  },
  {
    id: "10-ppv-saved-token",
    video: "10. New Order PPV (with saved token)",
    group: "Orders",
    label: "New order PPV (saved token)",
    kind: "guest-checkout",
    requiresShipping: false,
    product: product({
      id: "ppv-saved-token",
      title: "asdfadsf",
      price: "33.00",
      type: "ppv",
    }),
    preset: {
      ...DEMO_SESSION,
      savedCard: {
        id: "visa-0042-ppv",
        number: "4242424242420042",
        holder: "a1 NHS",
        expiry: "11/2033",
        brand: "visa",
      },
      useNewCard: false,
      startStep: 2,
    },
  },
  {
    id: "12-merch-saved-token",
    video: "12. New Order Merch (shipping address required) (with saved token)",
    group: "Orders",
    label: "New merch (saved token)",
    kind: "guest-checkout",
    requiresShipping: true,
    product: product({
      id: "merch-saved-token",
      title: "merch 1407 test",
      price: "4.00",
      type: "merch",
    }),
    preset: {
      loggedIn: true,
      email: "nhs-1@nhs.com",
      username: "nhs161453",
      savedCard: SAVED_CARD,
      useNewCard: false,
      startStep: 1,
    },
  },
  {
    id: "13-merch-shipping-required",
    video: "13. New Order Merch (shipping address required + saved options But use new card)",
    group: "Orders",
    label: "New merch (shipping address required)",
    kind: "guest-checkout",
    requiresShipping: true,
    product: product({
      id: "merch-shipping",
      title: "AAA new merch",
      price: "13.00",
      type: "merch",
    }),
    preset: {
      ...DEMO_SESSION,
      savedCard: SAVED_CARD,
      savedCards: SAVED_CARDS,
      useNewCard: false,
      shipping: SAVED_SHIPPING,
      savedAddresses: SAVED_ADDRESSES,
      startStep: 2,
    },
  },
  {
    id: "14-payment-failed",
    video: "14. Payment failed with new card and saved card",
    group: "Payment",
    label: "Payment failed (new + saved card)",
    kind: "guest-checkout",
    requiresShipping: false,
    forceScenario: "failure",
    product: product({
      id: "ppv-fail",
      title: "asdfas",
      price: "2.00",
      type: "ppv",
    }),
    preset: {
      ...DEMO_SESSION,
      savedCard: {
        id: "visa-0042-fail",
        number: "4242424242420042",
        holder: "a1 NHS",
        expiry: "11/2033",
        brand: "visa",
      },
      useNewCard: false,
      startStep: 2,
    },
  },
];

export const DEMO_PURCHASE_GROUPS = ["Subscription", "Orders", "Payment"];
