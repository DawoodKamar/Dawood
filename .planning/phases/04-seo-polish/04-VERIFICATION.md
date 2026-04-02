---
phase: 04-seo-polish
verified: 2026-04-02T12:00:00Z
status: human_needed
score: 12/14 must-haves verified
re_verification: true
re_verification_meta:
  previous_status: gaps_found
  previous_score: 10/14
  gaps_closed:
    - "og:image and twitter:image now output absolute URL (https://dawoodkamar.com/og-default.png) via new URL(image, Astro.site) in BaseHead.astro"
    - "Contact page social links (YouTube, LinkedIn) now use py-3 — confirmed py-3 class on both anchors in dist/contact/index.html"
    - "REQUIREMENTS.md SEO-09 updated to reflect system font implementation: 'No render-blocking fonts — system font stack used'"
    - "Mobile hamburger dropdown no longer contains redundant theme toggle (mobile-theme-toggle absent from dist/index.html)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Lighthouse ≥90 on all four categories (SEO-10)"
    expected: "Homepage and one blog post page both score ≥90 on Performance, Accessibility, Best Practices, and SEO in Chrome Lighthouse."
    why_human: "Cannot run Lighthouse programmatically without a live server and headless Chrome. All code preconditions satisfied: aria-labels correct, tap targets ≥44px, no raw img tags, no render-blocking fonts, JSON-LD present, canonical tags absolute."
  - test: "Responsive layout at 375px, 768px, 1280px (RESP-01)"
    expected: "At 375px: hamburger menu visible, single-column layout, no horizontal overflow, all text readable. At 768px: desktop nav visible, no hamburger. At 1280px: full-width layout within max-w-4xl constraint, footer in single-row layout."
    why_human: "Visual layout correctness at specific breakpoints cannot be verified by code inspection alone. Requires loading dist/index.html in a browser and testing with DevTools responsive mode."
  - test: "Social share preview (og:image)"
    expected: "When a page URL is shared on Twitter/X, LinkedIn, or Facebook, the og:image thumbnail appears. The og:image is now an absolute URL (https://dawoodkamar.com/og-default.png) but the image itself is a 1x1 white placeholder until replaced with a real 1200x630px branded image."
    why_human: "Social card preview requires testing against each platform's card validator (Twitter Card Validator, Facebook Sharing Debugger, LinkedIn Post Inspector) with a deployed URL."
---

# Phase 4: SEO & Polish Verification Report

**Phase Goal:** Every page has correct OG/canonical metadata; sitemap, RSS, and robots.txt are live; Lighthouse ≥90 on all four categories; all tap targets ≥44x44px; layout correct at 375px, 768px, and 1280px.
**Verified:** 2026-04-02T12:00:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (plan 04-03)

---

## Re-verification Summary

Previous status: `gaps_found` (10/14). This re-verification confirms all three programmatic gaps from 04-03 are closed. No regressions introduced. Two items remain in human_needed status (unchanged from initial verification — they require a browser/Lighthouse run and are not blockers introduced by the gap closure).

**Gaps closed:**

