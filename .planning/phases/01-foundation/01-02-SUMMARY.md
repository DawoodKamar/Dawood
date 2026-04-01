---
phase: 01-foundation
plan: "02"
subsystem: content
tags: [astro, content-collections, zod, remark, reading-time, markdown]

requires:
  - phase: 01-foundation plan 01
    provides: Astro project with remarkReadingTime plugin wired in astro.config.mjs

provides:
  - Blog content collection with Zod schema validation (src/content.config.ts)
  - Three sample markdown blog posts in src/content/blog/
  - Draft post filtering (switzerland-ambition.md excluded in prod)
  - Verified remarkReadingTime injection via test-reading-time.astro page

affects:
  - 01-foundation plan 03 (blog listing page uses getCollection)
  - Any phase building blog post pages (uses render() and remarkPluginFrontmatter)

tech-stack:
  added: []
  patterns:
    - "Content collection at src/content.config.ts (NOT src/content/config.ts) — Astro 5 path"
    - "glob loader with base: ./src/content/blog pattern"
    - "z.coerce.date() for ISO date strings in frontmatter"
    - "Draft filtering: import.meta.env.PROD ? data.draft !== true : true"
    - "render() from astro:content (standalone function, not post.render() method)"
    - "minutesRead accessed via remarkPluginFrontmatter after render()"

key-files:
  created:
    - src/content.config.ts
    - src/content/blog/ai-noise.md
    - src/content/blog/focus-advantage.md
    - src/content/blog/switzerland-ambition.md
    - src/pages/test-reading-time.astro
  modified: []

key-decisions:
  - "Content collection at src/content.config.ts (Astro 5 requires src/ root, not src/content/)"
  - "category as z.enum() with 4 values enforces allowed categories at build time"
  - "test-reading-time.astro is a throwaway verification artifact to be deleted in Phase 2"

patterns-established:
  - "Draft filtering pattern: import.meta.env.PROD ? data.draft !== true : true"
  - "Reading time accessed via remarkPluginFrontmatter from render() call"

requirements-completed:
  - CONTENT-01
  - CONTENT-02
  - CONTENT-03
  - CONTENT-04
  - CONTENT-05

duration: 4min
completed: 2026-04-01
---

# Phase 1 Plan 02: Content Collections, Sample Posts, and Reading Time Verification Summary

**Astro 5 content collection with Zod schema, three sample blog posts, and confirmed remarkReadingTime injection producing "2 min read" in built HTML**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T19:01:03Z
- **Completed:** 2026-04-01T19:03:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created src/content.config.ts with blog collection, glob loader, and full Zod schema (title, description, date, category enum, tags, draft)
- Created 3 markdown blog posts with valid frontmatter: ai-noise.md (published), focus-advantage.md (published), switzerland-ambition.md (draft: true)
- Created test-reading-time.astro verifying getCollection, draft filtering, render(), and remarkPluginFrontmatter — built HTML contains "2 min read"
- Both `npx astro sync` and `npm run build` exit 0 with Zod validating all 3 posts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create content.config.ts and three sample blog posts** - `1c6ac3a` (feat)
2. **Task 2: Create throwaway verification page for reading time and draft filtering** - `1079fcb` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `src/content.config.ts` - Blog content collection with glob loader and Zod schema
- `src/content/blog/ai-noise.md` - Sample post: AI & Work category, published
- `src/content/blog/focus-advantage.md` - Sample post: Focus & Discipline category, published
- `src/content/blog/switzerland-ambition.md` - Sample post: Culture & Place, draft: true
- `src/pages/test-reading-time.astro` - Throwaway verification page (to be deleted in Phase 2)

## Decisions Made

- Content collection config lives at `src/content.config.ts` (not `src/content/config.ts`) — Astro 5 changed the location
- `test-reading-time.astro` is intentionally a throwaway artifact; it will be removed when real blog pages are built in Phase 2

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The default homebrew `node` binary (21.5.0) was broken due to a missing icu4c library. Resolved by using `/opt/homebrew/opt/node@22/bin/node` which works correctly (Node 22.22.2). All build commands succeeded with the correct node.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all content collection definitions are wired and functional. The test-reading-time page is a throwaway verification artifact, not a stub (it successfully demonstrates the working implementation).

## Next Phase Readiness

- Blog content collection fully configured and validated
- 3 sample posts ready for use in blog listing and post pages
- remarkReadingTime confirmed working — minutesRead injectable in post pages
- Draft filtering pattern established and verified
- test-reading-time.astro should be deleted in Phase 2 once real blog pages replace it

---
*Phase: 01-foundation*
*Completed: 2026-04-01*

## Self-Check: PASSED

- FOUND: src/content.config.ts
- FOUND: src/content/blog/ai-noise.md
- FOUND: src/content/blog/focus-advantage.md
- FOUND: src/content/blog/switzerland-ambition.md
- FOUND: src/pages/test-reading-time.astro
- FOUND: commit 1c6ac3a (feat(01-02): add content collection config and three sample blog posts)
- FOUND: commit 1079fcb (feat(01-02): add reading time verification page)
