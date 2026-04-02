---
phase: 04-seo-polish
verified: 2026-04-02T09:00:00Z
status: gaps_found
score: 10/14 requirements verified
re_verification: false
gaps:
  - truth: "og:image resolves correctly for social crawlers on all pages"
    status: failed
    reason: "og:image and twitter:image are set to the relative path '/og-default.png' in built HTML. OG spec and all major social crawlers (Facebook, Twitter/X, LinkedIn, Slack) require an absolute URL. The relative path will not resolve when crawlers fetch the meta tag from external contexts."
    artifacts:
      - path: "src/components/BaseHead.astro"
        issue: "Default image value is '/og-default.png' (relative). The comment says 'absolute URL' but the default is relative. No URL resolution against Astro.site is applied to the image prop."
    missing:
      - "Resolve image to an absolute URL in BaseHead.astro: use `new URL(image, Astro.site).toString()` when image begins with '/'"
  - truth: "All interactive elements meet 44x44px tap target minimum (RESP-03)"
    status: partial
    reason: "Contact page social links (YouTube, LinkedIn in the 'Find Me Online' section of contact.astro) use 'py-2' (8px top + 8px bottom = 16px padding + ~20px text-sm = ~36px total height) — below the 44px WCAG 2.5.5 minimum. These links were not in the 04-02 plan's scope, which only covered Navigation, Footer, PostNavigation, NewsletterSignup, and ContactForm."
    artifacts:
      - path: "src/pages/contact.astro"
        issue: "YouTube and LinkedIn anchor elements use class 'rounded-lg border border-gray-200 px-4 py-2 text-sm ...' — py-2 gives ~36px total height, not 44px."
    missing:
      - "Change py-2 to py-3 on both social link anchors in contact.astro 'Find Me Online' section"
  - truth: "SEO-09: No render-blocking fonts (requirement as written in REQUIREMENTS.md)"
    status: partial
    reason: "REQUIREMENTS.md SEO-09 states 'Google Fonts loaded with display=swap + preconnect, or via Astro Fonts API'. The implementation uses system fonts with no web font loaded at all. The plan notes explicitly decided system fonts trivially satisfy this, but the requirement as written specifies a web font approach. This is an interpretation discrepancy — the site has no render-blocking fonts (better than required) but does not meet the literal requirement text."
    artifacts:
      - path: "src/styles/global.css"
        issue: "No font declarations present. Requirement says fonts must use display=swap; implementation uses no custom fonts at all."
    missing:
      - "Clarify with site owner: accept system fonts as satisfying SEO-09 (update REQUIREMENTS.md to reflect intent), OR add a web font with display=swap + preconnect as written."
human_verification:
  - test: "Lighthouse ≥90 on all four categories (SEO-10)"
    expected: "Homepage and one blog post page both score ≥90 on Performance, Accessibility, Best Practices, and SEO in Chrome Lighthouse."
    why_human: "Cannot run Lighthouse programmatically without a live server and headless Chrome. Tap target and aria-label fixes are confirmed in code; actual Lighthouse scores can only be measured by running the audit."
  - test: "Responsive layout at 375px, 768px, 1280px (RESP-01)"
    expected: "At 375px: hamburger menu visible, single-column layout, no horizontal overflow, all text readable. At 768px: desktop nav visible, no hamburger. At 1280px: full-width layout within max-w-4xl constraint, footer in single-row layout."
    why_human: "Visual layout correctness at specific breakpoints cannot be verified by code inspection alone. Requires loading dist/index.html in a browser and testing with DevTools responsive mode."
  - test: "og:image displays correctly on social share previews"
    expected: "When a page URL is shared on Twitter/X, LinkedIn, or Facebook, the og:image thumbnail appears. Currently /og-default.png is a 1x1 white placeholder — even after fixing the absolute URL issue, the image will appear blank until replaced with a real 1200x630px branded image."
    why_human: "Social card preview requires testing against each platform's card validator (Twitter Card Validator, Facebook Sharing Debugger, LinkedIn Post Inspector). The 1x1 placeholder is a known stub documented in SUMMARY."
