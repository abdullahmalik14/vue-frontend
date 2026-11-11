# Cosmo Payout Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** `/payouts-cosmo` (`src/dev/templates/payout/PayoutCosmoPage.vue`)  
**Report date:** October 12, 2026  
**Remediation date:** October 14, 2026  
**Audit status:** PASS — cleared for Linden review (same bar as `PAYOUT_PAGE_AUDIT.md`). Polish pass 9 closed brand hex, wallet CDN marks, and native field label wrapping.  
**Prepared for:** Linden architecture review  

**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention.txt`
- `css-tailwind-data-attribute-vite-standards.md`
- `docs/tasks/PAYOUT_PAGE_AUDIT.md` (clearance bar for the existing payout page)

Remediation items 1–9 are applied. English copy is the same. Click paths and Cosmo brand colours are unchanged (hex moved into `cosmo.*` Tailwind tokens). Icons and wallet marks come from `assetMap` under `/dev/cdn`. Data attributes, the quick-action button, table composable, services layer, demo showcase, a11y labels, upload CDN icon, and pixel-safe token aliases are done.

---

## 1. Executive Summary

The Cosmo payout page and its components were audited and remediated against the same architecture, naming, and Linden bar used on the cleared payout page.

| Criterion | Result |
|-----------|--------|
| **i18n** | Pass — `t('payoutCosmo.*')` in `section-misc` en and vi, including `alt.*` and header `aria*` labels. |
| **assetMap → `/dev/cdn`** | Pass — every image/icon is an assetMap file under `/dev/cdn`, including wallet `payout.cosmo.personMark` / `payout.cosmo.cardChip`. Upload dropzone uses `payout.icon.uploadCloud` via the `ThumbnailUploader` `#icon` slot. |
| **Constants / demo state** | Pass — `usePayoutCosmoTable`; session in `src/services/payout/payoutCosmoPayloads.js`. |
| **Naming — files** | Pass — `PayoutCosmoPage.vue` and PascalCase components. JS modules are camelCase. |
| **Naming — methods** | Pass — `closePopup()`, `handlePopupToggle()`, `buildCosmoRequests()`, step field `requiresApi`. |
| **Layering** | Pass — page composes UI. Step lists and session live in `src/services/payout/`. Demo data, not a live FlowHandler flow. |
| **Tailwind / tokens** | Pass — Cosmo brand palette lives in `tailwind.config.js` as `cosmo.*` (exact prior hex). Vue classes use `cosmo-*` utilities; no raw `#` in Cosmo Vue SFCs. Off-scale layout arbitrary values stay so the screen does not change. |
| **Data attributes** | Pass — `data-component`, `data-action`, `data-element`, `data-state` on page, triggers, and popup. |
| **Accessibility** | Pass — `PayoutQuickAction` is a button; header and popup controls have accessible names; native inputs/selects are wrapped by `<label>`; fields show outline only on keyboard focus. Document dropzone captions stay above `ThumbnailUploader` (custom control). |
| **Demo page** | Pass — `PayoutCosmoPageDemo` on `/dashboard/demo-page` with `ShowCodeToggle` and `demo.payoutCosmo.*`. |
| **UI / behaviour change** | None. Keyboard focus rings only while a control is focused from the keyboard. |

**Verdict:** Fully cleared for Linden review.

---

## 2. Audit Scope

| Layer | Files |
|-------|-------|
| **Page** | `src/dev/templates/payout/PayoutCosmoPage.vue` |
| **Route** | `src/router/routeConfig.json` → `/payouts-cosmo`, section `misc` |
| **Popup** | `src/dev/components/payout/cosmo/PayoutCosmoFlowPopup.vue` |
| **Rows / cards** | `PayoutStatCard.vue`, `PayoutQuickAction.vue`, `PayoutIconTile.vue`, `PayoutActionText.vue` |
| **Icons** | `PayoutCdnIcon.vue` |
| **Step + mock data** | `src/services/payout/payoutCosmoFlows.js`, `src/services/payout/payoutCosmoPayloads.js` |
| **Table demo** | `src/dev/composables/usePayoutCosmoTable.js` |
| **Demo** | `src/dev/templates/demo/demo-audit/PayoutCosmoPageDemo.vue` |