1. `BaseHead.astro` — `imageURL = new URL(image, Astro.site).toString()` confirmed at line 10; built HTML confirms `content="https://dawoodkamar.com/og-default.png"` on every page.
2. `contact.astro` — Both social link anchors confirmed using `py-3` in source (line 17-18) and in built `dist/contact/index.html`.
3. `REQUIREMENTS.md` — SEO-09 now reads "No render-blocking fonts — system font stack used (no web font loading); if web fonts are added later, use `display=swap` + preconnect".
4. `Navigation.astro` — `mobile-theme-toggle` absent from `dist/index.html` (grep exit 1); mobile menu contains only nav links.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every page has OG title, description, canonical URL | VERIFIED | All 6 built pages contain `og:title`, `og:description`, `og:url`, `canonical` — confirmed in built output |
| 2 | og:image present on all pages as absolute URL | VERIFIED | Built HTML: `content="https://dawoodkamar.com/og-default.png"` on homepage, blog post, and contact pages — absolute URL confirmed |
| 3 | Sitemap live at /sitemap-index.xml with draft posts excluded | VERIFIED | `dist/sitemap-index.xml` and `dist/sitemap-0.xml` present; switzerland-ambition absent from sitemap |
| 4 | RSS feed live at /rss.xml with draft filter | VERIFIED | `dist/rss.xml` contains 2 published posts; switzerland-ambition absent |
| 5 | robots.txt live with sitemap reference | VERIFIED | `dist/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://dawoodkamar.com/sitemap-index.xml` |
| 6 | Article JSON-LD on blog post pages (unescaped quotes) | VERIFIED | Both post pages have `<script type="application/ld+json">` with `"@type":"BlogPosting"` — unescaped quotes confirmed |
| 7 | No raw img tags in built HTML | VERIFIED | `grep -r '<img ' dist/` returns 0 matches |
| 8 | No render-blocking fonts | VERIFIED | No `fonts.googleapis.com` in source; system font stack only; zero `@font-face` in global.css |
| 9 | og:image uses absolute URL for social crawlers | VERIFIED | `new URL(image, Astro.site).toString()` in BaseHead.astro line 10; built output confirms absolute URL on all pages — gap closed |
| 10 | All tap targets ≥44x44px | VERIFIED | Nav desktop (`min-h-[44px]`), mobile (`py-3`), icon buttons (`p-3`), footer (`py-3 inline-flex`), PostNavigation (`min-h-[44px]`), form buttons (`min-h-[44px]`), contact social links (`py-3`) — all confirmed in built HTML — gap closed |
| 11 | aria-label contracts match UI-SPEC | VERIFIED | `aria-label="Toggle dark mode"` and `aria-label="Open navigation menu"` confirmed in built HTML; no `mobile-theme-toggle` redundancy — regression confirmed absent |
| 12 | Lighthouse ≥90 all four categories | NEEDS HUMAN | All code preconditions satisfied; actual scores require manual Lighthouse run in Chrome DevTools |
| 13 | Layout correct at 375px, 768px, 1280px | NEEDS HUMAN | Responsive CSS confirmed (max-w-4xl, px-4, md:/lg: prefixes); visual correctness requires browser testing |
| 14 | SEO-09: Font loading policy matches requirement text | VERIFIED | REQUIREMENTS.md SEO-09 updated to match system font implementation — requirement text and code now agree — gap closed |