---

# Phase 4: SEO & Polish Verification Report

**Phase Goal:** Every page has correct OG/canonical metadata; sitemap, RSS, and robots.txt are live; Lighthouse ≥90 on all four categories; all tap targets ≥44×44px; layout correct at 375px, 768px, and 1280px.
**Verified:** 2026-04-02T09:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every page has OG title, description, canonical URL | VERIFIED | `dist/index.html`, all 6 built pages contain `og:title`, `og:description`, `og:url`, `canonical` — confirmed in built output |
| 2 | og:image present on all pages | VERIFIED (with caveat) | All pages output `og:image` and `twitter:image` tags; value is `/og-default.png` (relative path — see gap 1) |
| 3 | Sitemap live at /sitemap-index.xml with draft post excluded | VERIFIED | `dist/sitemap-index.xml` points to `sitemap-0.xml`; sitemap-0.xml lists 6 URLs (homepage, blog index, 2 published posts, contact, success); switzerland-ambition (draft:true) correctly excluded |
| 4 | RSS feed live at /rss.xml with draft filter | VERIFIED | `dist/rss.xml` contains 2 published posts (ai-noise, focus-advantage); switzerland-ambition absent; uses `context.site` for URLs |
| 5 | robots.txt live with sitemap reference | VERIFIED | `dist/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://dawoodkamar.com/sitemap-index.xml` |
| 6 | Article JSON-LD on blog post pages (unescaped quotes) | VERIFIED | Both post pages contain `<script type="application/ld+json">` with valid `@type: BlogPosting`; quotes are unescaped (correct `set:html` usage confirmed) |
| 7 | No raw img tags in built HTML | VERIFIED | `grep -r '<img ' dist/` returns zero matches |
| 8 | No render-blocking fonts | VERIFIED | No `fonts.googleapis.com` in any source file; system font stack only; zero `@font-face` declarations in global.css |
| 9 | og:image uses absolute URL for social crawlers | FAILED | Built HTML outputs `content="/og-default.png"` — relative path. Facebook/Twitter/LinkedIn require absolute URL. BaseHead.astro default is `'/og-default.png'` with no URL resolution. |
| 10 | All tap targets ≥44×44px | PARTIAL | Nav desktop links (`min-h-[44px]`), mobile links (`py-3`), icon buttons (`p-3`), footer links (`py-3 inline-flex`), PostNavigation (`min-h-[44px]`), form submit buttons (`min-h-[44px]`) — all PASS. Contact page "Find Me Online" social links use `py-2` (~36px) — FAIL |
| 11 | aria-label contracts match UI-SPEC | VERIFIED | `aria-label="Toggle dark mode"` on both desktop and mobile theme toggle; `aria-label="Open navigation menu"` on hamburger — both confirmed in built output |
| 12 | Lighthouse ≥90 all four categories | NEEDS HUMAN | All code preconditions satisfied; actual scores require a manual Lighthouse run |
| 13 | Layout correct at 375px, 768px, 1280px | NEEDS HUMAN | Responsive CSS structure (max-w-4xl, px-4, md: prefixes) confirmed in source; visual correctness requires browser testing |
| 14 | SEO-09: Font loading policy | PARTIAL | No render-blocking fonts (better than minimum); but REQUIREMENTS.md wording specifies "Google Fonts with display=swap + preconnect" — not matched literally (see requirements coverage gap) |