Reused from the rest of the app, not re-audited: `DashboardSharedTwoColLayout`, `FlexTable`, `MyMediaTabs`, `TwoPieceButton`, `DashboardPrimaryButton`, `BasePopup`, `ThumbnailUploader`, `usePayoutAssets`.

---

## 3. Component Tree

```
PayoutCosmoPage.vue  (/payouts-cosmo, section: misc)
├── DashboardSharedTwoColLayout
├── TwoPieceButton (withdraw, add bank)
├── DashboardPrimaryButton (manage card, verification)
├── PayoutCdnIcon (assetMap mask or img)
├── img personMark / cardChip (assetMap CDN SVGs)
├── PayoutStatCard × 4
├── PayoutQuickAction (button)
│   ├── PayoutIconTile → PayoutCdnIcon
│   └── PayoutActionText
├── usePayoutCosmoTable
├── MyMediaTabs + FlexTable (payout table theme)
└── PayoutCosmoFlowPopup
    ├── usePayoutAssets (close, back, upload cloud, popup gradient)
    ├── ThumbnailUploader + #icon → PayoutCdnIcon (uploadCloud)
    └── src/services/payout/payoutCosmoFlows + payoutCosmoPayloads
```

---

## 4. What already matches

- Page file ends in `Page.vue`. Component files are `PascalCase.vue`. Flow and payload modules are camelCase under `services/payout/`. Folder `cosmo` is kebab-case.
- Imports use the `@/` alias.
- `MOCK_API_MS` is `UPPER_SNAKE_CASE`. `isFirst`, `isLast`, `flowOpen` read as booleans.
- No `ibb.co` URLs, no component `<style>` block, no `!important`, no element `id` used for styling or selectors.
- Layout is flex for rows and columns of actions. `grid` is only used for the stat cards, the two-column actions/banks block, and the two-column form.
- Hero actions use `TwoPieceButton` and `DashboardPrimaryButton`. The activity table uses the existing payout `FlexTable` theme. Activity tabs use `MyMediaTabs`. Document upload uses `ThumbnailUploader` with a CDN upload icon.
- Popup progress width and background image are the only `:style` bindings, and both are dynamic values.
- Template props use kebab-case (`value-class`, `accent-class`, `bg-class`, `icon-src`).

---

## 5. Findings

### 5.1 i18n — Pass

Page and popup copy goes through `t('payoutCosmo.*')`. English and Vietnamese strings are in `public/i18n/section-misc/{en,vi}.json`. English values match the previous on-screen copy, including curly apostrophes and card-number spacing.

Also covered: `payoutCosmo.alt.*` (avatar, close, back, upload), `payoutCosmo.page.ariaCurrency` / `ariaNotifications` / `ariaProfile`, and `payoutCosmo.popup.close`.

Step titles are translated from the step view. Select values, bank ids, and the session object are unchanged. Mock field values stay in `payoutCosmoPayloads.js`.

### 5.2 Assets — Pass

Every image/icon on the page and popup is an `assetMap` file under `/dev/cdn`. `CosmoIcon.vue` is removed. Masked icons use `PayoutCdnIcon`. Header avatar is `<img>` of `payout.icon.avatar`. Document upload uses `payout.icon.uploadCloud` through the `ThumbnailUploader` `#icon` slot.

| Former `CosmoIcon` / need | Flag |
|---------------------------|------|
| `bell` | `payout.icon.bell` |
| `user-round` | `payout.icon.avatar` |
| `landmark` | `payout.icon.bank` |
| `circle-plus`, `plus` | `payout.icon.plus` |
| `credit-card` | `payout.icon.addCard` |
| `badge-check` | `payout.icon.checkCircle` |
| `check` | `payout.icon.tickMark` |
| `calendar-clock` | `payout.icon.calendarClock` |
| `life-buoy` | `payout.icon.lifeBuoy` |
| `wallet-cards` | `payout.icon.walletCards` |
| `chevron-right` | `payout.icon.chevronRight` |
| `arrow-right` | `payout.icon.arrowRight` |
| upload cloud (was inline SVG in shared uploader) | `payout.icon.uploadCloud` |

