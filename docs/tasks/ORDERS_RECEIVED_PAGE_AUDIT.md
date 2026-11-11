# Dashboard Orders Received Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** `/dashboard/orders/order-received`  
**Report date:** July 14, 2026  
**Prepared for:** Linden architecture review  
**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention.txt`
- `docs/DEMO_PAGE_COMPONENT_AUDIT_REPORT.md` (format reference)

---

## 1. Executive Summary

The **Orders Received** page and its related UI stack were audited against Linden’s architecture and naming guidelines. All **user-facing strings** were moved to i18n (`dashboard.orders.*`), all **image/icon URLs** were moved to `assetMap.json` + `useOrdersAssets` / `useAssetUrl`. Tab/type/status values are kept inline in consumers (no dedicated `ordersConstants.js`).

Production build verification: **`npm run build` — PASS**

**Component count audited:** **7 files** (page + table + search + popup + store + mapper + composable)

---

## 2. Audit Scope

### In scope

| Layer | Files |
|-------|-------|
| **Page template** | `src/dev/templates/dashboard/orders/DashboardOrdersReceivedPage.vue` |
| **Table** | `src/dev/components/ui/table/dashboard/OrdersReceivedTable.vue` |
| **Search** | `src/dev/components/ui/table/dashboard/OrdersTableSearchInput.vue` |
| **Popup** | `src/dev/components/ui/popups/orders/OrderDetailsPopup.vue` |
| **Shared table** | `src/dev/components/ui/table/FlexTable.vue` (consumer only — no changes required) |
| **Store** | `src/stores/useOrdersStore.js` |
| **Flow** | `src/services/orders/flows/fetchOrdersFlow.js` |
| **Mapper** | `src/services/orders/mappers/ordersMapper.js` |
| **Composable** | `src/dev/composables/useOrdersAssets.js` |
| **i18n** | `public/i18n/section-dashboard-global/en.json`, `vi.json` |
| **Assets** | `src/config/assetMap.json` → synced to `public/config/assetMap.json` |

### Out of scope (unchanged)

- `src/services/orders/mockOrdersBackend.js` — dev-only mock; no user-facing UI
- `src/dev/components/ui/table/dashboard/OrdersPremiumTable.vue` — demo page; only search i18n props updated for backward compatibility
- Analytics popup spinner work (separate track)

---

## 3. Audit Criteria Applied

| Criterion | Requirement | Before | After |
|-----------|-------------|--------|-------|
| **i18n** | No hardcoded user-facing English in templates | ❌ 50+ hardcoded strings | ✅ `dashboard.orders.*` (en + vi) |
| **assetMap** | No `i.ibb.co` / external URLs in components | ❌ 25+ external URLs | ✅ `useOrdersAssets` + `/dev/cdn/...` |
| **Constants** | Dedicated config file not required | ❌ Mixed | ✅ Inline in consumers + asset flags in composable |
| **Naming — page** | `*Page.vue` for route templates | ✅ Already correct | ✅ |
| **Naming — store** | `useNameStore.js` | ✅ `useOrdersStore.js` | ✅ |
| **Naming — flow** | `verbObjectFlow.js` + `domain.action` key | ✅ `fetchOrdersFlow.js` + `orders.fetchOrders` | ✅ |
| **Naming — mapper** | `ordersMapper.js` with `mapOrdersFromResponse` | ✅ | ✅ Improved with constants |
| **Layering** | Business logic in services, not components | ✅ FlowHandler in table | ✅ |
| **Composable** | `use*` prefix for Vue hooks | ❌ Inline asset URLs | ✅ `useOrdersAssets.js` |

---

## 4. Findings — Before Audit

### 4.1 i18n violations (fixed)

| Location | Hardcoded examples |
|----------|-------------------|
| `DashboardOrdersReceivedPage.vue` | `"Orders Received"`, `"In Progress"`, `"Order Type"`, `"All Types"` |
| `OrdersReceivedTable.vue` | Column headers, empty state, status label `"New"` |
| `OrdersTableSearchInput.vue` | Used `demo.premiumOrders.*` (wrong namespace for production page) |
| `OrderDetailsPopup.vue` | All section titles, buttons, labels, notifications, mock copy |

### 4.2 Asset violations (fixed)

| Location | Issue |
|----------|-------|
| `OrdersReceivedTable.vue` | `https://i.ibb.co.com/cSnyRK5k/stars.webp`, `location.webp` |
| `OrderDetailsPopup.vue` | 25× `https://i.ibb.co.com/...` image URLs |
| `ordersMapper.js` | `https://i.pravatar.cc/...`, `/images/merchIcon.png`, `/images/cartIcon.png` |