**Score:** 10/14 truths fully verified (2 need human, 2 have gaps)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/BaseHead.astro` | OG/canonical/RSS meta head fragment | VERIFIED | 32-line file; title, description, canonical, OG, Twitter Card, RSS autodiscovery — all present |
| `src/components/ArticleJsonLd.astro` | BlogPosting JSON-LD using set:html | VERIFIED | Uses `set:html={JSON.stringify(schema)}` — correct; BlogPosting schema with all required fields |
| `src/pages/rss.xml.js` | RSS endpoint with draft filter | VERIFIED | `data.draft !== true` filter present; `context.site` used; sorted by date |
| `public/robots.txt` | Permissive crawl + sitemap URL | VERIFIED | Correct content confirmed |
| `public/og-default.png` | OG image placeholder | VERIFIED (stub) | File exists; 1x1 white PNG placeholder as documented in SUMMARY — known stub |
| `astro.config.mjs` | sitemap() integration, site URL | VERIFIED | `import sitemap from "@astrojs/sitemap"`, `integrations: [sitemap()]`, `site: "https://dawoodkamar.com"` |
| `src/layouts/BaseLayout.astro` | BaseHead wired, named head slot | VERIFIED | `<BaseHead {title} {description} />` and `<slot name="head" />` present in `<head>` |
| `src/pages/blog/[id].astro` | ArticleJsonLd wired via slot="head" | VERIFIED | `<ArticleJsonLd slot="head" .../>` with all required props; SITE_URL used for canonical |
| `src/components/Navigation.astro` | 44px tap targets, correct aria-labels | VERIFIED | Desktop links `min-h-[44px] flex items-center`; mobile links `py-3`; theme toggle `p-3`; hamburger `p-3` with `aria-label="Open navigation menu"` |
| `src/components/Footer.astro` | 44px tap targets on nav/social links | VERIFIED | All footer links use `py-3 inline-flex items-center` |
| `src/components/PostNavigation.astro` | 44px tap targets on prev/next | VERIFIED | Both anchors use `min-h-[44px] justify-center` |
| `src/components/NewsletterSignup.astro` | 44px submit button | VERIFIED | Submit button has `min-h-[44px]` on both compact and full variants |
| `src/components/ContactForm.astro` | 44px submit button | VERIFIED | Submit button has `min-h-[44px]` |
| `src/pages/contact.astro` | 44px social links in "Find Me Online" | FAILED | Social links use `py-2` (~36px total height) — not 44px minimum |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `BaseLayout.astro` | `BaseHead.astro` | import + `<BaseHead {title} {description} />` | WIRED | Confirmed in source and built HTML |
| `BaseLayout.astro` | head slot | `<slot name="head" />` | WIRED | Slot present between BaseHead and ClientRouter |
| `blog/[id].astro` | `ArticleJsonLd.astro` | `slot="head"` | WIRED | JSON-LD appears in `<head>` of built blog post pages |
| `astro.config.mjs` | sitemap | `integrations: [sitemap()]` | WIRED | `dist/sitemap-index.xml` and `dist/sitemap-0.xml` generated |
| `rss.xml.js` | blog collection | `getCollection("blog", draft filter)` | WIRED | RSS contains 2 published posts; draft excluded |
| `BaseHead.astro` | `og:image` | `image` prop default | PARTIAL | Tag emitted but value is relative `/og-default.png`; social crawlers need absolute URL |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `BaseHead.astro` | `canonicalURL` | `new URL(Astro.url.pathname, Astro.site)` — `Astro.site` = `https://dawoodkamar.com` | Yes — full absolute URL | FLOWING |
| `rss.xml.js` | `posts` | `getCollection("blog", draft filter)` | Yes — 2 live posts | FLOWING |
| `ArticleJsonLd.astro` | `schema` | Props from `[id].astro` → post frontmatter | Yes — per-post data | FLOWING |
| `BaseHead.astro` | `image` | Default `'/og-default.png'` (relative) | Static placeholder — no URL resolution | STATIC (gap) |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| OG title in built homepage | `grep 'og:title' dist/index.html` | `content="Dawood Kamar"` found | PASS |
| Canonical URL in built homepage | `grep 'canonical' dist/index.html` | `href="https://dawoodkamar.com/"` — absolute URL | PASS |
| JSON-LD on blog post (unescaped) | `grep '"@type":"BlogPosting"' dist/blog/ai-noise/index.html` | Present with unescaped quotes | PASS |
| Sitemap generated | `cat dist/sitemap-index.xml` | Valid XML with sitemap-0.xml reference | PASS |
| RSS feed has items | `grep -c '<item>' dist/rss.xml` | 1 (RSS wraps all in `<channel>`, 2 items present) | PASS |
| Draft excluded from sitemap | `grep 'switzerland' dist/sitemap-0.xml` | No match | PASS |
| Draft excluded from RSS | `grep 'switzerland' dist/rss.xml` | No match | PASS |
| No raw img tags | `grep -r '<img ' dist/ --include="*.html" \| wc -l` | 0 | PASS |
| No Google Fonts | `grep 'fonts.googleapis.com' src/styles/global.css src/components/BaseHead.astro` | No match | PASS |
| aria-label on hamburger | `grep 'aria-label="Open navigation menu"' dist/index.html` | Found | PASS |
| aria-label on theme toggle | `grep 'aria-label="Toggle dark mode"' dist/index.html` | Found | PASS |
| og:image URL is absolute | `grep 'og:image' dist/index.html` | `content="/og-default.png"` — RELATIVE | FAIL |
| Contact social links tap target | `grep 'py-2' src/pages/contact.astro` in social links | `py-2` found on YouTube/LinkedIn | FAIL |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEO-01 | 04-01 | BaseHead with title, description, OG tags, canonical, RSS autodiscovery | SATISFIED | BaseHead.astro confirmed; all tags in built output |
| SEO-02 | 04-01 | Canonical URLs via `new URL(Astro.url.pathname, Astro.site)` | SATISFIED | Canonical is absolute `https://dawoodkamar.com/...` in all built pages |
| SEO-03 | 04-01 | Article JSON-LD using set:html to avoid HTML-escaping | SATISFIED | `set:html={JSON.stringify(schema)}` in ArticleJsonLd.astro; unescaped quotes in built output |
| SEO-04 | 04-01 | @astrojs/sitemap configured; drafts excluded | SATISFIED | sitemap-0.xml has 6 URLs; switzerland-ambition absent |
| SEO-05 | 04-01 | RSS at /rss.xml via @astrojs/rss; explicit draft filter | SATISFIED | rss.xml.js with `data.draft !== true`; 2 published posts in feed |
| SEO-06 | 04-01 | public/robots.txt with sitemap reference | SATISFIED | robots.txt confirmed with correct content |
| SEO-07 | 04-02 | All images use `<Image />` from astro:assets; no raw img tags | SATISFIED | Zero `<img>` tags in built HTML confirmed |
| SEO-08 | 04-02 | Hero/above-fold images use loading="eager" and fetchpriority="high" | SATISFIED (no-op) | Hero is text-only; no images to apply attributes to; confirmed by audit |
| SEO-09 | 04-02 | Google Fonts with display=swap + preconnect, or Astro Fonts API | BLOCKED (interpretation gap) | REQUIREMENTS.md wording specifies a web font approach; implementation chose system fonts instead. System fonts mean zero render-blocking risk (better outcome) but does not match requirement text literally. Needs owner decision to either update REQUIREMENTS.md or add a font. |
| SEO-10 | 04-02 | Lighthouse ≥90 on all four categories | NEEDS HUMAN | Code preconditions met (aria-labels, tap targets, no render-blocking fonts, no raw img); actual scores require manual Lighthouse run in Chrome DevTools |
| RESP-01 | 04-02 | Fully usable at 375px, 768px, 1280px | NEEDS HUMAN | Responsive CSS structure confirmed (max-w-4xl, px-4, md:/lg: prefixes); visual correctness requires browser |
| RESP-02 | 04-02 | No text-xs/text-sm on body-level content | SATISFIED | text-xs and text-sm only on category badges, timestamps, metadata — not body copy |
| RESP-03 | 04-02 | All interactive elements ≥44×44px tap target | BLOCKED | Nav, Footer, PostNavigation, form buttons all pass; contact.astro social links ("Find Me Online") use py-2 (~36px) |
| RESP-04 | 04-02 | Responsive images (srcset from Image component) | SATISFIED (no-op) | No images in source beyond og-default.png placeholder; no raw img tags; text-only posts |

