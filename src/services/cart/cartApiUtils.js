import { fail } from "@/services/flow-system/flowTypes.js";

/**
 * Same-origin base so `mockCartBackend` can intercept `/cart/...` via window.fetch.
 * Optional override: context.apiBaseUrl
 */
export function getCartApiBaseUrl(context = {}) {
  if (typeof context?.apiBaseUrl === "string" && context.apiBaseUrl.trim()) {
    return context.apiBaseUrl.replace(/\/+$/, "");
  }
  return "";
}

export function asFlowError(error, fallbackCode, fallbackMessage) {
  if (error?.ok === false && error?.error) {
    return error;
  }

  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || fallbackMessage,
    details: error?.details || error,
  });
}
