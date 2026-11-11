import { fail } from "@/services/flow-system/flowTypes.js";
// import { getApiBaseUrl } from "@/config/apiConfig.js";
import { getApiBaseUrl } from "@/infrastructure/http/getApiBaseUrl.js";

export function getBookingsApiBaseUrl(context = {}) {
  return getApiBaseUrl(context);
}

export function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
