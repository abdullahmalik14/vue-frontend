# CSS / Tailwind / HTML Audit Report

**Auditor:** Abdullah (staging)  
**Date:** 2026-07-11  
**Standards:** `css-tailwind-data-attribute-vite-standards.md` + `css-ai-audit-prompt.md` (Linden)  
**Mode:** Audit only — no mass rewrite

## Scope

| # | Path | Files |
|---:|---|---:|
| 1 | `src/dev/components/home/homeComponents/` | 9 |
| 2 | `src/dev/components/media/uploader/parts/` | 15 |
| 3 | `src/dev/components/profile/` | 22 |
| 4 | `src/dev/components/ui/card/` | 4 |
| 5 | `src/dev/components/ui/dropdowns/ActionMenuDropdown.vue` | 1 |
| 6 | `src/dev/components/ui/nav/dashboard/DashProfileSettings.vue` | 1 |
| 7 | `src/dev/components/ui/progress/UploadingProgressBar.vue` | 1 |
| 8 | `src/components/ui/nav/dashboard/DashboardTabs.vue` | 1 |
| 9 | `src/dev/components/ui/table/dashboard/OrdersTableSearchInput.vue` | 1 |
| 10 | `src/dev/components/plan/parts/BasePlanDropdown.vue` | 1 |
| 11 | `src/dev/components/ui/table/FlexTable.vue` | 1 |
| | **Total** | **57** |

---

## Overall Result

**Status:** Fail

**Summary:**  
Across 57 scoped Vue files, **0 files fully Pass** Linden’s contract. Layout is mostly flex-first (good), but the set fails on design tokens (hardcoded hex), Linden `data-*` hooks, semantic interactives (`div`/`span`/`li` + click), `focus-visible`, arbitrary values (`z-[9999]` / `z-[100000]`), and scattered inline/`<style>` usage. Closest to Pass: `HomeSectionHeader`, `HomeFeatureTextBlock`, `HomeHeroIntro`, `ProfileMeta`, `OrdersTableSearchInput`, `DashboardAnalyticsMetricCard`.

**File verdict counts (strict):**

| Verdict | Count |
|---|---:|
| Pass | 2 |
| Partial Pass | 12 |
| Fail | 43 |

---

## Audit Results

Aggregate checklist for the full scope (if any material file fails a check → **Fail**).

