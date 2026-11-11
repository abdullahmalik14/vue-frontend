# Analytics Popup / Chart Instantness — Investigation & Plan

**Date:** 2026-07-11 (updated 2026-07-12 after Linden feedback)  
**Scope:** Trend popups on Dashboard Analytics (open latency + chart paint)  
**Mode:** Investigate + measure (no warm-cache / no chart-reuse)

---

## Linden constraints (hard rules)


| Rule                                          | Decision                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Destroy on close                              | **Always** — `v-if` destroy is correct (Apple DOM size / perf history)       |
| Keep popup warm (`v-show` / keep mounted)     | **Do not** — previously slowed the page                                      |
| Pre-calculate chart series on load            | **Do not** (for now) — previously slowed the page; was a reason for Vue move |
| Reuse amcharts instances (Phase 3)            | **Do not** — previously reused and slowed the site tremendously              |
| Accept slight delay open → chart script paint | OK                                                                           |
| Click → popup shell visible                   | Must feel instant — **this is the focus**                                    |


---



## What was wrong with the first plan

The first write-up focused on chart recreate / sequential amcharts / Likes fetch.  
Linden’s point: that may explain **content paint**, but **not** the delay from **click to popup opening**.

We must separate:

1. **T0 → T_shell** — click until popup chrome/overlay is visible
2. **T_shell → T_chart** — chart/script render after shell is open (acceptable if small)

---



## Current investigation (in progress)



### A) Hello World BasePopup probe (staging)

On `/dashboard/analytics` (bottom test strip):

- **Open Hello World (fade 200ms)** — same open animation family as trend popups  
- **Open Hello World (instant)** — `speed: 0ms` + `customEffect: instant`  
- **Open Earnings (real) + log click** — compare real popup

Console prefix: `[PopupOpenTiming]`

Probe file: `src/dev/components/ui/popups/dashboard/AnalyticsHelloWorldPopupProbe.vue`  
Wired in: `src/templates/dashboard/global/DashboardAnalyticsPage.vue`  
Still uses `v-if` **destroy-on-close**.

### B) First-time page load

Also measure:


| Scenario                                              | What to record   |
| ----------------------------------------------------- | ---------------- |
| Cold visit (hard refresh) → immediately open Earnings | click → shell ms |
| After bundle toast finished → open Earnings           | click → shell ms |
| Hello World cold vs warm page                         | click → shell ms |


If Hello World is instant but Earnings shell is slow → cost is **heavy popup SFC mount** (huge template), not BasePopup alone.  
If Hello World (fade) is also ~200ms+ → part of delay is **BasePopup animation / stack**.  
If Hello World (instant) is still slow → **BasePopup / overlay / teleport / focus / scroll-lock** path.

### C) Known config that can feel like “open delay”

Trend shell (`DashboardAnalyticsTrendPopup.vue`) uses:

```js
speed: '200ms',
customEffect: 'fade',
```

Even with empty content, fade alone can feel like click→open lag. Instant probe isolates that.

---



## Earlier findings (still valid for chart paint only — not click→shell)


| Item                                                       | Still relevant?                |
| ---------------------------------------------------------- | ------------------------------ |
| Data already in Pinia after load (except Likes series gap) | Yes for chart content          |
| Sequential amcharts destroy/recreate                       | Yes for chart paint after open |
| Likes re-fetches full bundle                               | Yes for Likes content delay    |
| Keep popup warm / precalc / reuse charts                   | **Rejected by Linden**         |


---







## Next steps

1. Run Hello World vs Earnings timings (first load + after load); paste console numbers
2. If BasePopup path is slow → profile `usePopupStack` / overlay / focus trap / teleport
3. If only heavy analytics SFCs are slow → reduce **mount work before first paint** (defer chart work until after shell visible; keep destroy-on-close)
4. Do **not** implement warm popup, precalc-on-load, or amcharts reuse unless Linden reopens those options

---



## Approval ask

After timings are collected, propose a **narrow** fix aimed at click→shell only (still destroy-on-close).