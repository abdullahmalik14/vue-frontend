import { getAnalyticsApiBaseUrl } from '@/services/analytics/analyticsApiUtils.js'

export async function fetchEnrichmentData(bundle) {
  const fanIds = new Set()
  const mediaIds = new Set()
  const merchIds = new Set()
  const subscriptionIds = new Set()

  // Collect fanIds from contributors
  const contribs = bundle.contributors || {}
  const groupNames = ['topContributors', 'topFans', 'topOrderSpenders']
  for (const group of groupNames) {
    const source = contribs[group]
    if (!source) continue
    const lists = Array.isArray(source) ? [source] : Object.values(source)
    for (const list of lists) {
      for (const c of (list || [])) {
        if (c?.fanId) {
          const id = Number(c.fanId)
          if (!isNaN(id)) fanIds.add(id)
        }
      }
    }
  }

  // Collect fanIds from recent orders
  const orders = bundle.recentOrders || {}
  for (const list of Object.values(orders)) {
    for (const o of (list || [])) {
      if (o?.fanId) {
        const id = Number(o.fanId)
        if (!isNaN(id)) fanIds.add(id)
      }
    }
  }

  // Collect mediaIds from trending media
 const trendingMedia = bundle.trendingsMedia || bundle.trendingMedia || {};
  for (const list of Object.values(trendingMedia)) {
    for (const m of (list || [])) {
      if (m?.mediaId != null) {
        mediaIds.add(Number(m.mediaId));
      } else if (m?.media) {
        const parsedId = Number(String(m.media).replace(/^Media\s*#/, '').trim());
        if (!isNaN(parsedId)) mediaIds.add(parsedId);
      }
    }
  }
  // Collect merchIds from trending merch
  const trendingMerch = bundle.trendingMerch || bundle.trendingsMerch || {};
  for (const list of Object.values(trendingMerch)) {
    for (const m of (list || [])) {
      if (m?.merchId != null) {
        merchIds.add(Number(m.merchId));
      // } else if (m?.merch) {
      //   // const parsedId = Number(String(m.merch).replace(/^Merch\s*#/, '').trim());
      //   const parsedId = Number(String(m.merch).replace(/^Merch\s*#/i, '').trim());
      //   if (!isNaN(parsedId)) merchIds.add(parsedId);
      // }
      }else if (m?.merch) {
  const match = String(m.merch).match(/#(\d+)\s*$/);
  if (match) merchIds.add(Number(match[1]));
}
    }
  }

  // Collect planIds from subscription bundle
  const subBundle = bundle.subscriptions
  if (subBundle) {
    const periods = Array.isArray(subBundle) ? subBundle : Object.values(subBundle)
    for (const period of periods) {
      if (!period || typeof period !== 'object') continue
      const planIds = Array.isArray(period.planIds) ? period.planIds : []
      for (const pid of planIds) {
        const planId = Number(pid)
        if (!isNaN(planId) && planId > 0) subscriptionIds.add(planId)
      }
    }
  }

  if (fanIds.size === 0 && mediaIds.size === 0 && merchIds.size === 0 && subscriptionIds.size === 0) {
    return { userMap: new Map(), mediaMap: new Map(), merchMap: new Map(), subscriptionMap: new Map() }
  }

  const baseUrl = getAnalyticsApiBaseUrl()
  const enrichUrl = baseUrl ? `${baseUrl}/api/enrich` : '/api/enrich'

  const response = await fetch(enrichUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fanIds: [...fanIds],
      mediaIds: [...mediaIds],
      subscriptionIds: [...subscriptionIds],
      merchIds: [...merchIds],
    }),
  })

  if (!response.ok) throw new Error(`Enrichment fetch failed: ${response.status}`)

  const { users = [], media = [], merch = [], subscriptions = [] } = await response.json()

  return {
    userMap: new Map(users.map(u => [String(u.id), u])),
    mediaMap: new Map(media.map(m => [String(m.id), m])),
    merchMap: new Map(merch.map(m => [String(m.id), m])),
    subscriptionMap: new Map(subscriptions.map(s => [String(s.id), s])),
  }
}