| # | Area | Check | Result | Issue Found | Recommendation |
|---:|---|---|---|---|---|
| 1 | Tailwind | Uses Tailwind utilities first | Fail | Most files use Tailwind, but several keep `<style scoped>`, BEM, or legacy class hooks (`ThumbnailUploaderNay`, `ActionMenuDropdown`, `FlexTable`, `SubscriptionCard`, `HomeBackgroundVideo`) | Remove one-off style blocks; move animation/scrollbar into Tailwind config utilities |
| 2 | Tailwind | Avoids undocumented arbitrary values | Fail | 200+ `text-[…]`, `h-[…]`, `z-[9999]`, `z-[100000]`, filter/clip-path brackets | Extend theme tokens; document approved exceptions only |
| 3 | Tailwind | Avoids duplicated long class strings | Fail | Feed cards, tip/topup steps, profile sharing share near-identical hex/filter chains | Extract shared variants / UI primitives |
| 4 | Layout | Uses flex where suitable | Pass | Flex is the default across scope; grid only where 2D (e.g. `ThumbnailSelector`) | Keep; prefer flex for 1D rows |
| 5 | Layout | Grid only for 2D layouts | Pass | Grid usage is appropriate where present | N/A |
| 6 | Layout | Uses `gap-*` instead of sibling `ml`/`mr` | Fail | Sibling margins in `FlexTable`, `TrailerSetting`, `PostPreview`, `HomeCreatorSignupForm`, tip steps | Parent `flex` + `gap-*` |
| 7 | Data Attributes | Uses Linden `data-component` / `data-element` / `data-action` / `data-state` | Fail | **~0/57** roots use the Linden contract; uploader uses legacy `data-media-*`; some use `data-value` / class `.active` | Migrate to Linden naming on every root + interactive |
| 8 | Data Attributes | Avoids IDs for styling/JS | Fail | `id="bg-layer"`, `id="blur-thumbnail-toggle"`, `id="show-preview-toggle"`, `id="token-switch"`, tag checkbox ids | Prefer wrapping `<label>` or `data-element`; never style via `#id` |
| 9 | JS Selector Safety | Selectors use `data-*` not classes/IDs | Fail | Click-outside / menu logic often targets class names (e.g. BlurEffect, MediaUploaderSearchInput) | Query `[data-element=…]` / `[data-action=…]` with existence checks |
| 10 | Inline / External Style | No inline `style=""` / `:style` for static look | Fail | Dynamic backgrounds/progress often OK; static clip-path/gradients/colors in `SubscriptionCard`, `BasePlanDropdown`, tip steps are not | Static → utilities/tokens; dynamic → CSS variables |
| 11 | Inline / External Style | No component `<style>` / `!important` | Fail | Style blocks + `!important` in uploader Nay, ActionMenuDropdown, FlexTable, SubscriptionCard, HomeBackgroundVideo | Delete blocks; use Tailwind + `data-state` variants |
| 12 | Global Tokens | No hardcoded hex colours | Fail | Hex in majority of files (`#07F468`, `#667085`, `#E7E5E4`, tip checkout palette, etc.) | Map to semantic theme colours (`primary`, `muted`, `surface`, `danger`) |
| 13 | Global Tokens | No hardcoded z-index / spacing | Fail | `z-[999]`, `z-[9999]`, `z-[10000]`, `z-[100000]`; rem-bracket spacing everywhere | Define z-scale + spacing scale in Tailwind config |
| 14 | Vite / Tailwind | Compile-safe class names | Partial Pass | Mostly static class strings (good); some dynamic colour props still pass hex strings | Prefer token class maps over runtime hex props |
| 15 | Accessibility | Semantic buttons/links | Fail | Widespread `div`/`span`/`li` click handlers (navbar menu, tabs, dropdowns, profile actions, DashboardTabs, BasePlanDropdown) | Real `<button>` / `<a>` + ARIA |
| 16 | Accessibility | `focus-visible` / outline replacement | Fail | Many `outline-none` / `focus:outline-none` with **no** `focus-visible:ring-*` | Always pair outline removal with visible focus |
| 17 | Accessibility | Tabs / menus use ARIA | Fail | `HomeServiceTabNav`, `DashboardTabs`, tip step tabs lack `role="tab"` / `aria-selected` | Implement WAI-ARIA tablist / menu patterns |
| 18 | Maintainability | Shared interactive primitives | Fail | Same dropdown/tab/slider patterns reimplemented with hex + arbitrary CSS | Shared `ActionButton`, `TabList`, `Listbox`, `RangeSlider` |
| 19 | Responsive | Mobile-first / intentional overflow | Partial Pass | Most use `md:`/`lg:`; some hide overflow without clear intent; extreme `max-[580px]:` chains in profile | Prefer breakpoint tokens; avoid one-off max-width media chains |
| 20 | State | UI state via `data-state` not visual classes | Fail | `.active`, `.tab-active`, class toggles for video layers / menus | `data-state="open|active|selected"` + Tailwind variants |

---

## Critical Issues