### 4.3 Constants

No dedicated `src/config/ordersConstants.js`. Values live inline where used; asset flags live in `useOrdersAssets.js`.

### 4.4 Architecture compliance (already correct)

| Item | Status |
|------|--------|
| Page in `templates/dashboard/orders/` | ✅ |
| Components in `dev/components/ui/` | ✅ |
| Store in `stores/useOrdersStore.js` | ✅ |
| Flow in `services/orders/flows/fetchOrdersFlow.js` | ✅ |
| Mapper in `services/orders/mappers/ordersMapper.js` | ✅ |
| Route: `DashboardOrdersReceivedPage.vue` | ✅ PascalCase + Page suffix |

---

## 5. Remediation Summary

### 5.1 New files

```
src/dev/composables/useOrdersAssets.js — Resolves all orders UI assets from assetMap
docs/tasks/ORDERS_RECEIVED_PAGE_AUDIT.md — This report
```

### 5.2 i18n namespace: `dashboard.orders`

Added under `dashboard.orders` in **en.json** and **vi.json**:

- Page: `title`, `searchPlaceholder`, `searchAlt`, `dropdownAlt`, `orderTypeLabel`
- Tabs: `tabs.inProgress`, `tabs.completed`, `tabs.canceled`, `tabs.all`
- Order types: `orderTypes.all`, `orderTypes.p2v`, etc.
- Table: `columns.*`, `status.new`, `empty.*`, `guestUser`
- Popup: `popup.pendingShipping.*`, `popup.tracking.*`, `popup.details.*`, `popup.pricing.*`, `popup.couriers.*`, `popup.cancelUpload.*`, `popup.notification.*`, `popup.mock.*`

`@` symbols escaped as `{'@'}` per project i18n rules.

### 5.3 Asset map entries (`/dev/cdn/...`)

| Flag | Path |
|------|------|
| `orders.icon.stars` | `/dev/cdn/remote/74a7ed7358-star-06.webp` |
| `orders.icon.location` | `/dev/cdn/images/send-03.webp` |
| `orders.icon.merch` | `/dev/cdn/images/cart-1.webp` |
| `orders.icon.enterInput` | `/dev/cdn/images/edit-05-pink.webp` |
| `orders.icon.users` | `/dev/cdn/images/profile.webp` |
| `orders.icon.locationPin` | `/dev/cdn/images/arrow-up-right.webp` |
| `orders.icon.filesGreen` | `/dev/cdn/images/message-text-square-02.webp` |
| `orders.icon.editPen` | `/dev/cdn/remote/a22eeea0c5-svgviewer-png-output-49.webp` |
| `orders.icon.logoGreen` | `/dev/cdn/images/verified-green.webp` |
| `orders.icon.tagGreen` | `/dev/cdn/remote/e5a80d937d-tag.webp` |
| `orders.icon.subscription` | `/dev/cdn/remote/9f876d16f5-media.webp` |
| `orders.icon.p2v` | `/dev/cdn/remote/f03e3e829e-video-icon.webp` |

**Reused existing flags:** `icon.search`, `icon.orders.dropdown`, `icon.media.upload`, `icon.notification.close`, `checkout.demo.trashIcon`, `orders.demo.avatar`

> **Note:** Order-specific icons currently map to the closest existing `/dev/cdn` assets. When final design assets from the legacy `i.ibb.co` set are migrated, update only `assetMap.json` — components stay unchanged.

### 5.4 Component changes

| File | Changes |
|------|---------|
| `DashboardOrdersReceivedPage.vue` | `useI18n`, `useOrdersAssets`, `labelKey` tabs, computed order types |
| `OrdersReceivedTable.vue` | `useI18n`, `useOrdersAssets`, computed columns/statusConfig, translated empty state |
| `OrdersTableSearchInput.vue` | Default i18n keys → `dashboard.orders.*`; optional props for demo override |
| `OrderDetailsPopup.vue` | Full i18n + `useOrdersAssets`; zero hardcoded URLs |
| `ordersMapper.js` | Status/type mapping, `iconAssetFlag`, guest user label key |
| `useOrdersStore.js` | Persist key inline (`dash_orders_store`) |