**Orphaned requirements check:** All 14 requirements (SEO-01 through SEO-10, RESP-01 through RESP-04) are covered by plans 04-01 and 04-02. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/BaseHead.astro` | 5, 8 | Comment says "absolute URL" but default value is relative `/og-default.png` | Blocker | og:image is relative — Facebook, Twitter/X, LinkedIn crawlers will not resolve it; social previews broken until fixed |
| `src/components/NewsletterSignup.astro` | 2 | `// TODO: Confirm Buttondown username is "dawoodkamar"` | Warning | Unresolved TODO comment; username appears correct but is unconfirmed by owner |
| `public/og-default.png` | — | 1x1 white PNG placeholder | Warning | Known stub documented in SUMMARY; social shares will show blank image until replaced with real 1200x630px branded image |
| `src/pages/contact.astro` | 17-18 | Social links use `py-2` (36px effective tap height) | Blocker | RESP-03 violation — contact page "Find Me Online" links do not meet 44px minimum |

---

### Human Verification Required

**1. Lighthouse ≥90 Audit (SEO-10)**

**Test:** Run `npm run build && npx serve dist`, open Chrome DevTools, run Lighthouse on homepage (`/`) and one blog post page (e.g., `/blog/ai-noise/`). Enable all four categories: Performance, Accessibility, Best Practices, SEO.
**Expected:** All four categories score ≥90 on both pages.
**Why human:** Lighthouse requires a live HTTP server and headless Chrome; cannot run programmatically in this context. All code preconditions are met (correct aria-labels, tap targets ≥44px on most elements, no raw img, no render-blocking fonts, JSON-LD present, canonical tags present).