1. **Non-semantic interactives** — Keyboard/screen-reader failure risk on home navbar, service tabs, DashboardTabs, BasePlanDropdown, DashProfileSettings, profile share/tip actions, BlurEffect, PublishDatePicker, upload delete/play controls.
2. **`outline-none` without `focus-visible`** — Focus ring removed on tabs, search inputs, signup CTAs, tip/topup forms, DashboardTabs.
3. **No Linden `data-*` contract** — Blocks consistent testing, analytics hooks, and safe JS selectors across all 57 files.
4. **Hardcoded hex + extreme z-index** — Theme/dark-mode and stacking bugs; `z-[100000]` in tip/topup footers is unmaintainable.
5. **Custom CSS / `!important`** — `ThumbnailUploaderNay`, `ActionMenuDropdown`, `FlexTable`, `SubscriptionCard`, `HomeBackgroundVideo` fight Tailwind-first policy.
6. **ID-based DOM hooks** — `bg-layer`, toggle ids, `token-switch` violate “no IDs for JS/styling”.

---

## Recommended Fixes

Priority order (do not mass-rewrite UI look — standards compliance only):

1. **A11y first:** Replace `div`/`span`/`li` click targets with `<button type="button">` / `<a>`; add `focus-visible:ring-*` wherever outline is removed; add tab/menu ARIA on `DashboardTabs`, `HomeServiceTabNav`, tip tabs.
2. **Linden hooks:** Add `data-component` on every root; `data-action` on triggers; `data-state` for open/active/selected; stop using class names as JS hooks.
3. **Remove IDs used as hooks:** `HomeBackgroundVideo`, `VideoThumbnailSelector`, `TrailerSetting`, `TipInTokenSubstep`, tag checkboxes.
4. **Token migration:** Register brand/muted/surface/danger colours + z-index scale; replace hex in templates (start with shared `#07F468` / `#667085` / `#344054`).
5. **Kill style blocks:** Move scrollbar hide, font-family, line-clamp, video `.active` into Tailwind utilities / `data-state` variants.
6. **Cap arbitrary values:** Ban new `z-[9999+]`; replace rem-bracket one-offs with spacing/type scale; document true design exceptions.
7. **Shared primitives:** One listbox (`BasePlanDropdown` / `BlurEffect`), one tab control (`DashboardTabs` / `HomeServiceTabNav`), one range slider (tip/topup).
8. **Quick Partial → Pass candidates:** `HomeSectionHeader`, `HomeFeatureTextBlock`, `HomeHeroIntro`, `ProfileMeta`, `OrdersTableSearchInput`, `DashboardAnalyticsMetricCard` (add `data-component` + token/focus fixes only).

---

## Per-Area Verdicts

### 1. `home/homeComponents/` — **Fail**

| File | Verdict | Top blocker |
|---|---|---|
| `HomeSectionHeader.vue` | Pass | Add `data-component` only |
| `HomeFeatureTextBlock.vue` | Pass | Add `data-component` only |
| `HomeHeroIntro.vue` | Partial Pass | One arbitrary max-width |
| `HomeMediaSlider.vue` | Fail | Hex + arbitrary + missing data-* |
| `HomeCreatorSignupForm.vue` | Fail | Hex + `outline-none` + invalid `dark:[#…]` |
| `HomeNavbar.vue` | Fail | `div` menu toggle + hex + no focus-visible |
| `HomeServiceTabNav.vue` | Fail | `li @click` tabs + hex |
| `HomeBackgroundVideo.vue` | Fail | `id="bg-layer"` + style block + class state |
| `HomeFooter.vue` | Fail | Hex + no data-* on links |

### 2. `media/uploader/parts/` — **Fail**

| File | Verdict | Top blocker |
|---|---|---|
| `SystemGeneratedImage.vue` | Partial Pass | Hex border / arbitrary |
| `VideoThumbnailSelector.vue` | Partial Pass | `id` on toggle |
| `ThumbnailUploader.vue` | Partial Pass | Arbitrary shadow/z |
| `SocialCustomPreview.vue` | Partial Pass | Hex border + empty style |
| `ThumbnailSelector.vue` | Partial Pass | `focus:outline-none` no replacement |
| `TrailerSetting.vue` | Partial Pass | `id` + hex text |
| `FileUploadPlaceholder.vue` | Partial Pass | `div @click` |
| `ThumbnailUploaderNayExample.vue` | Partial Pass | Demo hex prop (dev-only) |
| `ThumbnailUploaderNay.vue` | Fail | `!important` style + inline + legacy hooks |
| `PostPreview.vue` | Fail | `div` play control + arbitrary type |
| `PublishDatePicker.vue` | Fail | `div` trigger + outline-none |
| `BlurEffect.vue` | Fail | `z-[9999]` + `div` dropdown |
| `MediaUploaderSearchInput.vue` | Fail | Scrollbar CSS + hex + nested click divs |
| `UploadThumbnailPreview.vue` | Fail | `span` delete control |
| `UploadYourOwnTrailer.vue` | Fail | Non-semantic play/remove |

