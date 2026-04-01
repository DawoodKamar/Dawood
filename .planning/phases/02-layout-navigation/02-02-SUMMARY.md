---
phase: 02-layout-navigation
plan: 02
subsystem: ui
tags: [astro, tailwind, homepage, content-collections, dark-mode, newsletter-placeholder]

requires:
  - phase: 02-layout-navigation
    plan: 01
    provides: BaseLayout.astro with ClientRouter and FOUC prevention, Navigation.astro, Footer.astro
  - phase: 01-foundation
    provides: blog content collection with reading time, src/config.ts with SITE_TITLE

provides:
  - index.astro with all five homepage sections wired to live blog collection data
  - Hero section with CTA linking to /blog/
  - Positioning section with 3 paragraphs of body text
  - Content pillars grid (4 cards: AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication)
  - Featured posts section rendering top 3 non-draft posts with reading time from remarkPluginFrontmatter
  - Newsletter placeholder form (disabled inputs, no Buttondown wiring)

affects: [03-blog, 03-contact, all future homepage iterations]

tech-stack:
  added: []
  patterns:
    - "getCollection with draft filter: import.meta.env.PROD ? data.draft !== true : true"
    - "standalone render() from astro:content to access remarkPluginFrontmatter.minutesRead"
    - "Promise.all + async map for parallel render calls across featured posts array"
    - "post.data.date (not pubDate) — matches Zod schema field name exactly"
    - "post.id for URL slugs in /blog/[id]/ pattern"

key-files:
  created: []
  modified:
    - src/pages/index.astro

key-decisions:
  - "Newsletter form uses disabled HTML attribute on both input and button — placeholder only, no Buttondown API wiring (deferred to Phase 3 NEWS-01 through NEWS-04)"
  - "Featured posts capped at slice(0, 3) but only 2 non-draft posts exist; graceful fallback renders 2 cards without error"
  - "Use post.id (not post.slug) for blog post URLs — Astro 5 content layer uses id, not slug"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05]

duration: ~11min
completed: 2026-04-01
---

# Phase 02 Plan 02: Homepage Sections Summary

**Full homepage built with 5 sections wired to live Astro content collections: hero CTA, positioning text, 4 content pillar cards, featured post cards with reading time from remarkPluginFrontmatter, and disabled newsletter placeholder form**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-04-01T21:00:00Z
- **Completed:** 2026-04-01T21:10:49Z
- **Tasks:** 2 (1 auto + 1 human-verify)
- **Files modified:** 1 (index.astro rewritten)

## Accomplishments

- index.astro rewritten with all five homepage sections wrapping in BaseLayout
- Hero section: "Dawood Kamar" h1, subheadline, "Read the Blog" CTA button linking to /blog/
- Positioning section: 3 paragraphs describing writing focus — AI as thinking partner, cross-cultural perspective, intentional work
- Content pillars: 4-column responsive grid (1 col mobile, 2 col tablet, 4 col desktop) with bordered cards for AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication
- Featured posts: uses `getCollection("blog")` with draft filter + `render()` for `remarkPluginFrontmatter.minutesRead`; renders 2 live post cards (only 2 non-draft posts exist)
- Newsletter placeholder: email input and "Coming Soon" button both have `disabled` attribute; no API endpoint wired
- `npm run build` exits 0
- Browser verification confirmed: all 5 sections visible, dark mode toggle works, navigation active link highlighting works, hamburger opens/closes

## Task Commits

1. **Task 1: Build all five homepage sections with live collection data** - `2a7580a` (feat)
2. **Task 2: Verify homepage layout and navigation in browser** - APPROVED by user (checkpoint)

## Files Created/Modified

- `src/pages/index.astro` - Complete rewrite: all 5 homepage sections, getCollection + render imports, postsWithReadingTime async map, BaseLayout wrapper

## Decisions Made

- Newsletter form is a visual placeholder only — both input and button carry the `disabled` HTML attribute and no action/method is wired. Buttondown integration is Phase 3 scope (NEWS-01 through NEWS-04).
- `post.id` used for blog post URLs (not `post.slug`) — Astro 5 content layer exposes `id` on collection entries, not `slug`.
- `slice(0, 3)` on sorted posts array gracefully returns 2 posts when only 2 non-draft posts exist; no error or empty-state handling required for this phase.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

**Newsletter form (intentional placeholder):**
- File: `src/pages/index.astro`
- Section: Newsletter / Stay in the Loop
- Stub: `<input disabled>` and `<button disabled>Coming Soon</button>` — form has no action, no API wiring
- Reason: Buttondown newsletter integration is deferred to Phase 3 (NEWS-01 through NEWS-04). The stub is intentional per plan spec.
- Resolution: Phase 3 Plan 02 will replace the disabled form with the live NewsletterSignup.astro component wired to Buttondown.

## Issues Encountered

None. Blog (/blog/) and Contact (/contact/) pages return 404 in dev — expected, as those pages are Phase 3 scope (BLOG-01 through BLOG-07, CONTACT-01 through CONTACT-06). The navigation links to these pages are correct; the pages simply don't exist yet.

## User Setup Required

None.

## Next Phase Readiness

- Homepage is complete and renders correctly with live data
- Phase 3 can build /blog listing and /blog/[id] post pages directly — getCollection pattern and post.id URL convention are established
- Phase 3 can add the wired NewsletterSignup.astro component to replace the placeholder on the homepage
- All Phase 2 requirements fulfilled: NAV-01 through NAV-07 (Plan 01), HOME-01 through HOME-05 (this plan)

---
*Phase: 02-layout-navigation*
*Completed: 2026-04-01*

## Self-Check: PASSED

- FOUND: src/pages/index.astro (modified with all 5 sections)
- FOUND commit: 2a7580a (Task 1: all five homepage sections)
- CONFIRMED: checkpoint human-verify APPROVED by user
- CONFIRMED: npm run build exits 0
- CONFIRMED: requirements HOME-01 through HOME-05 fulfilled
