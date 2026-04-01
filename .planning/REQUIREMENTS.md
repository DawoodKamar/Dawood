# Requirements: Dawood Kamar — Personal Brand Website

**Defined:** 2026-04-01
**Core Value:** A fast, readable blog that makes it effortless to publish and share writing — everything else serves that goal.

## v1 Requirements

### Setup & Infrastructure

- [x] **SETUP-01**: Astro 5.17 project initialized with TypeScript, replacing existing vanilla HTML/CSS/JS files
- [x] **SETUP-02**: Tailwind CSS v4 integrated via `@tailwindcss/vite` (not deprecated `@astrojs/tailwind`)
- [x] **SETUP-03**: `@tailwindcss/typography` plugin configured in global CSS for blog post rendering
- [x] **SETUP-04**: `netlify.toml` updated with `command = "npm run build"` and `publish = "dist"`
- [x] **SETUP-05**: Environment variables configured for newsletter API key (not prefixed `PUBLIC_` — keep server-side)
- [x] **SETUP-06**: `astro.config.mjs` with `output: "static"`, `site` URL, sitemap integration, Tailwind Vite plugin

### Content Collections

- [x] **CONTENT-01**: `src/content.config.ts` (not `src/content/config.ts`) defines blog collection with Zod schema
- [x] **CONTENT-02**: Blog frontmatter schema: `title` (string), `date` (date), `description` (string), `category` (enum), `tags` (string[]), `draft` (boolean, default false)
- [x] **CONTENT-03**: Draft posts excluded from production in all 4 locations: blog index, `getStaticPaths`, RSS feed, sitemap
- [x] **CONTENT-04**: 3 sample blog posts with realistic frontmatter and placeholder content (300–500 words each)
  - "Most People Aren't Behind on AI — They're Overloaded by Noise" (AI & Work, 2026-03-15)
  - "Focus Is Becoming a Competitive Advantage" (Focus & Discipline, 2026-03-22)
  - "What Switzerland Taught Me About Ambition" (Culture & Place, 2026-03-29)
- [x] **CONTENT-05**: `remarkReadingTime` remark plugin installed and reading time injected into frontmatter at build time

### Navigation & Layout

- [x] **NAV-01**: `BaseLayout.astro` wraps all pages with `<ClientRouter />` from `astro:transitions` for view transitions
- [x] **NAV-02**: `Navigation.astro` component: links to `/`, `/blog`, `/contact`; active page highlighted; mobile hamburger menu
- [x] **NAV-03**: `Footer.astro` component: copyright, nav links, social links (YouTube, LinkedIn); persistent on all pages
- [x] **NAV-04**: View transitions (crossfade or slide) between all pages; graceful fallback for unsupported browsers
- [x] **NAV-05**: Scripts using `DOMContentLoaded` or DOM queries migrated to `astro:page-load` event listener so they re-run after transitions
- [x] **NAV-06**: Dark mode FOUC prevention: synchronous `is:inline` head script on load + `astro:after-swap` listener to reapply theme class
- [x] **NAV-07**: Dark mode toggled via `.dark` class on `<html>`; preference stored in `localStorage`

### Homepage

- [ ] **HOME-01**: Hero section with headline, subheadline, and CTA linking to `/blog`
- [ ] **HOME-02**: Positioning section with 2–3 paragraphs of body text
- [ ] **HOME-03**: Content pillars section: 4 pillars each with title and short description (AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication)
- [ ] **HOME-04**: Featured posts section: dynamically renders the 3 most recent non-draft blog posts (title, excerpt, date, reading time) with links
- [ ] **HOME-05**: Newsletter signup section with email input and submit button

### Blog

- [ ] **BLOG-01**: Blog listing page (`/blog`) showing all non-draft posts in reverse chronological order
- [ ] **BLOG-02**: Post cards display: title, excerpt (from `description` frontmatter), date, estimated reading time, category tag
- [ ] **BLOG-03**: Individual post pages (`/blog/[slug]`) using `getStaticPaths` and standalone `render()` import from `astro:content`
- [ ] **BLOG-04**: Full markdown rendering: headings, paragraphs, lists, code blocks, blockquotes, images, links — styled via `@tailwindcss/typography`
- [ ] **BLOG-05**: Previous/Next post navigation at bottom of each post (sorted by date)
- [ ] **BLOG-06**: Newsletter signup component at the end of each post
- [ ] **BLOG-07**: Category tags displayed on post cards and individual post pages

### Newsletter