### 3. `profile/` — **Fail**

Worst offenders: `TipStep3.vue`, `TipStep2.vue`, `TopUpStep1/2.vue`, `SubscriptionCard.vue`, `TipInTokenSubstep.vue`, `ProfileHeaderActions.vue`, `ProfileSharing*.vue`.

Closest: `ProfileMeta.vue`, `ProfileHeader.vue`, `ProfileHeaderOptionButtons.vue`, `ProfileSubscribeCta.vue` (semantic buttons but hex/arbitrary).

### 4. `ui/card/` — **Fail**

| File | Verdict | Top blocker |
|---|---|---|
| `DashboardAnalyticsMetricCard.vue` | Partial Pass | Uses some tokens; `z-[10000]` + outline-none |
| `FeedPollCard.vue` | Fail | Hex + `:style` width |
| `FeedMediaCard.vue` | Fail | Hex + `:style` bg |
| `MerchCard.vue` | Fail | Hex + inline styles |

### 5–11. Individual files — **Fail** (1 Partial)

| File | Verdict | Top blocker |
|---|---|---|
| `ActionMenuDropdown.vue` | Fail | `<style>` font + hex + `li @click` |
| `DashProfileSettings.vue` | Fail | `div` rows + hex + `.active` |
| `UploadingProgressBar.vue` | Fail | Hex stroke + `:style` |
| `DashboardTabs.vue` | Fail | `div` tabs + outline-none |
| `OrdersTableSearchInput.vue` | Partial Pass | Hex + outline-none (small surface) |
| `BasePlanDropdown.vue` | Fail | `div` listbox + hex props + inline mask |
| `FlexTable.vue` | Fail | `<style>` scrollbar + hex + `:style` |

---

## Final Summary

| Question | Answer |
|---|---|
| Meets Linden CSS/Tailwind/data-attribute standards? | **No** |
| Safe to approve as-is? | **No — Fail** |
| Biggest systemic gaps | Tokens, `data-*`, semantic a11y, focus-visible |
| Biggest layout win already present | Flex-first; grid used sparingly and correctly |
| Suggested next step | Fix Critical a11y + `data-*` on shared nav/dropdown/table primitives, then token pass |

## Approval Decision

**Not approved** — **Fail**. Re-audit after Critical Issues 1–5 are addressed on the shared primitives (`DashboardTabs`, `BasePlanDropdown`, `ActionMenuDropdown`, `OrdersTableSearchInput`, `FlexTable`) and one vertical slice (home navbar **or** media uploader parts).

---

## Improved Code Example

Only patterns — not a full rewrite.

```html
<!-- BEFORE -->
<div class="outline-none cursor-pointer" @click="open">…</div>

<!-- AFTER -->
<button
  type="button"
  data-component="plan-dropdown"
  data-action="open"
  data-state="closed"
  class="inline-flex items-center gap-2 rounded-md bg-surface text-primary
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  :aria-expanded="isOpen"
  @click="open"
>
  …
</button>
```

```html
<!-- BEFORE -->
<div id="bg-layer" class="active">…</div>

<!-- AFTER -->
<div data-component="home-background-video" data-element="bg-layer" data-state="active">…</div>
```

---

*End of audit. No production UI redesign performed.*
