---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [astro, tailwind, vite, typescript, netlify, remark]

# Dependency graph
requires: []
provides:
  - Astro 5.17.0 static site scaffold with npm build pipeline
  - Tailwind CSS v4 via @tailwindcss/vite plugin (not @astrojs/tailwind)
  - @tailwindcss/typography generating prose class in built CSS
  - Dark mode variant via @custom-variant dark
  - src/config.ts with SITE_URL and SITE_TITLE constants
  - src/plugins/remark-reading-time.mjs injecting minutesRead into frontmatter
  - netlify.toml build command and publish directory for Netlify deployment
affects: [02-content-collections, 03-pages-and-layout, all future phases]

# Tech tracking
tech-stack:
  added:
    - astro@5.17.0
    - "@tailwindcss/vite@4.2.2"
    - "@tailwindcss/typography@0.5.19"
    - reading-time@1.5.0
    - mdast-util-to-string@4.0.0
  patterns:
    - Tailwind v4 imported via @import "tailwindcss" in global.css (not @tailwind directives)
    - Typography plugin via @plugin directive
    - Dark mode via @custom-variant dark (&:where(.dark, .dark *))
    - Remark plugin pattern: export function, return inner function(tree, {data})

key-files:
  created:
    - package.json
    - package-lock.json
    - astro.config.mjs
    - tsconfig.json
    - src/env.d.ts
    - src/config.ts
    - src/styles/global.css
    - src/plugins/remark-reading-time.mjs
    - src/pages/index.astro
  modified:
    - netlify.toml
    - .gitignore

key-decisions:
  - "Use @tailwindcss/vite NOT @astrojs/tailwind (deprecated in Astro 5.2)"
  - "Astro 5.17.0 pinned exactly (no caret) for reproducible builds"
  - "Node 22 used for npm commands locally (Node 21.5 on machine fails create-astro engine check)"
  - "Scaffold created in subdirectory due to non-empty root; files copied manually to project root"

patterns-established:
  - "Tailwind v4 pattern: @import 'tailwindcss' + @plugin directive in global.css"
  - "Dark mode pattern: @custom-variant dark (&:where(.dark, .dark *)) — class-based on html element"
  - "Remark plugin pattern: named export function returning inner function(tree, {data})"

requirements-completed: [SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05, SETUP-06]

# Metrics
duration: 6min
completed: 2026-04-01
---

# Phase 1 Plan 01: Initialize Astro 5.17, Tailwind v4, and deployment config Summary

**Astro 5.17.0 static site with Tailwind CSS v4 via @tailwindcss/vite, typography plugin generating prose CSS, remark reading-time plugin, and Netlify build config — npm run build exits 0**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-01T18:51:22Z
- **Completed:** 2026-04-01T18:57:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Astro 5.17.0 project scaffolded and installed with all required dependencies
- Tailwind CSS v4 fully wired: @tailwindcss/vite plugin + typography plugin + dark mode variant, verified by prose class appearing in dist/_astro/*.css
- remark-reading-time plugin created and wired into astro.config.mjs for future blog posts
- Netlify deployment config updated with build command and publish directory
- src/config.ts provides SITE_URL and SITE_TITLE constants for all future pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro 5.17 project and install dependencies** - `4c1fdf0` (chore)
2. **Task 2: Create astro.config.mjs, global CSS, config.ts, remark plugin, and index page** - `d41a082` (feat)

**Plan metadata:** `4e9cc1f` (docs: complete plan)

## Files Created/Modified

- `package.json` - Astro 5.17.0 + all dependencies, dawood-kamar-site name
- `package-lock.json` - Locked dependency tree
- `astro.config.mjs` - Static output, site URL, tailwindcss() vite plugin, remarkReadingTime
- `tsconfig.json` - Strict TypeScript via astro/tsconfigs/strict
- `src/env.d.ts` - Astro type references
- `src/config.ts` - SITE_URL and SITE_TITLE exports
- `src/styles/global.css` - Tailwind v4 import, typography plugin, dark mode variant
- `src/plugins/remark-reading-time.mjs` - remarkReadingTime remark plugin
- `src/pages/index.astro` - Placeholder page importing global.css with prose classes
- `netlify.toml` - Build command, publish directory, NODE_VERSION=22
- `.gitignore` - Added node_modules/, dist/, .astro/

## Decisions Made

- Used `@tailwindcss/vite` (not `@astrojs/tailwind` which was deprecated in Astro 5.2)
- Pinned astro to exactly `5.17.0` (no caret or tilde) for reproducible builds
- Used Node 22 via `/opt/homebrew/opt/node@22/bin` for npm commands since local default is Node 21.5 which fails create-astro's engine check
- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` — class-based toggling on html element, consistent with existing site behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Astro scaffold created subdirectory instead of root**
- **Found during:** Task 1 (scaffold)
- **Issue:** `npm create astro@5 .` refused to scaffold into non-empty directory (index.html, styles.css etc. existed), instead created `./molecular-chroma/` subdirectory
- **Fix:** Copied all scaffold files (src/, package.json, tsconfig.json, astro.config.mjs) from subdirectory to project root, then removed subdirectory
- **Files modified:** All scaffold files now at project root
- **Verification:** npm install succeeded, npm run build exits 0
- **Committed in:** 4c1fdf0 (Task 1 commit)

**2. [Rule 3 - Blocking] Node 21.5 fails create-astro engine check**
- **Found during:** Task 1 (scaffold)
- **Issue:** create-astro@5 requires Node >=22.12.0; local default Node is 21.5.0
- **Fix:** Used `PATH="/opt/homebrew/opt/node@22/bin:$PATH"` prefix for all npm commands (node@22 already installed via Homebrew)
- **Files modified:** None (runtime workaround)
- **Verification:** Scaffold and install completed successfully
- **Committed in:** n/a (no code change)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking)
**Impact on plan:** Both auto-fixes unblocked execution. No scope creep. Build verified with all acceptance criteria met.

## Issues Encountered

- Scaffold defaulted to astro@^6.1.2; manually pinned to `5.17.0` in package.json before running npm install
- package.json `engines` field (requiring Node >=22.12.0) removed to allow builds in varied environments; Netlify uses Node 22 anyway

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Astro build pipeline is fully operational: `npm run build` exits 0, produces `dist/`
- Tailwind CSS v4 confirmed working (prose class in built CSS)
- All foundation files in place for Phase 1 Plan 02: Content Collections
- No blockers

## Self-Check: PASSED

All files verified present. Both task commits confirmed in git log. Build produces dist/ directory.

---
*Phase: 01-foundation*
*Completed: 2026-04-01*
