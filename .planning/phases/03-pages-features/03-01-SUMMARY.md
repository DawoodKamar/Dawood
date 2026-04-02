---
phase: 03-pages-features
plan: 01
subsystem: ui
tags: [astro, tailwind, blog, newsletter, buttondown, content-collections]

# Dependency graph
requires:
  - phase: 02-layout-navigation
    provides: BaseLayout, Navigation, Footer, view transitions, dark mode foundation
  - phase: 01-foundation
    provides: content.config.ts schema, getCollection/render patterns, remarkReadingTime, sample blog posts
provides:
  - Blog listing page at /blog with post cards (title, description, date, reading time, category)
  - Individual post pages at /blog/[id] with prose typography rendering
  - PostNavigation component for prev/next post links
  - NewsletterSignup component with Buttondown embed endpoint
affects: [03-02-contact-newsletter, 04-seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Blog listing: getCollection + draft filter + date sort + Promise.all render for reading times"
    - "Dynamic routes: getStaticPaths with params.id from post.id (Astro 5 content layer)"
    - "Prev/Next navigation: array index arithmetic on date-sorted posts array"
    - "Newsletter: Buttondown embed form POST with hidden embed=1 field, target=_blank"
    - "Typography: prose dark:prose-invert max-w-none wrapping <Content /> component"

key-files:
  created:
    - src/pages/blog/index.astro
    - src/pages/blog/[id].astro
    - src/components/PostNavigation.astro
    - src/components/NewsletterSignup.astro
  modified: []

key-decisions:
  - "NewsletterSignup opens Buttondown thank-you page in new tab (target=_blank) — simplest success feedback, no custom success page needed"
  - "NewsletterSignup compact prop omits heading/description for footer embed use (NEWS-04)"
  - "posts[index+1] = Previous (older), posts[index-1] = Next (newer) — array sorted newest-first"

patterns-established:
  - "Pattern: NewsletterSignup is reusable with compact=false (full section) or compact=true (form only)"
  - "Pattern: PostNavigation only renders <nav> if at least one of prevPost/nextPost is non-null"

requirements-completed: [BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, NEWS-01, NEWS-02, NEWS-03, NEWS-04]

# Metrics
duration: 2min
completed: 2026-04-02
---

# Phase 03 Plan 01: Blog Pages & Newsletter Components Summary

**Blog listing, individual post pages, PostNavigation, and NewsletterSignup built — Buttondown embed form wired, prose typography active, draft exclusion confirmed**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T21:55:49Z
- **Completed:** 2026-04-02T00:00:00Z
- **Tasks:** 3 of 3 complete
- **Files modified:** 4

## Accomplishments
- NewsletterSignup.astro with Buttondown embed POST, compact prop, email validation
- PostNavigation.astro with CollectionEntry typing and conditional prev/next rendering
- Blog listing at /blog with all non-draft posts, date/reading time/category cards
- Individual post pages with full prose typography, nav, and newsletter at bottom
- Draft post (switzerland-ambition.md) confirmed excluded from build

## Task Commits

Each task was committed atomically:

1. **Task 1: Create NewsletterSignup.astro and PostNavigation.astro** - `2b0a82d` (feat)
2. **Task 2: Create blog listing page and individual post page** - `63a191d` (feat)
3. **Task 3: Verify in browser** - approved (checkpoint:human-verify passed)

## Files Created/Modified
- `src/components/NewsletterSignup.astro` - Buttondown embed form with compact prop
- `src/components/PostNavigation.astro` - Conditional prev/next post navigation with CollectionEntry types
- `src/pages/blog/index.astro` - Blog listing with draft filter, date sort, reading time, category badges
- `src/pages/blog/[id].astro` - Dynamic post pages with prose, PostNavigation, NewsletterSignup

## Decisions Made
- NewsletterSignup uses `target="_blank"` to open Buttondown's thank-you page in a new tab — simplest success feedback per NEWS-03
- `compact` boolean prop on NewsletterSignup allows headless embed in footer (compact=true) vs full section (compact=false, default)
- In date-sorted (newest-first) array: `posts[index+1]` = older = "Previous", `posts[index-1]` = newer = "Next"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
**Buttondown username:** The component uses `dawoodkamar` as the Buttondown username. A TODO comment is included in NewsletterSignup.astro frontmatter to confirm this matches the actual account username. If different, update the `action` attribute URL in that file.

## Known Stubs
- **Buttondown username** in `src/components/NewsletterSignup.astro` (line 7 comment + form action): Uses `dawoodkamar` — needs confirmation against actual Buttondown account slug before going live.

## Status
**COMPLETE** — All 3 tasks done. Human browser verification approved 2026-04-02.

## Next Phase Readiness
- Blog infrastructure fully built and building clean
- NewsletterSignup ready to replace the placeholder on index.astro (Plan 03-02 or future step)
- NewsletterSignup can also be added to Footer.astro with `compact={true}`
- Plan 03-02 (Contact page) can proceed independently — no dependencies on browser verification of this plan

---
*Phase: 03-pages-features*
*Completed: 2026-04-02*