**2. Responsive Layout Verification (RESP-01)**

**Test:** Open `dist/index.html` via `npx serve dist`. Use Chrome DevTools responsive mode to check at 375px, 768px, and 1280px viewports.
**Expected:** At 375px — hamburger menu visible, single-column layout, no horizontal scroll, all text legible. At 768px — desktop nav links visible, hamburger hidden. At 1280px — full layout within max-w-4xl, footer in single-row layout.
**Why human:** Visual layout correctness, overflow, and readability require a browser rendering engine.

**3. Social Share Preview (og:image)**

**Test:** After fixing the og:image to absolute URL (gap 1), validate using Facebook Sharing Debugger (`https://developers.facebook.com/tools/debug/`), Twitter Card Validator, and LinkedIn Post Inspector with the production URL.
**Expected:** Each platform shows a preview card with the og:image thumbnail.
**Why human:** Social crawlers require the URL to be accessible from the internet (needs to be deployed). The current 1x1 placeholder will show as a blank image even with the correct absolute URL — this is acceptable as a known stub pre-launch.

---

### Gaps Summary

Three issues block full goal achievement:

**Gap 1 — og:image relative URL (SEO-01 partially blocked):** `BaseHead.astro` emits `og:image` and `twitter:image` with the value `/og-default.png` — a relative path. All major social crawlers require an absolute URL for the OG image to resolve. Fix: in `BaseHead.astro`, resolve the image prop to absolute using `new URL(image, Astro.site).toString()` when the value starts with `/`. This is a one-line fix.

**Gap 2 — Contact page social links tap target (RESP-03 partially blocked):** The YouTube and LinkedIn anchors in `src/pages/contact.astro` (lines 17-18) use `py-2` padding, giving approximately 36px effective height — below the 44px WCAG 2.5.5 minimum. The 04-02 plan did not include this file in its scope. Fix: change `py-2` to `py-3` on both anchors in contact.astro.

**Gap 3 — SEO-09 requirement interpretation (requires owner decision):** `REQUIREMENTS.md` SEO-09 specifies "Google Fonts loaded with display=swap + preconnect, or via Astro Fonts API." The implementation intentionally uses system fonts — zero render-blocking risk, which is the better technical outcome. However, the requirement text is not literally met. This requires a decision: either update `REQUIREMENTS.md` to read "No render-blocking fonts — system font stack or web fonts with display=swap" to match intent, or add a web font. No code change is needed if the owner accepts system fonts.

---

*Verified: 2026-04-02T09:00:00Z*
*Verifier: Claude (gsd-verifier)*
