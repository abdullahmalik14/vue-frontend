# Home Page — Architecture / Naming / assetMap / i18n Audit

**Scope:** Home route template and all home UI under:

- `src/dev/templates/home/HomePage.vue`
- `src/dev/components/home/homeComponents/` (9 files)
- `src/dev/components/home/homeSections/` (14 files)

**Reference docs:**

- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention.txt`

**Audit type:** Quality / standards compliance. **No visual UI redesign** — structure, naming, assetMap, i18n only.

**Route:** `/` (`routeConfig.json` → `@/dev/templates/home/HomePage.vue`, section: `misc`)

**Last re-audit:** 2026-07-10 (post Phase 1–5 + cleanup pass)

---

## How to read this

| Tag | Meaning |
|-----|---------|
| 🔴 **Blocker** | Must fix before home is production-ready per Linden standards |
| 🟡 **Medium** | Should fix; coordinated rename or config work |
| 🟢 **Safe** | Small, local change; low regression risk |
| ✅ **Pass** | Meets guideline |

---

## Executive summary (current reality)

| Area | Status | Severity |
|------|--------|----------|
| Folder split (`homeSections` / `homeComponents`) | ✅ Done | — |
| Page template naming (`HomePage.vue`) | ✅ Done | — |
| Template location (`dev/` sandbox) | ⚠️ Still under `src/dev/` | 🟡 lift later |
| Legacy `Components/` folder | ✅ Deleted (disk verified) | — |
| **assetMap / `getAssetUrls` / `useAssetUrl`** | ✅ Home tree wired; `home.*` flags in `assetMap.json` | — |
| Hardcoded CDN / `/videos/` in active home tree | ✅ **0** matches | — |
| **i18n / `t('home.*')`** | ✅ Wired in sections + components; `section-misc` en/vi | — |
| Locale routing (home vs `/sign-up`, `/log-in`) | ✅ Fixed | — |
| Route `assetPreloadRef` → `homeChrome` | ✅ Via `sharedAssetPreloads.json` | — |
| Reusable global UI (`Heading`, buttons) | ✅ Safety/Ditch/headers aligned | — |
| `homeContent.constants.js` | ❌ **Does not exist** (optional; data lives in components + i18n) | 🟢 |
| Naming: `HomeNavbar` / `HomeFooter` / `HomeMediaSlider` / `HomeBackgroundVideo` | ✅ Done | — |
| Section imports use `@/` aliases | ✅ Done | — |
| Global `html`/`body` styles in page template | ✅ Moved to `main.css` | — |
| `stateEngine` import path | ⚠️ Still `@/utils/stateEngine.js` | 🟢 long-term |

**Bottom line:** Core Linden blockers for home (**assetMap + i18n + naming + structure**) are **done** on the active tree. Remaining is optional polish + lifting out of `dev/` when sandbox is retired — **not** a visual redesign.

### Implementation progress

| Phase | Status |
|-------|--------|
| 1 — Safe / quick wins | ✅ Done |
| 2 — assetMap | ✅ Done (`home.*` flags; 0 hardcoded CDN/video paths) |
| 3 — i18n | ✅ Done (`home.*` in `section-misc`; `@` escaped for vue-i18n) |
| 4 — Structure / naming | ✅ `HomePage` / `HomeNavbar` / `HomeFooter` / `HomeMediaSlider` / `HomeBackgroundVideo` |
| 5 — Cleanup | ✅ Legacy folder gone; `@/` imports; route `assetPreload` |
| 6 — Lift out of `dev/` | ⏳ Deferred (`src/templates/home/`) |

---

## 1. Architecture

### 1.1 ✅ Section vs component split (Pass)

```
src/dev/components/home/
├── homeSections/     ← full-width page blocks (14)
└── homeComponents/   ← reusable home UI (9)
```

`HomePage.vue` composes sections only — matches guideline **templates compose components**.

### 1.2 ✅ Legacy `Components/` folder

Previously a parallel unused tree. **Deleted** — only `homeComponents/` + `homeSections/` remain. No imports pointed at the old folder.

### 1.3 🟡 Home template still under `src/dev/templates/home/`

Guidelines place route pages at `src/templates/[domain]/` with `*Page.vue` suffix.

| Current | Target (when sandbox lifts) |
|---------|-----------------------------|
| `src/dev/templates/home/HomePage.vue` | `src/templates/home/HomePage.vue` (or `misc/`) |

`routeConfig.json` correctly points at `@/dev/templates/home/HomePage.vue` today.

**Risk:** 🟡 Medium — coordinated `git mv` + route + import updates. **Do not rush** while other `dev/` work is active.

### 1.4 ✅ Page naming: `HomePage.vue`

Guideline: route-level templates use `*Page.vue`. **Done.**

### 1.5 ✅ Imports use `@/` aliases

`HomePage.vue` and `homeSections/*` import home UI via `@/dev/components/home/...` (not deep relative `../`).

### 1.6 ✅ Global document styles

Unscoped `html`/`body` rules are **not** in the page template — live in `src/assets/main.css`.

### 1.7 ✅ Locale routing

`buildLocaleParamSegment()` constrains `:locale` to supported locales; `/sign-up` / `/log-in` no longer match home.

| Check | Status |
|-------|--------|
| `/` loads Home | ✅ |
| `/sign-up`, `/log-in` leave home | ✅ |
| `/vi` localized home | ⚠️ Smoke-test recommended |
| Home copy via `t('home.*')` | ✅ |
| `section-misc` loads on home | ✅ |

---

## 2. assetMap & assets

### 2.1 ✅ assetMap integration (Pass)

| Metric | Status |
|--------|--------|
| `getAssetUrls` / `useAssetUrl` in home tree | ✅ Used across sections/components |
| Hardcoded `i.ibb.co` / `/videos/` in active home tree | ✅ **0** |
| `home.*` flags in `src/config/assetMap.json` | ✅ ~44 flags (logo, hero, video, sliders, tabs, etc.) |
| Synced `public/config/assetMap.json` | ✅ Expected for runtime |

Pattern in use:

```js
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';
// or
import { useAssetUrl } from '@/composables/useAssetUrl.js';
```

### 2.2 ✅ Route `assetPreloadRef` → shared catalog

`/` uses `assetPreloadRef: "homeChrome"` (same pattern as dashboard routes). Entries live in `sharedAssetPreloads.json`:

- `home.logo`
- `home.hero.image0_1`
- `home.hero.poster1`

---

## 3. i18n (translations)

### 3.1 ✅ i18n on home page (Pass)

| Metric | Status |
|--------|--------|
| `useI18n` / `t('home.*')` in home tree | ✅ Wired |
| User-facing copy | ✅ Under `home` namespace in `section-misc` |
| Locales | ✅ `en` + `vi` (`src/i18n` + `public/i18n`) |
| vue-i18n `@` linked-message crashes | ✅ Escaped as `{'@'}` where needed |

### 3.2 🟢 Optional sync check

`src/i18n/section-misc/en.json` vs `public/i18n/section-misc/en.json` may differ by a few lines — keep them in sync when editing keys. `vi` line counts matched at last check.

---

## 4. Naming conventions

### 4.1 Component files (Vue) — current

| File | Verdict |
|------|---------|
| `HomePage.vue` | ✅ |
| `HomeNavbar.vue` | ✅ |
| `HomeFooter.vue` | ✅ |
| `HomeMediaSlider.vue` | ✅ (was `BaseMediaSlider`) |
| `HomeBackgroundVideo.vue` | ✅ (was `BackgroundVideo`) |
| `HomeSectionHeader.vue` | ✅ |
| `HomeHeroIntro.vue` | ✅ |
| `HomeFeatureTextBlock.vue` | ✅ |
| `HomeServiceTabNav.vue` | ✅ |
| `HomeCreatorSignupForm.vue` | ✅ |
| `*Section.vue` / slider sections (14) | ✅ |

### 4.2 Folders

| Folder | Verdict |
|--------|---------|
| `homeComponents/` / `homeSections/` | ✅ Acceptable camelCase domain folders |
| Legacy `Components/` | ✅ Removed |

### 4.3 Events

| Location | Status |
|----------|--------|
| `HeroSection` → `slide-change` | ✅ kebab-case |
| `HomePage` → `handleHeroSlideChange` | ✅ |

### 4.4 Constants

No dedicated `homeContent.constants.js`. Slider/FAQ/tab **structure** stays in components; **copy** stays in i18n. Extracting a constants file is **optional** (🟢), not a blocker — earlier audit summary incorrectly marked it ✅.

---

## 5. Reusable components

| Component | Uses global UI | Notes |
|-----------|----------------|-------|
| `HomeSectionHeader` | `Heading`, `Paragraph` | ✅ |
| `HomeHeroIntro` | `Heading`, `Paragraph` | ✅ |
| `HomeFeatureTextBlock` | `Heading`, `Paragraph` | ✅ |
| `OverviewSection` | typography themes | ✅ |
| `HomeCreatorSignupForm` | `DashboardPrimaryButton` | ✅ |
| `HomeServiceTabNav` | `createStepStateEngine` | ✅ |
| `HomeNavbar` | `DashboardPrimaryButton`, routing helpers | ✅ |
| `SafetyBanner` / `DitchMiddleman` | typography / buttons aligned | ✅ |

**Optional polish (no visual redesign required):**

- `JoinSection` still uses a raw `<h2>` in places — can swap to `Heading` later if desired
- Slider demo meta/alts already go through i18n keys

---

## 6. Route & section config

```json
{
  "slug": "/",
  "section": "misc",
  "componentPath": "@/dev/templates/home/HomePage.vue",
  "assetPreloadRef": "homeChrome"
}
```

**Optional later:**

1. 🟢 Consider `"section": "home"` + dedicated `section-home` i18n (only if product wants a separate section pack)
2. 🟡 Lift path to `src/templates/home/HomePage.vue`

---

## 7. Dependency / layer checks

| Check | Status |
|-------|--------|
| Components call services/API directly | ✅ None found |
| Components use `@/components/ui/*` | ✅ Yes |
| `stateEngine` import | 🟢 `@/utils/stateEngine.js` — prefer `systems/interactions/` long-term |
| Page/section imports | ✅ `@/` aliases |

---

## 8. File-by-file checklist (re-audit)

| File | assetMap | i18n | Naming | Notes |
|------|:--------:|:----:|:------:|-------|
| `HomePage.vue` | — | — | ✅ | Composes sections; `@/` imports |
| `HomeBackgroundVideo.vue` | ✅ | — | ✅ | Video flags via `getAssetUrls` |
| `HomeMediaSlider.vue` | ✅ | via props | ✅ | Splide empty-list guards |
| `HomeCreatorSignupForm.vue` | — | ✅ | ✅ | |
| `HomeFeatureTextBlock.vue` | — | via props | ✅ | |
| `HomeHeroIntro.vue` | — | via props | ✅ | |
| `HomeSectionHeader.vue` | — | via props | ✅ | |
| `HomeServiceTabNav.vue` | — | via props | ✅ | |
| `HomeFooter.vue` | ✅ | ✅ | ✅ | |
| `HomeNavbar.vue` | ✅ | ✅ | ✅ | |
| `AboutSection.vue` | ✅ | ✅ | ✅ | |
| `DitchMiddleman.vue` | ✅ | ✅ | ✅ | |
| `FAQSection.vue` | ✅ | ✅ | ✅ | |
| `FeaturedCreators.vue` | ✅ | ✅ | ✅ | |
| `GallerySlider.vue` | ✅ | ✅ | ✅ | → `HomeMediaSlider` |
| `HeroSection.vue` | ✅ | ✅ | ✅ | `slide-change` |
| `JoinSection.vue` | ✅ | ✅ | ✅ | |
| `MostViewedSlider.vue` | ✅ | ✅ | ✅ | → `HomeMediaSlider` |
| `OverviewSection.vue` | ✅ | ✅ | ✅ | |
| `RecentlyUploadedSlider.vue` | ✅ | ✅ | ✅ | → `HomeMediaSlider` |
| `ReviewSection.vue` | ✅ | ✅ | ✅ | |
| `SafetyBanner.vue` | ✅ | ✅ | ✅ | |
| `ServiceTabsSection.vue` | ✅ | ✅ | ✅ | |

---

## 9. Remaining work (honest backlog)

### Done (do not re-open as blockers)

1. assetMap for home images/videos  
2. i18n `home.*` + `@` escape  
3. `HomePage` / navbar / footer / slider / background naming  
4. Delete unused legacy `Components/`  
5. `@/` imports in page + sections  
6. Route `assetPreload` for critical home assets  
7. Locale collision fix for auth paths  

### Still open (non-UI)

| Priority | Item |
|----------|------|
| 🟡 | Lift `dev/templates/home` → `src/templates/home` when sandbox retires |
| 🟢 | Optional `homeContent.constants.js` for non-copy structure |
| 🟢 | Keep `src` ↔ `public` i18n / assetMap in sync on every edit |
| 🟢 | Smoke-test `/` and `/vi` translations after deploy |
| 🟢 | Long-term: move `stateEngine` import to `systems/interactions/` |

### Explicitly out of scope for this audit

- Visual redesign, layout changes, new sections, animation redesign  
- Pushing to main/prod without Linden approval  

---

## 10. Sign-off criteria

- [x] **0** hardcoded external image/video URLs in active home tree  
- [x] User-facing strings via `t('home.*')`  
- [x] `home.*` flags in assetMap (src + public)  
- [x] Route preload includes critical home assets  
- [ ] Locale `/` and `/vi` smoke-tested on staging after next deploy  
- [x] `/sign-up` and `/log-in` navigate away from home  
- [x] No duplicate `Components/` folder  
- [x] Template named `HomePage.vue` (still under `dev/` until lift)  
- [x] Audit doc matches current tree (this rewrite)  
- [ ] Zero 🟡 items only after `dev/` → `templates/` lift (optional for merge if Linden accepts sandbox path)

---

*Re-audited against Linden architecture & naming guidelines. Earlier versions of this file incorrectly claimed `useHomeAssetUrls`, `assetMap.misc.json`, and `homeContent.constants.js` as done — those claims are corrected above.*
