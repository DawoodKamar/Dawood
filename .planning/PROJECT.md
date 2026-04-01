# Dawood Kamar — Personal Brand Website

## What This Is

A personal brand website for Dawood Kamar — minimal, fast, and blog-centric. Built with Astro and Tailwind CSS, it replaces the existing static portfolio with a full content platform featuring a blog, newsletter integration, and smooth page transitions. The site is cheap to run, easy to maintain via markdown files, and deployed on Netlify.

## Core Value

A fast, readable blog that makes it effortless to publish and share writing — everything else serves that goal.

## Requirements

### Validated

- ✓ Static site deployed on Netlify — existing
- ✓ Dark mode support — existing
- ✓ Responsive mobile layout — existing
- ✓ CV/resume available for download — existing
- ✓ Migrate to Astro 5.17 + Tailwind v4 (replace vanilla HTML/CSS/JS) — Validated in Phase 1: Foundation
- ✓ Static site generation (SSG) — `output: "static"` configured — Validated in Phase 1: Foundation
- ✓ Astro Content Collections with type-safe Zod schema — `src/content.config.ts` — Validated in Phase 1: Foundation
- ✓ Blog post frontmatter: title, date, description, category, tags, draft — Validated in Phase 1: Foundation
- ✓ Draft posts excluded from production builds — Validated in Phase 1: Foundation
- ✓ Reading time calculation (~200 wpm) via `remarkReadingTime` — Validated in Phase 1: Foundation
- ✓ 3 sample blog posts with realistic frontmatter — Validated in Phase 1: Foundation
- ✓ Blog categories: AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication — Validated in Phase 1: Foundation

### Active

- ✓ Persistent nav with active state highlighting and mobile hamburger — Validated in Phase 2: Layout & Navigation
- ✓ Persistent footer with copyright, nav links, and social links (YouTube, LinkedIn) — Validated in Phase 2: Layout & Navigation
- ✓ View transitions between all pages using Astro's View Transitions API — Validated in Phase 2: Layout & Navigation
- ✓ Homepage: hero, positioning text, content pillars (4), featured posts (3 most recent), newsletter signup — Validated in Phase 2: Layout & Navigation
- [ ] Three-page structure: Homepage (`/`), Blog (`/blog`), Get in Touch (`/contact`)
- [ ] Blog listing page with post cards (title, excerpt, date, reading time, category)
- [ ] Individual blog post pages with full markdown rendering
- [ ] Newsletter signup component (reusable) in ≥3 locations: homepage, post footer, site footer
- [ ] Previous/Next post navigation on individual post pages
- [ ] Contact page with Netlify Forms (Name, Email, Message) + form validation + success/error states
- [ ] Newsletter integration via Buttondown or Mailchimp embed/API
- [ ] Fully responsive (mobile-first, min 16px body text)
- [ ] Lighthouse 90+ across all categories
- [ ] Semantic HTML + meta tags (title, description, og:*) per page
- [ ] Article structured data (schema.org) on blog posts
- [ ] Sitemap (`/sitemap.xml`), RSS feed (`/rss.xml`), `robots.txt`
- [ ] Canonical URLs on all pages
- [ ] Netlify Forms enabled for contact form

### Out of Scope

- Final visual design / branding — use clean defaults; can refine after content is live
- Final copy — use placeholder text from brief or lorem ipsum
- Blog search — deferred until post count justifies it
- Comments system — not needed for v1
- Analytics (Plausible etc.) — add later
- Advanced image optimization pipeline — Astro handles basics
- Multi-language support — not planned
- E-commerce / paid content — out of scope entirely

## Context

Existing site is a single-page static portfolio (vanilla HTML/CSS/JS) on the `main` branch. All new work is on the `redesign` branch. The redesign is a full replacement — not an incremental update — so the new Astro project will be initialized in the repo root, replacing the existing files.

Dawood writes across four content categories: AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication. The newsletter integration target is Buttondown (free tier) or Mailchimp — decision can be made at implementation time based on embed simplicity.

Netlify is already configured and deploying from this repo. The new build command will be `astro build` with output to `dist/`.

## Constraints

- **Hosting**: Netlify — free tier, must stay within its limits
- **Cost**: Zero ongoing cost — no paid CMS, no paid newsletter at low volume
- **Tech stack**: Astro + Tailwind CSS + Astro Content Collections — no framework changes
- **Deployment**: Netlify via Git push; no complex CI/CD
- **Branch**: All work on `redesign` — never push to `main` directly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro over Next.js | Content site, not app — Astro ships zero JS by default, native view transitions, first-class markdown | ✓ Confirmed Phase 1 |
| Tailwind v4 via `@tailwindcss/vite` | Replaces deprecated `@astrojs/tailwind`; no `tailwind.config.js` needed | ✓ Confirmed Phase 1 |
| `src/content.config.ts` (not `src/content/config.ts`) | Astro 5 path change — wrong path silently fails | ✓ Confirmed Phase 1 |
| Netlify Forms for contact | Zero backend, already on Netlify, free tier | — Pending Phase 4 |
| Buttondown/Mailchimp for newsletter | Simple embed, free at low volume, no server needed | — Pending Phase 3 |
| File-based blog (no CMS) | Low maintenance, version-controlled, no external dependency | ✓ Confirmed Phase 1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after Phase 2: Layout & Navigation complete*
