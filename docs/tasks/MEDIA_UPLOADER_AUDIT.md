# Media Uploader — Audit status

**Date:** 2026-10-21  
**UI rule:** Hex → token only when colour value is **exact**; dynamic `style=` kept for blur / progress / prop height.

---

## Complete

| Area | Status |
|------|--------|
| Architecture / `@/dev/` / demo catalog / data-* / CDN kebab / i18n Nay / IDB / route | ✅ |
| Arbitrary hex in media Vue trees | ✅ **0** remaining `bg-[#…]` / `text-[#…]` class hexes |
| CreateNewTag inline bg colour | ✅ class tokens (`mediaUi-cyanAlt` / notification info) |
| Static height inline style | ✅ `h-[14.375rem]` class |

New exact aliases live under `tailwind.config.js` → `colors.mediaUi.*` (same hex/rgba as before).

---

## Intentionally kept (no UI-safe removal)

| Kind | Why |
|------|-----|
| `:style` blur / progress width / CSS vars / prop `height` | Runtime values — removing would break behaviour |
| Scoped `<style>` in a few parts | Third-party / complex rules; leave unless rewritten carefully |
| Sandbox example hardcoded English | Not product UI |
| Decorative `alt=""` | Allowed |

---

## QA

Hard refresh `/media-uploader`. Colours/layout should match prior screens; if any token class looks wrong, report the component name.
