# Plan Publish Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** `/subscription/plan` (`src/dev/templates/plan/PlanPage.vue`)  
**Report date:** August 9, 2026  
**Remediation date:** August 9, 2026  
**Audit status:** ✅ **PASS — fully cleared**  
**Prepared for:** Linden architecture review  

**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention (1).txt`
- `docs/tasks/PAYOUT_PAGE_AUDIT.md` (format + clearance bar)
- `docs/tasks/SETTINGS_PAGE_AUDIT.md`
- `docs/tasks/ORDERS_RECEIVED_PAGE_AUDIT.md`

---

## 1. Executive Summary

The **Plan / New Tier publish flow** and its full UI stack (steps, parts, discount + lucky-draw popups, preview TierCard, demo) were re-audited and remediated against Linden guidelines at the Payout clearance bar.

| Criterion | Result |
|-----------|--------|
| **i18n** | ✅ PASS — `plan.*` + `tierCard.ui.*` / `tierCard.alt.*` (en + native vi) |
| **assetMap → `/dev/cdn`** | ✅ PASS — `usePlanAssets` + `useTierCardAssets`; zero `ibb.co` on PlanPage render tree |
| **Constants / demo state** | ✅ PASS — step engine on page |
| **Naming — page** | ✅ PASS — `PlanPage.vue` |
| **Naming — events** | ✅ PASS — kebab-case emits |
| **Layering** | ✅ PASS — plan UI under `src/dev`; TierCard shared in `src/components` (CDN + i18n) |
| **Demo page** | ✅ PASS — `PlanPageDemo` + accurate `/subscription/plan` + `dashboard-global` copy |
| **UI change** | ✅ N/A — no visual redesign |

**Verdict:** Fully cleared for Linden review.

---

## 2. Audit Scope

| Layer | Files |
|-------|-------|
| **Page** | `src/dev/templates/plan/PlanPage.vue` |
| **Steps / parts / popups** | `src/dev/components/plan/**`, `src/dev/components/ui/popups/plan/**` |
| **Composables** | `usePlanAssets.js`, `useTierCardAssets.js` |
| **Preview** | `src/components/ui/card/dashboard/TierCard.vue` |
| **Demo** | `PlanPageDemo.vue` on `DemoPage.vue` |
| **Config / i18n** | `plan.icon.*`, `tierCard.icon.*`; `plan.*` + `tierCard.ui.*` in section-dashboard-global |

---

## 3. Component Tree

```
PlanPage.vue  (/subscription/plan, section: dashboard-global)
├── usePlanAssets
├── BasePopup / DashboardPrimaryButton
├── TierCard ← useTierCardAssets + tierCard.ui.*
├── PlanDetail → SubscriberDiscountPopup, UnsubscribeDiscountPopup
├── PlanVariation → SubscriptionVariations, LuckyDrawSection,
│                   SubscriptionPlanVariationsPopup, LuckyDrawEventPopup
│                   → LuckyDrawAddPrizePopup
├── PlanSharing
└── PlanPublishSetting
```

---

## 4. Remediation completed

### 4.1 TierCard (P0)
- Downloaded icons → `public/dev/cdn/remote/`
- Added `tierCard.icon.*` to assetMap (all envs)
- Created `useTierCardAssets.js`
- Wired `t('tierCard.ui.*')` / `t('tierCard.alt.*')` (en + vi)
- Zero `ibb.co` in TierCard

### 4.2 Plan CDN flags (P0)
- Moved `plusBlue/Green/GreySquare`, `alarm`, `check` → `/dev/cdn/remote/plan-*`
- Updated `plan.icon.*` in assetMap; `usePlanAssets` includes `check`

### 4.3 In-domain `/images/` (P1)
- Checkbox CSS → `/dev/cdn/remote/plan-check.svg`
- Alarm fallbacks removed (`assets.alarm` only)

### 4.4 Demo metadata (P1)
- `demo.plan.*` → `dashboard-global` + `/subscription/plan`
- `PlanPageDemo` Show Code route comment updated

---

## 5. Clearance checklist

- [x] Plan domain: user-facing via `t('plan.*')`
- [x] Plan domain: zero `ibb.co`
- [x] TierCard: zero `ibb.co` + i18n
- [x] All plan/tierCard icons via assetMap → `/dev/cdn`
- [x] No hardcoded `/images/` in plan Vue CSS/fallbacks
- [x] `usePlanAssets` + `useTierCardAssets`
- [x] Page named `PlanPage.vue`
- [x] Events kebab-case
- [x] Demo section + accurate copy
- [x] Native vi for plan + tierCard UI strings

---

## 6. Manual smoke checklist

- [ ] Open `/subscription/plan` — Network: `/dev/cdn/...` (not ibb /images)
- [ ] Preview TierCard — localized labels + CDN icons
- [ ] Discount + Lucky Draw popups; checkbox checkmark visible
- [ ] Locale en ↔ vi
- [ ] DemoPage → Plan section copy accurate

---

## 7. Sign-off

| Role | Status |
|------|--------|
| Architecture re-audit | ✅ Complete |
| Remediation | ✅ Complete — **PASS** |
| Demo metadata | ✅ Complete |
| Linden review | Ready |

---

*Plan publish flow cleared at the Payout architecture bar: CDN assets, i18n, TierCard, demo copy.*
