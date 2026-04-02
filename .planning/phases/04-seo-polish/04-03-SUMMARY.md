---
phase: 04-seo-polish
plan: "03"
subsystem: ui
tags: [astro, tailwind, seo, og-image, tap-targets, mobile-nav]

requires:
  - phase: 04-seo-polish-plan-02
    provides: Lighthouse, responsive, and tap-target fixes

provides:
  - Mobile hamburger menu without redundant theme toggle
  - og:image and twitter:image resolved to absolute URLs via Astro.site
  - Contact page social links meeting 44px WCAG tap target minimum
  - REQUIREMENTS.md SEO-09 aligned with system font implementation reality

affects: [seo-polish, verification, requirements]

tech-stack:
  added: []
  patterns:
    - "Resolve relative image paths to absolute URLs with new URL(path, Astro.site).toString() in BaseHead"
    - "Social link tap targets use py-3 (not py-2) for ~44px effective height"

key-files:
  created: []
  modified:
    - src/components/Navigation.astro
    - src/components/BaseHead.astro
    - src/pages/contact.astro
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Remove mobile theme toggle entirely — desktop header toggle (always visible) is sufficient"
  - "Use new URL(image, Astro.site).toString() to guarantee absolute og:image URL regardless of prop value"
  - "SEO-09 updated to reflect system font stack reality (no web font loading in this project)"

patterns-established:
  - "BaseHead imageURL pattern: new URL(image, Astro.site).toString() for OG/Twitter image absoluteness"

requirements-completed: [SEO-01, SEO-09, RESP-03]

duration: 2min
completed: "2026-04-02"
---

# Phase 04 Plan 03: Gap Closure Summary

**Closed four UAT/verification gaps: absolute og:image URL via Astro.site, removed duplicate mobile theme toggle, 44px social link tap targets with py-3, and SEO-09 docs aligned to system font reality**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T11:50:04Z
- **Completed:** 2026-04-02T11:51:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- og:image and twitter:image now output absolute URLs (`https://dawoodkamar.com/og-default.png`) by resolving via `new URL(image, Astro.site)` — social crawlers receive correct URLs
- Mobile hamburger menu no longer contains a redundant theme toggle button (desktop header toggle is always visible at all viewport sizes)
- Contact page YouTube and LinkedIn links changed from `py-2` (~36px) to `py-3` (~44px) meeting WCAG minimum tap target
- REQUIREMENTS.md SEO-09 corrected from "Google Fonts with display=swap" to "system font stack used" matching actual implementation

## Task Commits

1. **Task 1: Remove redundant mobile theme toggle and fix og:image URL** - `e89e017` (fix)
2. **Task 2: Fix contact social link tap targets and update REQUIREMENTS.md** - `e79d519` (fix)

## Files Created/Modified

- `src/components/Navigation.astro` - Removed mobile-theme-toggle li block and its script const/listener
- `src/components/BaseHead.astro` - Added imageURL resolution via Astro.site; updated og:image and twitter:image content props
- `src/pages/contact.astro` - Changed social links from py-2 to py-3 for 44px tap targets
- `.planning/REQUIREMENTS.md` - Updated SEO-09 to reflect system font stack (no Google Fonts)

## Decisions Made

- Remove mobile theme toggle entirely rather than conditionally hiding it — the desktop toggle is always rendered in the header at all viewport sizes, making the mobile duplicate unnecessary and confusing
- Use `new URL(image, Astro.site).toString()` for image URL resolution — handles both relative paths (default `/og-default.png`) and absolute URLs passed in by callers without breaking either

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All four UAT/VERIFICATION gaps from phase 04 are now closed
- Phase 04 (seo-polish) is complete — all plans executed
- Build passes with no errors; og:image absolute, mobile nav clean, tap targets compliant, docs accurate

## Self-Check: PASSED

- `e89e017` exists: confirmed via git log
- `e79d519` exists: confirmed via git log
- `src/components/Navigation.astro` exists: confirmed
- `src/components/BaseHead.astro` exists: confirmed
- `src/pages/contact.astro` exists: confirmed
- `.planning/REQUIREMENTS.md` exists: confirmed
- Build passes: confirmed (6 pages built in 790ms)
- `og:image` content = `https://dawoodkamar.com/og-default.png`: confirmed in dist/index.html
- `mobile-theme-toggle` absent from dist/index.html: confirmed (grep exit 1)

---
*Phase: 04-seo-polish*
*Completed: 2026-04-02*