**Score:** 12/14 truths fully verified (2 need human testing, 0 gaps)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/BaseHead.astro` | OG/canonical/RSS meta with absolute image URL | VERIFIED | `imageURL = new URL(image, Astro.site).toString()` at line 10; `og:image` and `twitter:image` both use `{imageURL}` |
| `src/components/ArticleJsonLd.astro` | BlogPosting JSON-LD using set:html | VERIFIED | `set:html={JSON.stringify(schema)}` confirmed; unescaped JSON in built output |
| `src/pages/rss.xml.js` | RSS endpoint with draft filter | VERIFIED | `data.draft !== true` filter; `context.site` used; 2 published posts in feed |
| `public/robots.txt` | Permissive crawl + sitemap URL | VERIFIED | Correct content confirmed |
| `public/og-default.png` | OG image placeholder | VERIFIED (stub) | 1x1 white PNG placeholder — known pre-launch stub |
| `astro.config.mjs` | sitemap() integration, site URL | VERIFIED | `integrations: [sitemap()]`, `site: "https://dawoodkamar.com"` |
| `src/layouts/BaseLayout.astro` | BaseHead wired, named head slot | VERIFIED | `<BaseHead {title} {description} />` and `<slot name="head" />` present in `<head>` |
| `src/pages/blog/[id].astro` | ArticleJsonLd wired via slot="head" | VERIFIED | `<ArticleJsonLd slot="head" .../>` confirmed; JSON-LD in `<head>` of built pages |
| `src/components/Navigation.astro` | 44px tap targets, correct aria-labels, no mobile duplicate toggle | VERIFIED | `min-h-[44px]` desktop links, `py-3` mobile links, `p-3` buttons, `aria-label="Open navigation menu"`, no `mobile-theme-toggle` in output |
| `src/components/Footer.astro` | 44px tap targets on nav/social links | VERIFIED | `py-3 inline-flex items-center` on footer links |
| `src/components/PostNavigation.astro` | 44px tap targets on prev/next | VERIFIED | Both anchors use `min-h-[44px] justify-center` |
| `src/components/NewsletterSignup.astro` | 44px submit button | VERIFIED | `min-h-[44px]` on submit button |
| `src/components/ContactForm.astro` | 44px submit button | VERIFIED | `min-h-[44px]` on submit button |
| `src/pages/contact.astro` | 44px social links in "Find Me Online" | VERIFIED | Both anchors use `py-3` — confirmed in source (lines 17-18) and in built `dist/contact/index.html` — gap closed |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `BaseLayout.astro` | `BaseHead.astro` | import + `<BaseHead {title} {description} />` | WIRED | Confirmed in source and built HTML |
| `BaseLayout.astro` | head slot | `<slot name="head" />` | WIRED | Slot present between BaseHead and ClientRouter |
| `blog/[id].astro` | `ArticleJsonLd.astro` | `slot="head"` | WIRED | JSON-LD appears in `<head>` of built blog post pages |
| `astro.config.mjs` | sitemap | `integrations: [sitemap()]` | WIRED | `dist/sitemap-index.xml` and `dist/sitemap-0.xml` generated |
| `rss.xml.js` | blog collection | `getCollection("blog", draft filter)` | WIRED | RSS contains 2 published posts; draft excluded |
| `BaseHead.astro` | `og:image` | `new URL(image, Astro.site).toString()` | WIRED | `imageURL` resolves to `https://dawoodkamar.com/og-default.png`; confirmed in built HTML on all pages |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `BaseHead.astro` | `canonicalURL` | `new URL(Astro.url.pathname, Astro.site)` | Yes — absolute URL per page | FLOWING |
| `BaseHead.astro` | `imageURL` | `new URL(image, Astro.site).toString()` with default `'/og-default.png'` | Yes — resolves to absolute URL | FLOWING |
| `rss.xml.js` | `posts` | `getCollection("blog", draft filter)` | Yes — 2 live posts | FLOWING |
| `ArticleJsonLd.astro` | `schema` | Props from `[id].astro` via post frontmatter | Yes — per-post data | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| og:image absolute URL on homepage | `grep 'og:image' dist/index.html` | `content="https://dawoodkamar.com/og-default.png"` | PASS |
| twitter:image absolute URL on homepage | `grep 'twitter:image' dist/index.html` | `content="https://dawoodkamar.com/og-default.png"` | PASS |
| og:image absolute URL on blog post | `grep 'og:image' dist/blog/ai-noise/index.html` | `content="https://dawoodkamar.com/og-default.png"` | PASS |
| og:image absolute URL on contact page | `grep 'og:image' dist/contact/index.html` | `content="https://dawoodkamar.com/og-default.png"` | PASS |
| Contact social links use py-3 | Python extract anchor tags from dist/contact/index.html | Both YouTube and LinkedIn anchors have `py-3` class | PASS |
| mobile-theme-toggle absent | `grep 'mobile-theme-toggle' dist/index.html` | No match (exit 1) | PASS |
| Canonical URL on homepage | `grep 'canonical' dist/index.html` | `href="https://dawoodkamar.com/"` | PASS |
| JSON-LD on blog post (unescaped) | `grep '"@type":"BlogPosting"' dist/blog/ai-noise/index.html` | Present with unescaped quotes | PASS |
| Sitemap generated | `ls dist/sitemap-index.xml dist/rss.xml` | Both files exist | PASS |
| Draft excluded from sitemap | `grep 'switzerland' dist/sitemap-0.xml` | No match | PASS |
| Draft excluded from RSS | `grep 'switzerland' dist/rss.xml` | No match | PASS |
| No raw img tags | `grep -r '<img ' dist/ --include="*.html" \| wc -l` | 0 | PASS |
| aria-label on hamburger | Present in dist/index.html | `aria-label="Open navigation menu"` found | PASS |
| aria-label on theme toggle | Present in dist/index.html | `aria-label="Toggle dark mode"` found | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEO-01 | 04-01 | BaseHead with title, description, OG tags, canonical, RSS autodiscovery | SATISFIED | BaseHead.astro confirmed; all tags in built output; og:image now uses absolute URL |
| SEO-02 | 04-01 | Canonical URLs via `new URL(Astro.url.pathname, Astro.site)` | SATISFIED | Canonical is absolute `https://dawoodkamar.com/...` in all built pages |
| SEO-03 | 04-01 | Article JSON-LD using set:html to avoid HTML-escaping | SATISFIED | `set:html={JSON.stringify(schema)}` in ArticleJsonLd.astro; unescaped quotes in built output |
| SEO-04 | 04-01 | @astrojs/sitemap configured; drafts excluded | SATISFIED | sitemap-0.xml has 6 URLs; switzerland-ambition absent |
| SEO-05 | 04-01 | RSS at /rss.xml via @astrojs/rss; explicit draft filter | SATISFIED | rss.xml.js with `data.draft !== true`; 2 published posts in feed |
| SEO-06 | 04-01 | public/robots.txt with sitemap reference | SATISFIED | robots.txt: correct content confirmed |
| SEO-07 | 04-02 | All images use `<Image />` from astro:assets; no raw img tags | SATISFIED | Zero `<img>` tags in built HTML confirmed |
| SEO-08 | 04-02 | Hero/above-fold images use loading="eager" and fetchpriority="high" | SATISFIED (no-op) | Hero is text-only; no images to apply attributes to |
| SEO-09 | 04-03 | No render-blocking fonts — system font stack used | SATISFIED | REQUIREMENTS.md updated to match implementation; no font-face, no Google Fonts in source |
| SEO-10 | 04-02 | Lighthouse ≥90 on all four categories | NEEDS HUMAN | Code preconditions met; actual scores require manual Lighthouse run |
| RESP-01 | 04-02 | Fully usable at 375px, 768px, 1280px | NEEDS HUMAN | Responsive CSS structure confirmed (max-w-4xl, px-4, md:/lg: prefixes); visual correctness requires browser |
| RESP-02 | 04-02 | No text-xs/text-sm on body-level content | SATISFIED | text-xs and text-sm only on category badges, timestamps, metadata — not body copy |
| RESP-03 | 04-03 | All interactive elements ≥44x44px tap target | SATISFIED | All elements confirmed: nav, footer, form buttons, contact social links all use py-3 or min-h-[44px] |
| RESP-04 | 04-02 | Responsive images (srcset from Image component) | SATISFIED (no-op) | No images in source beyond og-default.png; zero raw img tags |

