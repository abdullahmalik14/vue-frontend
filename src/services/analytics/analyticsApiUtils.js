import { getApiBaseUrl } from '@/infrastructure/http/getApiBaseUrl.js';

function normalizeApiBaseUrl(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return "";

  const lowered = normalized.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";
  return normalized.replace(/\/+$/, "");
}

/**
 * Analytics API origin for browser requests.
 * Resolved via the centralized API config (apiConfig.js).
 * Environment is controlled by VITE_API_ENVIRONMENT ("production" | "staging").
 */
export function getAnalyticsApiBaseUrl(context = {}) {
  const configured =
    context.analyticsApiBaseUrl ??
    getApiBaseUrl('dashboard.analytics');

  return normalizeApiBaseUrl(configured);
}

export function buildAnalyticsChartsBundleUrl(creatorId, query = {}, context = {}) {
  const params = new URLSearchParams(query);
  const queryString = params.toString();
  const path = `/api/charts/${creatorId}${queryString ? `?${queryString}` : ""}`;
  const baseUrl = getAnalyticsApiBaseUrl(context);
  return baseUrl ? `${baseUrl}${path}` : path;
}
