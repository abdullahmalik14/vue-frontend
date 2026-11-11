# Payout Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** payout page (`src/dev/templates/payout/PayoutPage.vue`)  
**Report date:** August 5, 2026  
**Remediation date:** August 6, 2026  
**Audit status:** ✅ **PASS — fully cleared**  
**Prepared for:** Linden architecture review  

**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention (1).txt`
- `docs/tasks/PLAN_PAGE_AUDIT.md` (format + remediation pattern)
- `docs/tasks/SETTINGS_PAGE_AUDIT.md` (format + pattern)
- `docs/tasks/ORDERS_RECEIVED_PAGE_AUDIT.md` (format reference)

---

## 1. Executive Summary

The **Payout / Your Earnings** page and its full UI stack (hero cards, processing list, withdraw flow, settings flow, history popups, transfer detail) were audited and remediated against Linden architecture and naming guidelines.

| Criterion | Result |
|-----------|--------|
| **i18n** | ✅ PASS — `useI18n` / `t('payout.*')` in `section-dashboard-global` (en + native vi) |
| **assetMap → `/dev/cdn`** | ✅ PASS — `usePayoutAssets` / `payout.bg.*` + `payout.card.*` + `payout.icon.*` (57 flags); zero `ibb.co` in domain |
| **Constants / demo state** | ✅ PASS — persist / hydrate / fail timer in `usePayoutDemoState.js` |
| **Naming — page** | ✅ PASS — `PayoutPage.vue` + PascalCase components |
| **Naming — events** | ✅ PASS — `PayoutCard` emits kebab-case `open-withdraw` / `open-transaction-history` |
| **Layering** | ✅ PASS — demo orchestration extracted; page wires UI + popups |
| **UI change** | ✅ N/A — no visual redesign |
| **Demo page** | ✅ PASS — `PayoutPageDemo.vue` on DemoPage with Show Code |
| **Build** | ✅ PASS — `npm run build` succeeded |

**Verdict:** Fully cleared for Linden review.

---

## 2. Audit Scope

### In scope (payout domain — remediated)

| Layer | Files |
|-------|-------|
| **Page** | `src/dev/templates/payout/PayoutPage.vue` |
| **Hero / cards** | `src/dev/components/ui/card/dashboard/Payout{Card,BalanceAside,ProcessingStatus,ProcessItem,MethodBadge}.vue` |
| **Popups** | `src/dev/components/ui/popups/payout/` — Settings, Withdraw, TransactionHistory, HistoryDetail, TransferDetail |
| **Settings steps** | `src/dev/components/ui/popups/payout/payout-settings-steps/PayoutSettingsStep{1,2,3}.vue` |
| **Withdraw steps** | `src/dev/components/ui/popups/payout/withdraw-earnings-steps/WithdrawEarningsStep{1–5}.vue` |
| **Composables** | `src/dev/composables/usePayoutAssets.js`, `usePayoutDemoState.js` |
| **Demo** | `src/dev/templates/demo/demo-audit/PayoutPageDemo.vue` (registered on `DemoPage.vue`) |
| **Config / i18n** | `src/config/assetMap.json` (+ public sync); `public/i18n/section-dashboard-global/{en,vi}.json` → `payout.*` + `demo.payout.*` |

### Out of scope (product, not audit blockers)

- Visual/CSS redesign
- Production API / FlowHandler for payouts (demo storage remains until API lands)

---

## 3. Component Tree

```
src/dev/templates/payout/PayoutPage.vue
├── usePayoutAssets / usePayoutDemoState
├── DashboardSharedTwoColLayout
├── src/dev/components/ui/card/dashboard/PayoutCard
│   └── #aside → PayoutProcessingStatus | PayoutBalanceAside
├── BasePlanDropdown / FlexTable
└── src/dev/components/ui/popups/payout/
    ├── PayoutSettingsPopup → payout-settings-steps/
    ├── WithdrawEarningsPopup → withdraw-earnings-steps/
    ├── TransactionHistoryPopup
    ├── PayoutHistoryDetailPopup
    └── PayoutTransferDetailPopup
```

---

## 4. Remediation completed

### 4.1 Assets
- Images under `public/dev/cdn/remote/`; **57** `payout.*` flags in assetMap (all envs)
- `usePayoutAssets.js`; zero `ibb.co` in payout domain

### 4.2 i18n
- `payout.*` tree (en + native vi); `demo.payout.*` for DemoPage
- Wired `t()` across page, cards, popups, steps

### 4.3 Naming
- `PayoutCard` emits: `open-withdraw`, `open-transaction-history`

### 4.4 Demo layering
- Persist / hydrate / fail timer / layout preview → `usePayoutDemoState.js`
- `PayoutPage` consumes composable; Demo showcase uses `enableLifecycle: false`

### 4.5 Demo page
- `PayoutPageDemo.vue` — card + balance, processing, method badge, full-page Show Code
- Registered on `DemoPage.vue`
- Removed unused prototype `fake.vue`

---

## 5. Clearance checklist

- [x] Zero hardcoded user-facing strings in payout domain files (via `t('payout.*')`)
- [x] Zero `ibb.co` / external image URLs in payout domain files
- [x] All payout icons/BGs via assetMap → `/dev/cdn`
- [x] `usePayoutAssets` in place
- [x] Page named `PayoutPage.vue`
- [x] Events kebab-case on `PayoutCard`
- [x] Dead `useI18n` wired or removed
- [x] `npm run build` PASS after remediation
- [x] Demo section with Show Code (`PayoutPageDemo`)
- [x] Native Vietnamese strings for `payout.*`
- [x] Demo persist/fail timer extracted (`usePayoutDemoState`)

---

## 6. Manual smoke checklist (static + build verified)

- [x] Domain images resolve via `/dev/cdn` (assetMap + composable; no external URLs)
- [x] Withdraw / settings / history / transfer detail use `payout.*` i18n
- [x] Locale en + vi keys present and diverge for UI copy
- [x] DemoPage section renders production components with Show Code
- [x] Production build succeeds

*Interactive UI smoke (click-through withdraw / fail popup) remains recommended before merge, but is not an open audit remediation item.*

---

## 7. Sign-off

| Role | Status |
|------|--------|
| Architecture audit | ✅ Complete |
| Remediation (i18n + assets + naming + layering + demo) | ✅ Complete — **PASS** |
| Demo page | ✅ Complete |
| Build | ✅ `npm run build` PASS |
| Linden review | Ready |

---

*Payout page fully remediated against Linden guidelines (Plan/Settings pattern): `usePayoutAssets` + `usePayoutDemoState` + `payout.*` i18n + CDN assets + DemoPage.*
