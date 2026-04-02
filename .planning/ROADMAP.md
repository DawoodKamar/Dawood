# Roadmap: Dawood Kamar — Personal Brand Website

## Overview

Replace the existing vanilla HTML/CSS/JS portfolio with a full Astro 5.17 + Tailwind CSS v4 static site featuring a blog, newsletter integration, and smooth page transitions. The build moves in four phases: scaffold the project and wire up content collections, build the persistent shell and homepage, add the blog, contact, and newsletter pages, then lock in SEO metadata and Lighthouse performance targets before shipping.

## Phases

- [x] **Phase 1: Foundation** - Astro project, Tailwind v4, content collections, sample posts (completed 2026-04-01)
- [x] **Phase 2: Layout & Navigation** - BaseLayout, navigation, footer, dark mode, homepage sections (completed 2026-04-01)
- [x] **Phase 3: Pages & Features** - Blog listing/post pages, contact form, newsletter component (completed 2026-04-02)
- [ ] **Phase 4: SEO & Polish** - Meta tags, structured data, sitemap, RSS, Lighthouse 90+

## Phase Details

### Phase 1: Foundation
**Goal**: A deployable Astro project with Tailwind v4, type-safe content collections, and three sample blog posts exists on Netlify.
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05, SETUP-06, CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05
**Success Criteria** (what must be TRUE):
  1. Running `npm run build` produces a `dist/` directory with no errors and Netlify deploys from it.
  2. Tailwind v4 utility classes render correctly — confirmed by inspecting built CSS (no `@astrojs/tailwind` in `package.json`).
  3. `src/content.config.ts` (not `src/content/config.ts`) defines the blog collection; `npx astro sync` generates TypeScript types with no errors.
  4. Three sample posts exist in `src/content/blog/` with valid frontmatter; a post marked `draft: true` does not appear in any collection query when `import.meta.env.PROD` is true.
  5. Reading time (`minutesRead`) is available on each post via `remarkPluginFrontmatter` — confirmed by logging it in a throwaway page.
**Plans**: 2 plans

Plans:
- [x] 01-01: Initialize Astro 5.17 project, configure Tailwind v4 via `@tailwindcss/vite`, update `netlify.toml`, set `site` URL and `output: "static"` in `astro.config.mjs`, export `SITE_URL` from `src/config.ts`
- [x] 01-02: Define `src/content.config.ts` with Zod blog schema (title, date, description, category enum, tags, draft), install `remarkReadingTime` plugin, create three sample posts

### Phase 2: Layout & Navigation
**Goal**: Every page shares a persistent shell with working navigation, footer, dark mode, and view transitions; the homepage is fully rendered with all five sections.
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. Navigating between pages shows a crossfade or slide transition with no full-page reload (verified in browser Network tab — no document requests on internal links).
  2. Toggling dark mode persists across page navigations and browser refreshes — no flash of light content when navigating while in dark mode.
  3. The hamburger menu opens and closes correctly after navigating away from the page it was first loaded on (i.e., the `astro:page-load` listener fires on every navigation).
  4. The active nav link is highlighted on each page.
  5. The homepage displays hero, positioning text, four content pillars, three most-recent non-draft post cards, and a newsletter signup form.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 02-01: Build `BaseLayout.astro` with `<ClientRouter />` from `astro:transitions`, `is:inline` FOUC-prevention head script, `astro:after-swap` dark mode listener, and `Navigation.astro` + `Footer.astro` with `astro:page-load` event listeners
- [x] 02-02: Build all five homepage sections (hero, positioning, content pillars, featured posts, newsletter placeholder) wired to live collection data

### Phase 3: Pages & Features
**Goal**: Visitors can read blog posts, subscribe to the newsletter, and send a contact message — all three page types are fully functional.
**Depends on**: Phase 2
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, NEWS-01, NEWS-02, NEWS-03, NEWS-04, CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04, CONTACT-05, CONTACT-06
**Success Criteria** (what must be TRUE):
  1. `/blog` lists all non-draft posts in reverse chronological order; each card shows title, excerpt, date, reading time, and category tag.
  2. Navigating to a post URL renders full markdown content styled with `@tailwindcss/typography`; previous/next post navigation links appear at the bottom.
  3. The newsletter signup component appears in at least three locations (homepage, post footer, site footer) and submits to the Buttondown embed API endpoint — confirmed by a successful test subscription.
  4. Submitting the contact form on `/contact` redirects to `/success`; the form is visible in the Netlify dashboard after the first deploy (Netlify Forms detection confirmed).
  5. A draft post's URL (`/blog/[slug]`) is not generated in the production build — `getStaticPaths` filters drafts.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 03-01: Build blog listing page (`/blog`), individual post page (`/blog/[slug]`) using standalone `render()` from `astro:content`, `PostNavigation.astro`, and `NewsletterSignup.astro` component
- [x] 03-02: Build `/contact` page with `ContactForm.astro` (`data-netlify="true"`, `data-astro-reload`, honeypot), `src/pages/success.astro`, client-side validation, social links, and integrate `NewsletterSignup.astro` into site footer

### Phase 4: SEO & Polish
**Goal**: Every page has correct metadata and canonical URLs; the site scores Lighthouse 90+ on all categories; sitemap, RSS, and robots.txt are live.
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10, RESP-01, RESP-02, RESP-03, RESP-04
**Success Criteria** (what must be TRUE):
  1. Every page has a unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, and a canonical URL — verified by viewing page source on homepage, blog index, and a post page.
  2. Blog post pages pass Google's Rich Results Test with valid `BlogPosting` JSON-LD (no escaping errors — confirmed by `set:html` directive on script tag).
  3. `/sitemap-index.xml` is accessible; draft post slugs do not appear in it.
  4. `/rss.xml` is accessible and contains only published posts; `/robots.txt` references the sitemap URL.
  5. Lighthouse audit on the homepage and one blog post page scores 90+ across Performance, Accessibility, Best Practices, and SEO — no CLS from images, no render-blocking fonts.
  6. Site is fully usable and readable at 375px, 768px, and 1280px viewport widths; all tap targets are at least 44×44px.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 04-01: Build `BaseHead.astro` (title, description, OG tags, canonical via `Astro.site` + `SITE_URL` fallback), `ArticleJsonLd.astro` using `set:html`, configure `@astrojs/sitemap` with draft filter, `@astrojs/rss` feed excluding drafts, `public/robots.txt` referencing sitemap
- [ ] 04-02: Audit and fix all Lighthouse regressions — replace any raw `<img>` with `<Image />` from `astro:assets`, set `loading="eager"` on hero images, configure font loading with `display=swap` + preconnect, verify responsive layout at all three breakpoints

## Progress

**Execution Order:** 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete    | 2026-04-01 |
| 2. Layout & Navigation | 2/2 | Complete   | 2026-04-01 |
| 3. Pages & Features | 2/2 | Complete   | 2026-04-02 |
| 4. SEO & Polish | 1/2 | In Progress|  |
