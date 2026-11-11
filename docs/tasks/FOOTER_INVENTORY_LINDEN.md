# Footer Inventory

Summary of all page/layout footers in the Vue frontend — for naming and integration review before we standardize them.

---

## Overview

| Surface | Component (current name) | File | Mounted in | Status |
|--------|---------------------------|------|------------|--------|
| Home | `HomeFooter` | `src/dev/components/home/homeComponents/HomeFooter.vue` | `HomePage.vue` | Real (only production-shaped footer) |
| Auth | `AuthFooter` | `src/templates/auth/AuthFooter.vue` | `AuthLayout.vue` (default `#footer` slot) | Empty stub |
| Dashboard | `DashboardSharedFooter` | `src/dev/templates/dashboard/shared/DashboardSharedFooter.vue` | `DashboardLayout.vue` | Stub (“Dashboard Footer” text) |
| App / global | `AppFooter` | `src/components/layout/AppFooter.vue` | `App.vue` (**commented out**) | Scaffold / unused |
| Checkout | — | — | — | **No dedicated page footer** |

---

## 1. HomeFooter

**Path:** `src/dev/components/home/homeComponents/HomeFooter.vue`  
**Used by:** `src/dev/templates/home/HomePage.vue`

### Status
Only real, designed footer in the project.

### UI blocks
- Support email (mailto) + Help link (icon + text)
- Social icons: Discord, X, Instagram
- Legal links: DMCA, anti-exploitation, terms, privacy, report
- Payment marks: Visa, Mastercard
- Copyright line

### Components / dependencies
| Kind | Detail |
|------|--------|
| Typography | `Paragraph` (`theme="custom"` + `add-class`) for email + help |
| Links / icons | Raw `<a>` + `<img>` for social + payment |
| Legal / copyright | Raw `<a>` / `<span>` (not Paragraph) |
| Assets | `getAssetUrls`: `home.footer.mail`, `help`, `discord`, `x`, `instagram`, `visa`, `mastercard` |
| i18n | `home.footer.*` (supportEmail, help, dmca, antiExploitation, terms, privacy, report, copyright, alts) |

### Notes
- Dark translucent bar (`bg-[#1D2334]/90` + backdrop blur)
- Mix of `Paragraph` and hardcoded text classes — candidate for cleanup when `Paragraph` → `Paragraph`

---

## 2. AuthFooter

**Path:** `src/templates/auth/AuthFooter.vue`  
**Used by:** `src/templates/auth/AuthLayout.vue` (default content of `#footer` slot)

### Status
Empty stub — renders an empty `.auth-footer` div.

### Components / dependencies
None.

### Notes
- Layout already reserves a footer slot; UI not built yet
- Good place to reuse home legal/copyright patterns once named

---

## 3. DashboardSharedFooter

**Path:** `src/dev/templates/dashboard/shared/DashboardSharedFooter.vue`  
**Used by:** `src/dev/templates/dashboard/shared/DashboardLayout.vue`

### Status
Stub only — hardcoded “Dashboard Footer” text, no design.

### Components / dependencies
None.

### Notes
- Naming includes `Shared` (layout family), unlike `HomeFooter` / `AuthFooter`
- Not product-ready

---

## 4. AppFooter

**Path:** `src/components/layout/AppFooter.vue`  
**Used by:** Imported in `src/app/App.vue` but **commented out** (`<!-- <AppFooter v-if="shouldShowLayout" /> -->`)

### Status
Scaffold / unused in live shell.

### UI blocks
- Optional site nav from `routeConfig.json` (gated by `VITE_ENABLE_FOOTER_NAVIGATION`)
- Copyright year + generic “Vue App” copy
- Debug-style status line (“Footer Component - Route Navigation Enabled/Disabled”)

### Components / dependencies
| Kind | Detail |
|------|--------|
| Router | `vue-router`, route prefetch |
| Auth | `useAuthStore` (role / auth filtering of links) |
| Config | `routeConfig.json` via JSON config loader + validator |
| Design system | **None** — no Paragraph / Button; hardcoded English strings (no `t()`) |

### Notes
- Behaves like a global app shell footer, not a Fansocial product footer
- Decide: keep as shell utility, redesign to match product, or remove

---

## 5. Checkout

**No page-level footer component.**

Checkout only has **card-level** footer copy (e.g. `SubscriptionPlanCard` `footerText` / `footerColor`) — not a layout footer.

---

## Naming (for review)

Current names mix product surfaces and layout roles:

| Current | Role |
|---------|------|
| `HomeFooter` | Product home |
| `AuthFooter` | Auth layout stub |
| `DashboardSharedFooter` | Dash layout stub |
| `AppFooter` | Global shell (disabled) |

### Possible directions
1. **Surface-prefixed:** `FooterHome`, `FooterAuth`, `FooterDashboard`, `FooterApp`
2. **Single component + theme:** `Footer` with `theme="home" | "auth" | "dashboard"`
3. Drop `Shared` / clarify `App` once stubs become real

### Shared building blocks (optional later)
If auth/dash reuse home patterns:
- `FooterLegalLinks`
- `FooterSocialIcons`
- `FooterPaymentMarks`

Also: HomeFooter is a call site for `Paragraph` — rename to `Paragraph` will touch this file.

---

## Bottom line

| Surface | Ready to integrate as product footer? |
|---------|----------------------------------------|
| Home | **Yes** — only real footer |
| Auth | Slot exists; UI empty |
| Dashboard | Stub only |
| App / global | Built but disabled |
| Checkout | No page footer |

---

*Generated for naming / integration review. Update this doc when footers are renamed or stubs filled.*
