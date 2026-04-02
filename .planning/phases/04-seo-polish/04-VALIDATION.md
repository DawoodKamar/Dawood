---
phase: 4
slug: seo-polish
created: 2026-04-02
---

# Phase 4: SEO & Polish — Validation Architecture

## Framework

| Property | Value |
|----------|-------|
| Framework | None installed (no vitest.config.*, jest.config.*, or test files) |
| Config file | None |
| Quick run command | `npm run build` (build-time validation) |
| Full suite command | `npm run build` + smoke grep checks below |

No unit test framework is needed for this phase — all validation is build-time smoke checks and manual Lighthouse audits. This is appropriate for a static site with no business logic.

---

## Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| SEO-01 | Every page has title, description, og:title, og:description, og:image, canonical | smoke | `npm run build && grep -r 'og:title' dist/` | Count must ≥ page count |
| SEO-02 | Canonical URLs use Astro.site (https://dawoodkamar.com) | smoke | `npm run build && grep 'canonical' dist/index.html` | Must show full domain |
| SEO-03 | BlogPosting JSON-LD on post pages, no escaping errors | smoke | `npm run build && grep '"@type":"BlogPosting"' dist/blog/*/index.html` | Must NOT show `&quot;` |
| SEO-04 | /sitemap-index.xml accessible; no draft slugs | smoke | `npm run build && cat dist/sitemap-index.xml` | switzerland-ambition must not appear |
| SEO-05 | /rss.xml accessible with published posts only | smoke | `npm run build && cat dist/rss.xml` | Only ai-noise and focus-advantage items |
| SEO-06 | /robots.txt references sitemap URL | smoke | `npm run build && cat dist/robots.txt` | Must show Sitemap: https://dawoodkamar.com/sitemap-index.xml |
| SEO-07 | No raw `<img>` tags in built HTML | smoke | `npm run build && grep -r '<img ' dist/ --include="*.html"` | Expect zero matches |
| SEO-08 | Hero images have loading="eager" | smoke | `npm run build && grep 'fetchpriority' dist/index.html` | No-op if hero is text-only |
| SEO-09 | No render-blocking fonts | smoke | `grep 'fonts.googleapis.com' src/styles/global.css src/components/BaseHead.astro` | Expect zero matches (system fonts) |
| SEO-10 | Lighthouse ≥90 all categories | manual | Lighthouse CLI or DevTools | Homepage + one blog post |
| RESP-01 | Usable at 375px, 768px, 1280px | manual | Browser DevTools responsive mode | No horizontal overflow at 375px |
| RESP-02 | 16px minimum body text | smoke | `npm run build && grep -r 'text-xs\|text-sm' dist/*.html dist/blog/index.html 2>/dev/null \| grep -v 'category\|badge\|label\|meta\|time\|date\|reading'` | Any match = body copy regression |
| RESP-03 | 44×44px tap targets | smoke + manual | `grep 'aria-label="Toggle dark mode"' dist/index.html` + Lighthouse Accessibility | Both aria-labels must be present |
| RESP-04 | Responsive images | smoke | `npm run build && grep 'srcset' dist/blog/*/index.html` | Informational if posts are text-only |

---

## Sampling Rate

| Gate | Commands |
|------|----------|
| Per task commit | `npm run build` — confirms no build errors |
| Per plan completion | `npm run build` + all smoke commands for that plan's requirements |
| Phase gate | All smoke commands pass + manual Lighthouse ≥90 + manual responsive check before `/gsd:verify-work` |

---

## Wave 0 Gaps

None. No unit test infrastructure is installed or needed. Build pipeline (`npm run build`) covers all automated validation. Manual steps are:
1. Lighthouse audit at the end of Plan 04-02 (SEO-10)
2. Browser responsive check at 375/768/1280px (RESP-01)

Both are documented in Plan 04-02 Task 2 Step 6 and the Smoke Checks section.

---

## Full Smoke Check Suite

```bash
# Plan 04-01 checks
npm run build

grep -r 'og:title' dist/ --include="*.html" | wc -l
# Expect: ≥ number of pages (5+ pages)

grep 'canonical' dist/index.html
# Expect: <link rel="canonical" href="https://dawoodkamar.com/">

grep 'application/ld+json' dist/blog/*/index.html
grep '"@type":"BlogPosting"' dist/blog/*/index.html
# Expect: both match on every blog post page; no &quot; present

cat dist/sitemap-index.xml
# Expect: valid XML; no switzerland-ambition slug

cat dist/rss.xml
# Expect: <title>Dawood Kamar</title>; items present; no draft posts

cat dist/robots.txt
# Expect: User-agent: *, Allow: /, Sitemap: https://dawoodkamar.com/sitemap-index.xml

# Plan 04-02 checks
grep -r '<img ' dist/ --include="*.html"
# Expect: zero matches

grep 'fonts.googleapis.com' src/styles/global.css src/components/BaseHead.astro 2>/dev/null
# Expect: zero matches

grep 'aria-label="Toggle dark mode"' dist/index.html
grep 'aria-label="Open navigation menu"' dist/index.html
# Expect: both match
```