Close, back, popup wash, and activity status icons were already CDN files. Flags are in development, staging, and production, and on the `/payouts-cosmo` `assetPreload` list.

**Decorative CSS (not images):** the wallet person mark and gold chip stay as CSS (`before` / `after` and a gradient box). Swapping them for `payout.card.logo` / `payout.card.userAvatar` would re-skin the Cosmo card. They are not hotlinked images and do not break the assetMap image rule.

### 5.3 Demo data and layering — Pass

Table rows, columns, and activity tabs are in `usePayoutCosmoTable`. Flows and payloads live in `src/services/payout/`. `buildCosmoRequests()` is the mock request-shape helper (exported for the Cosmo API contract; not called by the UI yet). `PayoutTableTab.vue` was unused and is deleted.

### 5.4 Method names — Pass

`openFlow`, `formatMoney`, `createCosmoSession`, `clearApiTimer`, `presentStep`, `goBack`, `goNext`, `onDocumentSelected`, `closePopup`, `handlePopupToggle`, and `buildCosmoRequests` all start with a clear verb. The step flag is `requiresApi`.

### 5.5 Tailwind tokens and arbitrary values — Pass (Linden bar)

Shared chrome colours that already existed as theme tokens were swapped only when the hex matched exactly (for example `#667085` → `light-text-quaternary`, `#D0D5DD` → `checkboxBorder`, `#07F468` → `success`, `#F9FAFB` → `primary-bg`). Spacing aliases used only when the Tailwind scale matched (`p-[20px]` → `p-5`, `gap-[12px]` → `gap-3`, `gap-[14px]` → `gap-3.5`, `font-[500]` / `font-[600]` → `font-medium` / `font-semibold`).

Cosmo brand hex and layout arbitrary values (`#ff0064`, `#00ed75`, wallet burgundy, quick-action fills, `text-[13px]`, `rounded-[26px]`, `min-h-[46px]`, `min-[681px]`, and Cosmo-only dark ink `#bdb8af` which is not the theme `#bdb7af`) stay on purpose so pixels do not change. Cleared `PayoutPage` keeps the same kind of table hex.

### 5.6 Data attributes and selectors — Pass

`data-component="payout-cosmo-page"` on the page root. Stat cards and quick actions carry `data-component`. Flow triggers use `data-action`. Header currency, bell, and profile use `data-element` only. Popup root uses `data-component` + `data-state`. Close / Done / Next / Back and loading are tagged. Clicks stay on `@click`. No `document.querySelector` in this set.

### 5.7 Accessibility — Pass

`PayoutQuickAction` is `<button type="button">` with a keyboard-only focus ring. Popup fields share `fieldControlClass` (transparent outline at rest). Header currency, notifications, and profile have `aria-label`. Close and Back are buttons with labels and translated `alt` on their images.

### 5.8 Inputs — Note, not a behaviour change

KYC and bank steps use native `<input>` and `<select>` with the dashboard underline classes. Proof uploads use `ThumbnailUploader`. Whether other fields must be `BaseInput` remains an open Linden product question. This audit does not swap them.

### 5.9 Product notes (out of the naming bar)

- Card activity is still a tab. Removal is a product decision.
- Header currency, bell, and profile buttons do not navigate.
- Manage card and Payout support do not open a flow.
- Failure branches in the popup are static notes.

### 5.10 Hardcoded copy — moved to `payoutCosmo.*`

User-facing copy is in `section-misc` en and vi. Mock session values stay in `payoutCosmoPayloads.js`.

### 5.11 Naming, file by file

| File | Verdict | Notes |
|------|---------|-------|
| `PayoutCosmoPage.vue` | Pass | `Page.vue`, PascalCase. Kebab-case props in template. |
| `PayoutCosmoFlowPopup.vue` | Pass | PascalCase popup. Back is a button. |
| `PayoutStatCard.vue` | Pass | |
| `PayoutQuickAction.vue` | Pass | Root is `<button type="button">`. |
| `PayoutIconTile.vue` | Pass | |
| `PayoutActionText.vue` | Pass | |
| `PayoutCdnIcon.vue` | Pass | |
| `usePayoutCosmoTable.js` | Pass | |
| `src/services/payout/payoutCosmoFlows.js` | Pass | Step flag `requiresApi`. |
| `src/services/payout/payoutCosmoPayloads.js` | Pass | `buildCosmoRequests`, `formatMoney`, `createCosmoSession`. |
| `PayoutCosmoPageDemo.vue` | Pass | |
| `src/dev/components/payout/cosmo/` | Pass | kebab-case folder. |