---

## 6. Remaining Known Items (documented, not blockers)

| Item | Severity | Notes |
|------|----------|-------|
| Mock pricing amounts in popup (`USD$ 123.45`) | Low | Numeric mock data from API placeholder; not user-facing labels |
| Popup mock content (`dashboard.orders.popup.mock.*`) | Low | Intentional placeholder until real order-detail API |
| Tab counts removed from page | Info | Fake counts (`60`, `40`) removed; wire from API `meta` when available |
| Order-specific ibb.co assets not yet in `/dev/cdn/remote/` | Medium | assetMap uses nearest existing assets; swap paths when assets land |
| `fetchOrdersFlow.js` error messages | Low | English strings in flow layer (same pattern as other flows); can move to i18n later |

---

## 7. Verification Checklist

```text
✅ No i.ibb.co URLs in orders page stack
✅ No hardcoded user-facing English in page/table/popup templates
✅ assetMap synced: src/config → public/config
✅ i18n keys present in en.json + vi.json
✅ No dedicated ordersConstants.js (values inline / in useOrdersAssets)
✅ Store uses useOrdersStore naming + persist key
✅ Flow key orders.fetchOrders used from table
✅ npm run build — PASS
```

### Manual test plan

1. Open `http://localhost:5174/dashboard/orders/order-received`
2. Verify page title, tabs, search placeholder, order-type dropdown — all translated
3. Switch locale to Vietnamese — all labels update
4. Tab filter + search + order-type filter — data filters correctly
5. Row click — popup opens with spinner, then content
6. Add tracking flow — tabs, courier dropdown, upload, notification toast
7. Clear `dash_orders_store` from localStorage if stale filter data appears

---

## 8. File Inventory (final state)

| # | Component / Module | Path | Status |
|---|-------------------|------|--------|
| 1 | DashboardOrdersReceivedPage | `src/dev/templates/dashboard/orders/DashboardOrdersReceivedPage.vue` | ✅ Finalized |
| 2 | OrdersReceivedTable | `src/dev/components/ui/table/dashboard/OrdersReceivedTable.vue` | ✅ Finalized |
| 3 | OrdersTableSearchInput | `src/dev/components/ui/table/dashboard/OrdersTableSearchInput.vue` | ✅ Finalized |
| 4 | OrderDetailsPopup | `src/dev/components/ui/popups/orders/OrderDetailsPopup.vue` | ✅ Finalized |
| 5 | useOrdersStore | `src/stores/useOrdersStore.js` | ✅ Finalized |
| 6 | fetchOrdersFlow | `src/services/orders/flows/fetchOrdersFlow.js` | ✅ Compliant (no UI) |
| 7 | ordersMapper | `src/services/orders/mappers/ordersMapper.js` | ✅ Finalized |
| 8 | useOrdersAssets | `src/dev/composables/useOrdersAssets.js` | ✅ Finalized |

---

## 9. Comparison with Plan Page Pattern

The Plan page (`src/dev/templates/plan/Plan.vue`) uses:
- `useAssetUrl('plan.icon.backgroundUpload')` for images ✅ — Orders now uses `useOrdersAssets` (same pattern, batched)
- Hardcoded tier text in Plan state engine defaults ⚠️ — Plan page itself still has hardcoded demo strings (separate audit track)
- Components in `dev/components/plan/` ✅ — Orders follows `dev/components/ui/table/dashboard/` + `dev/components/ui/popups/orders/`

**Orders Received page is now ahead of Plan page** on i18n/assetMap compliance for its user-facing surface.

---

## 10. Sign-off

| Area | Result |
|------|--------|
| Architecture layering | ✅ Pass |
| Naming conventions | ✅ Pass |
| i18n (en + vi) | ✅ Pass |
| assetMap + /dev/cdn | ✅ Pass |
| Constants extraction | ✅ Pass |
| Build | ✅ Pass |

**Audit status: COMPLETE** — ready for Linden review.