- [ ] **NEWS-01**: `NewsletterSignup.astro` reusable component — form POSTs directly to Buttondown embed API endpoint (`https://buttondown.com/api/emails/embed-subscribe/{username}`)
- [ ] **NEWS-02**: Email validation on input (HTML5 `type="email"` + required)
- [ ] **NEWS-03**: Success/error feedback (redirect to thank-you page or inline state)
- [ ] **NEWS-04**: Component used in ≥3 locations: homepage section, end of each blog post, site footer

### Contact Page

- [ ] **CONTACT-01**: `/contact` page displaying email address (mailto link)
- [ ] **CONTACT-02**: `ContactForm.astro` using Netlify Forms: `data-netlify="true"`, honeypot field, fields: Name, Email, Message
- [ ] **CONTACT-03**: Form `action` points to `/success` — `src/pages/success.astro` created for post-submission redirect
- [ ] **CONTACT-04**: Form uses `data-astro-reload` attribute so view transitions don't intercept the POST
- [ ] **CONTACT-05**: Client-side form validation (required fields, email format)
- [ ] **CONTACT-06**: Social links (YouTube, LinkedIn) on contact page

### SEO & Performance

- [ ] **SEO-01**: `BaseHead.astro` component with props: `title`, `description`, `image`; generates `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, canonical URL
- [ ] **SEO-02**: Canonical URLs via `new URL(Astro.url.pathname, Astro.site)` — `site` config is mandatory in `astro.config.mjs`; export `SITE_URL` from `src/config.ts` as fallback for `getStaticPaths` regression
- [ ] **SEO-03**: Article JSON-LD structured data on blog post pages using `<script type="application/ld+json" set:html={JSON.stringify(schema)} />`
- [ ] **SEO-04**: `@astrojs/sitemap` configured — sitemap auto-excludes draft posts via filter callback
- [ ] **SEO-05**: RSS feed at `/rss.xml` via `@astrojs/rss` — excludes draft posts
- [ ] **SEO-06**: `public/robots.txt` with sitemap URL reference
- [ ] **SEO-07**: All images use `<Image />` from `astro:assets` with explicit width/height to prevent CLS
- [ ] **SEO-08**: Hero/above-fold images use `loading="eager"` and `fetchpriority="high"`
- [ ] **SEO-09**: Google Fonts loaded with `display=swap` + preconnect, or via Astro Fonts API
- [ ] **SEO-10**: Lighthouse score ≥90 across all categories on homepage and a blog post page

### Responsive Design

- [ ] **RESP-01**: Mobile-first CSS throughout; tested at mobile (375px), tablet (768px), desktop (1280px)
- [ ] **RESP-02**: Minimum 16px body text at all breakpoints
- [ ] **RESP-03**: Touch-friendly tap targets (min 44×44px)
- [ ] **RESP-04**: Responsive images

---

## v2 Requirements

### Discovery & Growth

- **DISC-01**: Blog search functionality (client-side, e.g. Pagefind)
- **DISC-02**: Tag filter pages (`/blog/tag/[tag]`) with static `getStaticPaths`
- **DISC-03**: Client-side category filter on blog listing page

### Analytics & Monitoring

- **ANAL-01**: Privacy-first analytics (Plausible or Fathom embed)

### Content Enhancement

- **CONT-06**: MDX support (`@astrojs/mdx`) for interactive post components
- **CONT-07**: Advanced OG image generation (satori / `@vercel/og`)
- **CONT-08**: Comments system (e.g. Giscus)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Final visual branding / design system | Use clean defaults; refine post-launch |
| Final copy | Use placeholder text from brief |
| CMS (Contentful, Sanity, etc.) | File-based blog is intentional — no external dependency |
| Comments | Not core to v1 value |
| Analytics | Add later via Plausible or similar |
| Multi-language support | Not planned |
| E-commerce / paid content | Out of scope entirely |
| `@astrojs/netlify` adapter | Only needed for SSR — this site is static |
| Server-side rendering | Static SSG only |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 through SETUP-06 | Phase 1 | Pending |
| CONTENT-01 through CONTENT-05 | Phase 1 | Pending |
| NAV-01 through NAV-07 | Phase 2 | Pending |
| HOME-01 through HOME-05 | Phase 2 | Pending |
| BLOG-01 through BLOG-07 | Phase 3 | Pending |
| NEWS-01 through NEWS-04 | Phase 3 | Pending |
| CONTACT-01 through CONTACT-06 | Phase 3 | Pending |
| SEO-01 through SEO-10 | Phase 4 | Pending |
| RESP-01 through RESP-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after initial definition*
