# Edit Profile Page — Architecture Audit Report

**Project:** vue-frontend  
**Route audited:** `/edit-profile` (component: `src/dev/templates/edit-profile/EditProfilePage.vue`)  
**Report date:** July 19, 2026  
**Audit status:** ✅ **PASS — remediated**  
**Prepared for:** Linden architecture review  

**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention (1).txt`
- `docs/tasks/SETTINGS_PAGE_AUDIT.md` (format + pattern reference)

---

## 1. Executive Summary

The Edit Profile page and related components were audited and remediated against project architecture, naming, i18n, and assetMap conventions (Settings/Plan-page pattern).

| Criterion | Result |
|-----------|--------|
| **i18n** | ✅ PASS — `useI18n` / `t('editProfile.page.*')` in en/vi (`section-misc` + `section-dashboard-global`) |
| **assetMap → `/dev/cdn`** | ✅ PASS — `useEditProfileAssets` / `editProfile.icon.*` + `editProfile.avatar.*` + shared flags; no `ibb.co` on page stack |
| **Sidebar route** | ✅ PASS — `dashboard.menu.editProfile` → `/edit-profile` |
| **Naming — page** | ✅ PASS — `EditProfilePage.vue` + kebab-case `edit-profile/` |
| **Demo** | ✅ PASS — `EditProfileComponentsDemo.vue` with Show Code (Settings pattern) |
| **UI change** | ✅ N/A — no visual redesign |

**Verdict:** Cleared for architecture/demo review.

---

## 2. Audit Scope

### In scope

| Layer | Files |
|-------|-------|
| **Page** | `src/dev/templates/edit-profile/EditProfilePage.vue` |
| **Menu** | `src/components/ui/profile/EditProfileMenu.vue` |
| **Popups** | `ImageCropperModal.vue`, `AvatarUploadPopup.vue`, `CancelUploadPopup.vue` |
| **Composable** | `src/dev/composables/useEditProfileAssets.js` |
| **Route / nav** | `src/config/dashboard-sidebar-menu-items.js` |
| **i18n** | `public/i18n/section-misc/{en,vi}.json`, `public/i18n/section-dashboard-global/{en,vi}.json` |
| **assetMap** | `public/config/assetMap.json` (+ CDN remote icons) |
| **Demo** | `EditProfileComponentsDemo.vue`, `DemoPage.vue` |

### Out of scope

- Relocating shared popups into `src/dev/components/edit-profile/` (optional)
- Full ThumbnailUploader / DropdownMenu tooltip i18n internals (parent-passed copy wired)
- Replacing inline mobile header chrome with `DashboardSharedHeader` (optional parity task)

---

## 3. Component Tree

```
EditProfilePage.vue
├── NotificationCard
├── EditProfileMenu
├── AvatarUploadPopup
├── ImageCropperModal
├── CancelUploadPopup
├── UploadingProgressBar
├── CustomDropdown (visibility, gender, country, body type, hair)
├── DashboardTextInput
├── TwoPieceButton
├── CheckboxSwitch
├── RadioGroup
├── ThumbnailUploader
└── DashboardSharedSectionLayout
```

---

## 4. Remediation completed

### 4.1 i18n
- Added `editProfile.page.*` tree (actions, fields, options, gallery, social, tipping, crop, avatarPopup, cancelDialog, alt) to **en + vi**
- Added `demo.editProfileComponents.*` for demo section
- Wired page + child components with `t(...)`
- Fixed bio field label (was incorrectly “Display Name”)

### 4.2 assetMap → `/dev/cdn`
- Added `useEditProfileAssets.js`
- New flags: `editProfile.icon.*`, `editProfile.avatar.preset1–5`
- Reused: `dashboard.language|notification|avatar|hamburger`, `plan.icon.chevronDown|verifiedTick|featuredMediaBg|playIcon`, `icon.notification.*`, `orders.icon.close`, `icon.avatar.upload|gallery`, etc.
- CDN files under `public/dev/cdn/remote/editProfile-*`

### 4.3 Sidebar routing
- Edit Profile submenu `route`: `/dashboard/demo-page` → **`/edit-profile`**

### 4.4 Child components
- `EditProfileMenu` — i18n + assets
- `ImageCropperModal` / `AvatarUploadPopup` — i18n + assets (no ibb)
- `CancelUploadPopup` — i18n defaults; page passes cancel message

### 4.5 Demo
- `EditProfileComponentsDemo.vue` — each component with Show Code
- Mounted on `DemoPage.vue` after Settings section

---

## 5. Naming checklist (architecture docs)

| Rule | Status |
|------|--------|
| Folders kebab-case | ✅ `templates/edit-profile/` |
| Page `*Page.vue` | ✅ `EditProfilePage.vue` |
| JS modules camelCase | ✅ `useEditProfileAssets.js` |
| Composable `use*` | ✅ `useEditProfileAssets` |
| Events kebab-case | ✅ existing (`upload-new`, `choose-avatar`) |
| No new vague utils/helpers | ✅ |

---

## 6. Follow-ups (optional)

1. Swap inline mobile header icons for `DashboardSharedHeader` (Settings parity)
2. Domain folder `src/dev/components/edit-profile/` for page-specific parts
3. ThumbnailUploader internal default strings → parent-only i18n props audit

---

## 7. Manual smoke checklist

- [ ] Open `/edit-profile` — form + gallery load
- [ ] Dashboard sidebar **Edit Profile** navigates to `/edit-profile`
- [ ] Switch locale en ↔ vi — page strings update
- [ ] Images load from `/dev/cdn/...` (no ibb)
- [ ] CustomDropdowns + avatar/crop/cancel popups open
- [ ] Demo page **Edit Profile Page Components** section renders with Show Code