**Orphaned requirements:** None. All 14 requirements (SEO-01 through SEO-10, RESP-01 through RESP-04) are accounted for across plans 04-01, 04-02, and 04-03.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/NewsletterSignup.astro` | 2 | `// TODO: Confirm Buttondown username is "dawoodkamar"` | Warning | Unresolved TODO; username appears correct but unconfirmed by owner. Does not block functionality. |
| `public/og-default.png` | — | 1x1 white PNG placeholder | Warning | Known pre-launch stub documented in SUMMARY. Social shares will show blank image until replaced with a real 1200x630px branded image. |

No blocker anti-patterns remain.

---

### Human Verification Required

**1. Lighthouse ≥90 Audit (SEO-10)**

**Test:** Run `npm run build && npx serve dist`, open Chrome DevTools, run Lighthouse on homepage (`/`) and one blog post page (e.g., `/blog/ai-noise/`). Enable all four categories: Performance, Accessibility, Best Practices, SEO.
**Expected:** All four categories score ≥90 on both pages.
**Why human:** Lighthouse requires a live HTTP server and headless Chrome. All code preconditions are met: correct aria-labels, tap targets ≥44px on all elements (including contact social links), no raw img tags, no render-blocking fonts, JSON-LD present, canonical and og:image tags absolute.

**2. Responsive Layout Verification (RESP-01)**

**Test:** Open `dist/index.html` via `npx serve dist`. Use Chrome DevTools responsive mode to check at 375px, 768px, and 1280px viewports.
**Expected:** At 375px — hamburger menu visible, single-column layout, no horizontal scroll, all text legible. At 768px — desktop nav links visible, hamburger hidden. At 1280px — full layout within max-w-4xl, footer in single-row layout.
**Why human:** Visual layout correctness, overflow, and readability require a browser rendering engine.

**3. Social Share Preview (og:image)**

**Test:** After deploying to production, validate using Facebook Sharing Debugger (`https://developers.facebook.com/tools/debug/`), Twitter Card Validator, and LinkedIn Post Inspector with the production URL `https://dawoodkamar.com`.
**Expected:** Each platform shows a preview card. Note: the current og-default.png is a 1x1 white placeholder — the URL is now correct and absolute, but the image content will appear blank until replaced with a real 1200x630px branded image. This is an acceptable pre-launch state.
**Why human:** Social crawlers require the URL to be accessible from the internet (deployed). The URL correctness (absolute) is now programmatically verified; the visual quality of the placeholder is a known accepted stub.

---

### Gaps Summary

No programmatic gaps remain. All three gaps from the initial verification are closed:

- Gap 1 (og:image relative URL) — closed by `new URL(image, Astro.site).toString()` in BaseHead.astro.
- Gap 2 (contact social link tap targets) — closed by `py-3` on both anchors in contact.astro.
- Gap 3 (SEO-09 requirement text mismatch) — closed by updating REQUIREMENTS.md SEO-09 to match system font implementation.

The two remaining NEEDS HUMAN items (SEO-10 Lighthouse scores, RESP-01 responsive visual layout) are unchanged from initial verification. They are not regressions — they require a browser/Lighthouse runtime that cannot be replicated programmatically.

---

*Verified: 2026-04-02T12:00:00Z*
*Verifier: Claude (gsd-verifier)*