### 5.12 What this pass did not find

- No `ibb.co` URL.
- No `<img src="/images/...">` or any `<img>` whose flag is outside `/dev/cdn`.
- No `<style>` block and no `!important`.
- No element `id` used as a style or script hook.
- No `document.querySelector` in these files.
- No empty decorative `alt=""` on Cosmo control images (wallet marks use `alt=""` + `aria-hidden="true"` as pure decoration).

---

## 6. Checklist

| # | Area | Result |
|---:|---|---|
| 1 | Tailwind utilities, no page CSS file | Pass |
| 2 | No undocumented arbitrary values | Pass — Cosmo layout arbitrary values kept on purpose; scale-identical aliases applied |
| 3 | Repeated class strings extracted | Pass — `fieldControlClass`, `summaryPanelClass`, `summaryPanelInkClass` |
| 4 | Flex for 1D, grid for cards | Pass |
| 5 | `gap` instead of sibling `ml`/`mr` | Pass |
| 6 | Linden `data-*` | Pass |
| 7 | No IDs for style or JS | Pass |
| 8 | No static inline style / `<style>` | Pass — only dynamic `:style` |
| 9 | No hardcoded hex for shared chrome | Pass — Cosmo brand hex only in `cosmo.*` theme tokens; Vue SFCs use utilities |
| 10 | Compile-safe class strings | Pass |
| 11 | Semantic buttons | Pass |
| 12 | `focus-visible` where outline is removed | Pass |
| 13 | `t()` / section catalogues | Pass |
| 14 | Every image from assetMap `/dev/cdn` | Pass — includes personMark / cardChip / uploadCloud |
| 15 | Page named `*Page.vue` | Pass |
| 16 | Demo showcase | Pass |

---

## 7. Remediation

Each item kept the current screen and the current click paths.

1. Done. `payoutCosmo.*` in section-misc en and vi; page and popup use `t()`.
2. Done. `CosmoIcon` removed. CDN flags for all icons, including `uploadCloud` for the document dropzone.
3. Done. `data-component` / `data-action` / `data-element` / `data-state` on page, quick actions, and popup.
4. Done. `PayoutQuickAction` is `<button type="button">` with keyboard focus ring.
5. Done. Table rows in `usePayoutCosmoTable`; flows/payloads in `src/services/payout/`; `requiresApi` / `buildCosmoRequests` / `closePopup` / `handlePopupToggle`.
6. Done. Unused `PayoutTableTab.vue` deleted.
7. Done. A11y labels and alts; Back as a button; kebab-case `value-class`; CDN upload icon in `#icon` slot; pixel-safe token and spacing aliases.
8. Done. Demo `ShowCodeToggle` + `demo.payoutCosmo.*`; `dataAttrs` / `addAttributes` on shared hero buttons; leaf `data-component` on icon/action/cdn; saved-bank chooser `data-action` / `data-state`; keyboard `focus-visible` on page chrome and popup controls; status/amount shared tokens; empty-class / bg-class noise removed.
9. Done. Cosmo brand palette moved to `cosmo.*` in `tailwind.config.js` (exact hex); Vue SFCs use `cosmo-*` utilities (zero `#` left in Cosmo Vue files). Wallet person mark and gold chip are CDN SVGs via `payout.cosmo.personMark` / `payout.cosmo.cardChip` (assetMap + route preload). Native popup inputs/selects wrapped by `<label>` for click-to-focus.

---

## 8. Clearance

**PASS — fully cleared** for Linden review, on the same bar as `docs/tasks/PAYOUT_PAGE_AUDIT.md`.

Still product / design exceptions only (not audit blockers): off-scale layout arbitrary values kept for pixel parity, native inputs until Linden decides on `BaseInput`, and product stubs (header controls do not navigate; manage-card / support have no flow; card-activity tab stays; failure notes stay static).
