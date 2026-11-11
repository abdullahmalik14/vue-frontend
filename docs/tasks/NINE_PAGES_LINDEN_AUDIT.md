# Eight Pages — Linden Architecture Audit (Rollup)

**Project:** vue-frontend  
**Report date:** August 10, 2026 (updated after remediation pass)  
**UI policy:** No visual redesign — architecture, demos, typography components, validation wiring only

**Guidelines:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention (1).txt`

---

## 1. Scope (8 unique URLs)

| # | URL | Page file |
|---|-----|-----------|
| 1 | `/edit-profile` | `src/dev/templates/edit-profile/EditProfilePage.vue` |
| 2 | `/` | `src/dev/templates/home/HomePage.vue` |
| 3 | `/mediaUploader` | `src/dev/templates/media/MediaUploaderPage.vue` |
| 4 | `/subscription/plan` | `src/dev/templates/plan/PlanPage.vue` |
| 5 | `/profile` | `src/dev/templates/profile/ProfileWrapper.vue` |
| 6 | `/settings` | `src/dev/templates/settings/SettingsPage.vue` |
| 7 | `/dashboard/orders/order-received` | `src/dev/templates/dashboard/orders/DashboardOrdersReceivedPage.vue` |
| 8 | `/payout` | `src/dev/templates/payout/PayoutPage.vue` |

**Shared note:** All eight remain under `src/dev/` (location lift deferred). Reusable UI mixed `src/components/` + `src/dev/components/`.

---

## 2. Matrix (post-remediation)

| Page | Arch | Validation | Typography | Demo |
|------|------|------------|------------|------|
| Edit Profile | PARTIAL | NONE (no field errors by design) | Base* on page headings; 2 mixed-content `<p>` kept | Rebuild ✅ |
| Home | PARTIAL | NONE | Base* on home tree; nested-content tags skipped | Rebuild ✅ |
| Media Uploader | PARTIAL | **ENGINE** (P2V prices) | Base* on steps/parts | Rebuild ✅ |
| Plan | PARTIAL | **ENGINE** (PlanDetail 1–99 range) | Base* on plan steps/parts | Rebuild ✅ |
| Profile | FAIL (ibb/CDN/naming) | Popup CUSTOM remains (tip/purchase) | Base* on page surface; mixed-content skips | Rebuild ✅ |
| Settings | PASS* | NONE | Already Base* | Rebuild ✅ |
| Orders Received | PASS* | NONE | Heading page title | Rebuild ✅ |
| Payout | PASS* | **ENGINE** (WithdrawEarningsStep3) | Base* on page + cards | Rebuild ✅ |

\*PASS\* = prior i18n/CDN/`*Page.vue` clearance; `src/dev/` lift remains.

---

## 3. Validation detail

**Source of truth:** `src/utils/validation/interactionsEngine.js`

| Location | Status | Notes |
|----------|--------|-------|
| `PlanDetail.vue` | ENGINE | Scope `planDetail`; minNum/maxNum 1–99; empty optional gated |
| `MediaUploaderStepSubscriptionP2v.vue` | ENGINE | Scope `mediaUploaderSubscriptionP2v`; maxNum 500 + custom cross-field |
| `WithdrawEarningsStep3.vue` | ENGINE | Scope `payoutWithdrawStep3`; validateScope → existing boolean UI |
| `AddTierPopup` / plan discount popups / tip-purchase popups | CUSTOM (deferred) | Popup-only; not demo’d |
| Edit Profile / Home / Settings / Orders | NONE | No field validation errors on page surface |

---

## 4. Demo catalog (`/dashboard/demo-page`)

Only these 8 sections were rebuilt. Other DemoPage sections untouched.

| Page | Demo file | Style |
|------|-----------|-------|
| Edit Profile | `EditProfileComponentsDemo.vue` | Line-by-line components, no popups, full Show Code |
| Home | `HomePageDemo.vue` | Leaf home components, no badges/notes |
| Media | `MediaUploaderComponentsDemo.vue` | Parts + shared controls; no AddTierPopup / Nay |
| Plan | `PlanPageDemo.vue` | Leaf controls + PlanPublishSetting; no popups |
| Profile | `ProfileSectionComponentsDemo.vue` | Profile surface components; clicks noop |
| Settings | `SettingsComponentsDemo.vue` | Page controls; heading-only chrome |
| Orders | `OrdersReceivedPageDemo.vue` | Tabs/search/dropdown/table; no popup |
| Payout | `PayoutPageDemo.vue` | Cards/table chrome; no popups |

Chrome rule: `DemoSectionHeader` only + production UI + full Show Code per block.

---

## 5. Typography

Replaced raw `<h*>` / `<p>` with `Heading` / `Paragraph` using `theme="custom"` + `no-wrap` + exact `add-class` strings.

**Skipped (mixed content / nested nodes — Base* text-only model):**
- Some EditProfile / ProfileDescription `<p>` with nested `<span>`
- ProfileMetaResponsive `<h1>` with nested verified icon
- ThumbnailUploader mixed markup
- Popup-only tip steps (unless converted separately)

---

## 6. Remaining architecture gaps (not in this pass)

| Gap | Pages |
|-----|-------|
| Profile rename `ProfileWrapper` → `ProfilePage` + CDN/i18n cleanup | Profile |
| Lift `src/dev` → `src` | All eight |
| Popup CUSTOM → ENGINE (optional) | AddTier, plan discounts, tip/purchase |
| Route slug kebab `/media-uploader` | Media |

---

## 7. How to re-verify

1. Live URLs in §1 — confirm UI unchanged  
2. Demo `/dashboard/demo-page` — eight sections only  
3. Trigger PlanDetail range errors, MediaUploader P2V price errors, Payout withdraw step3 empty submit — same messages/layout, engine-backed  
4. Grep scopes: `planDetail`, `mediaUploaderSubscriptionP2v`, `payoutWithdrawStep3`
