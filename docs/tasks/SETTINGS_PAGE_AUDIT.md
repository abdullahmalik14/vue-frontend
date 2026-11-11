# Settings Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** `/settings` (component: `src/dev/templates/settings/SettingsPage.vue`)  
**Report date:** July 19, 2026  
**Audit status:** ✅ **PASS — remediated**  
**Prepared for:** Linden architecture review  

**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention (1).txt`
- `docs/tasks/PLAN_PAGE_AUDIT.md` (format + pattern reference)

---

## 1. Executive Summary

The Settings page and related components were audited and remediated against project architecture, naming, i18n, and assetMap conventions (Plan-page pattern).

| Criterion | Result |
|-----------|--------|
| **i18n** | ✅ PASS — `useI18n` / `t('settings.page.*')` (+ `profileSettings.*` menu) in en/vi (`section-misc` + `section-dashboard-global`) |
| **assetMap → `/dev/cdn`** | ✅ PASS — `useSettingsAssets` / `settings.icon.*` + shared dashboard/plan flags; no `ibb.co` on SettingsPage |
| **Sidebar route** | ✅ PASS — `dashboard.menu.settings` → `/settings` |
| **Naming — page** | ✅ PASS — `SettingsPage.vue` + kebab-case folders |
| **Menu config naming** | ✅ PASS — `settingsMenuConfig.js` (renamed from vague `settingConfig.js`) |
| **UI change** | ✅ N/A — no visual redesign |

**Verdict:** Cleared for architecture/demo review.

---

## 2. Audit Scope

### In scope

| Layer | Files |
|-------|-------|
| **Page** | `src/dev/templates/settings/SettingsPage.vue` |
| **Nav / profile rail** | `src/dev/components/ui/nav/dashboard/DashProfileSettings.vue` |
| **Parts** | `src/dev/components/settings/SettingsProfileAvatar.vue` |
| **Config** | `src/dev/assets/data/settingsMenuConfig.js` |
| **Composable** | `src/dev/composables/useSettingsAssets.js` |
| **Route / nav** | `src/router/routeConfig.json`, `src/config/dashboard-sidebar-menu-items.js` |
| **i18n** | `public/i18n/section-misc/{en,vi}.json`, `public/i18n/section-dashboard-global/{en,vi}.json` |
| **assetMap** | `public/config/assetMap.json` (+ new CDN remote icons) |

### Out of scope

- Relocating `DashProfileSettings` out of `ui/nav/dashboard/` (works; optional follow-up)
- Legacy `src/assets/data/settingConfig.js` (unused by current Settings stack)
- Log-out device buttons → `DashboardPrimaryButton` (separate UI task)
- Full Vue Router tab routes (tabs still use DOM `data-tab` / `tabId`)

---

## 3. Component Tree

```
SettingsPage.vue
├── DashProfileSettings
│   ├── SettingsProfileAvatar
│   └── DashboardPrimaryButton (Edit Profile)
├── Heading / Paragraph
├── DashboardPrimaryButton (BACK / CANCEL / SAVE)
├── DashboardSharedSectionLayout
├── DashboardTextInput
├── SettingsLanguageField
├── UnifiedSelect
└── TwoPieceButton
```

---

## 4. Remediation completed

### 4.1 i18n
- Added `settings.page.*` tree (actions, tabs, account, password, privacy, shipping, payout, options, alt) to **en + vi** in `section-misc` and `section-dashboard-global`
- Added missing `dashboard.menu.settings` menu label (en/vi)
- SettingsPage wired with `useI18n` / `t(...)`

### 4.2 assetMap → `/dev/cdn`
- Added `useSettingsAssets.js` (Plan-style warm + sync resolve)
- New flags: `settings.icon.arrowBack`, `settings.icon.devicePower`, `settings.icon.devicePhone`
- Reused: `plan.icon.mobileGradientBg`, `dashboard.bg.gradient`, `dashboard.language|notification|avatar|hamburger`, `icon.social.x.logo`, `orders.icon.stars`, `icon.star`
- CDN files under `public/dev/cdn/remote/` for arrow-back / power / phone
- SettingsPage backgrounds via CSS vars `--settings-mobile-bg` / `--settings-desktop-bg`

### 4.3 Sidebar routing
- `dashboard-sidebar-menu-items.js` Settings item `route`: `/dashboard/demo-page` → **`/settings`**

### 4.4 Naming
- `settingConfig.js` → `settingsMenuConfig.js` / `settingsMenuConfig` export
- `DashProfileSettings` import updated

---

## 5. Naming checklist (architecture docs)

| Rule | Status |
|------|--------|
| Folders kebab-case | ✅ `templates/settings/`, `components/settings/` |
| Page `*Page.vue` | ✅ `SettingsPage.vue` |
| JS modules camelCase | ✅ `settingsMenuConfig.js`, `useSettingsAssets.js` |
| Composable `use*` | ✅ `useSettingsAssets` |
| Events kebab-case | ✅ (existing locale-changed handlers) |
| No new vague utils/helpers | ✅ |

---

## 6. Follow-ups (optional)

1. Delete or archive unused `src/assets/data/settingConfig.js` (legacy English + ibb icons)
2. ~~Expand stub `profileSettings` in `section-misc`~~ — done (full tree synced; stub was overwriting menu keys and breaking locale)
3. Wire `settingsMenuConfig.route` to Vue Router if product wants URL-per-tab
4. Convert privacy Log-out buttons to `DashboardPrimaryButton`
5. `DashProfileSettings` `menuGroups` now depends on `locale` so labels recompute on language change

---

## 7. Manual smoke checklist

- [ ] Open `/settings` — sidebar + account tab load
- [ ] Dashboard sidebar **Settings** navigates to `/settings`
- [ ] Switch locale en ↔ vi — page strings update
- [ ] Images load from `/dev/cdn/...` (no ibb)
- [ ] BACK / CANCEL / SAVE + tab switching still work on mobile
