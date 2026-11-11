import { useI18n } from "vue-i18n";

const FALLBACKS = {
  "demo.checkoutReusable.notes.title": "Notes",
  "demo.checkoutReusable.notes.optional": "Optional",
  "demo.checkoutReusable.notes.creatorName": "Princess Carrot Pop",
  "demo.checkoutReusable.notes.placeholder": "Enter notes to @jenny1234....",
  "demo.checkoutReusable.notes.charactersLeft": "{count} Characters Left",
  "demo.checkoutReusable.totalAmount.label": "Total",
  "demo.checkoutReusable.orderSummary.title": "ORDER SUMMARY",
  "demo.checkoutReusable.orderSummary.product": "Product",
  "demo.checkoutReusable.orderSummary.subtotal": "Subtotal",
  "demo.checkoutReusable.orderSummary.alt.avatar": "Creator avatar",
  "demo.checkoutReusable.orderSummary.alt.verified": "Verified",
  "demo.checkoutReusable.addressCard.alt.edit": "Edit address",
  "demo.checkoutReusable.paymentLoggedIn.deleteCard": "Delete Card",
  "demo.checkoutReusable.paymentLoggedIn.cardHolderName": "Card Holder Name",
  "demo.checkoutReusable.paymentLoggedIn.expiryDate": "Expiry Date",
  "demo.checkoutReusable.paymentLoggedIn.noName": "No Name",
  "demo.checkoutReusable.paymentLoggedIn.expiryPlaceholder": "MM/YY",
  "demo.checkoutReusable.paymentLoggedIn.expPrefix": "EXP",
  "demo.checkoutReusable.paymentNotLoggedIn.saveCard":
    "Save this card for faster checkout.",
  "demo.checkoutReusable.paymentNotLoggedIn.cardNumber": "Card Number",
  "demo.checkoutReusable.paymentNotLoggedIn.expirationDate": "Expiration Date",
  "demo.checkoutReusable.paymentNotLoggedIn.cardholderName": "Cardholder Name",
  "demo.checkoutReusable.paymentNotLoggedIn.cvv": "CVV",
};

function fill(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] == null ? `{${key}}` : String(values[key]),
  );
}

export function useCheckoutCopy() {
  let translate = null;
  try {
    const i18n = useI18n({ useScope: "global" });
    translate = i18n.t;
  } catch {
    translate = null;
  }

  return (key, values) => {
    if (translate) {
      try {
        const translated = String(translate(key, values || {}));
        if (translated && translated !== key) return translated;
      } catch {
        /* use fallback copy when the locale bundle is not loaded */
      }
    }
    return fill(FALLBACKS[key] || key, values);
  };
}
