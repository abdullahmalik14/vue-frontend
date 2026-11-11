import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { useDashboardAnalyticsStore } from "@/stores/useDashboardAnalyticsStore.js";
import { buildAnalyticsChartsBundleUrl } from "@/services/analytics/analyticsApiUtils.js";
import { fetchEnrichmentData } from "@/services/analytics/enrichAnalyticsFlow.js";

/**
 * Flow to fetch the analytics data bundle.
 * Simple 5-minute polling without ETag.
 *
 * @param {Object} params
 * @param {Object} params.payload - Input parameters (source)
 * @param {Object} params.context - Pipeline context
 */
export async function fetchAnalyticsFlow({ payload, context }) {
  let creatorId = "456";
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    creatorId =
      urlParams.get("creator") ||
      urlParams.get("creator_id") ||
      urlParams.get("creatorId") ||
      "456";
  }
  const referenceDate =
    context?.referenceDate ||
    payload?.referenceDate ||
    (typeof window !== "undefined"
      ? window.__ANALYTICS_REFERENCE_DATE__
      : null);

  // Send the viewer's timezone offset (in hours) so the backend can compute
  // daily views in the viewer's local timezone instead of UTC midnight.
  // e.g. UTC+8 (Hong Kong) => 8, UTC-5 (US East) => -5.
  let timezoneOffset = null;
  if (typeof window !== "undefined") {
    try {
      timezoneOffset =
        context?.timezoneOffset ??
        payload?.timezoneOffset ??
        window.__ANALYTICS_TIMEZONE_OFFSET__ ??
        null;
      if (timezoneOffset === null || timezoneOffset === undefined) {
        // getTimezoneOffset returns minutes west of UTC; convert to hours east.
        timezoneOffset = -new Date().getTimezoneOffset() / 60;
      }
    } catch (e) {
      timezoneOffset = null;
    }
  }

  const bundleFile = buildAnalyticsChartsBundleUrl(
    creatorId,
    {
      nocache: "1",
      ...(referenceDate ? { referenceDate } : {}),
      ...(timezoneOffset !== null && timezoneOffset !== 0
        ? { timezoneOffset: String(timezoneOffset) }
        : {}),
    },
    context,
  );
  console.log(
    `[Polling] ⏰ Fetching latest analytics data from ${bundleFile}...`,
  );
// await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const response = await fetch(bundleFile, {
      signal: context.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      try {
        useDashboardAnalyticsStore().bundleLoaded = true;
      } catch (e) {}
      return fail({
        code: "FETCH_ANALYTICS_FAILED",
        message: `Failed to fetch analytics bundle (${response.status})`,
      });
    }

    const data = await response.json();
    data.dataSource = payload?.source || "full";

    console.log(`[Polling] ✅ Successfully fetched new analytics data.`);

;(async () => {
  try {
    const store = useDashboardAnalyticsStore();
    const { userMap, mediaMap, merchMap, subscriptionMap } = await fetchEnrichmentData(data);
    store.applyEnrichment({ userMap, mediaMap, merchMap, subscriptionMap });
    console.log(
      `[Enrichment] ✅ Display data loaded (${userMap.size} users, ${mediaMap.size} media, ${merchMap.size} merch, ${subscriptionMap.size} subscriptions)`,
    );
  } catch (e) {
    console.warn('[Enrichment] ⚠️ Failed to load display data:', e.message);
  }
})();

    return ok(data, {
      flow: "analytics.fetch",
      status: response.status,
      fetchedAt: Date.now(),
    });
  } catch (error) {
    try {
      useDashboardAnalyticsStore().bundleLoaded = true;
    } catch (e) {}
    return fail({
      code: "FETCH_ANALYTICS_UNEXPECTED",
      message: "An unexpected error occurred while fetching analytics.",
      details: error.message,
    });
  }
}
