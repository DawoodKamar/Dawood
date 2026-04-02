# Phase 4: SEO & Polish - Research

**Researched:** 2026-04-02
**Domain:** Astro 5 SEO integrations, metadata, structured data, Lighthouse performance
**Confidence:** HIGH

---

## Summary

Phase 4 completes the site by adding all SEO metadata, structured data, crawlability infrastructure, and performance polish. The project is an Astro 5.17.0 static site with Tailwind v4 — Phases 1-3 are complete and the site builds cleanly. No `public/` directory exists yet; it needs to be created. Neither `@astrojs/sitemap` nor `@astrojs/rss` are installed yet.

The work splits cleanly into two tracks: Plan 04-01 is pure metadata/integration work (BaseHead, JSON-LD, sitemap, RSS, robots.txt), and Plan 04-02 is Lighthouse performance work (Image component adoption, font loading, CLS fixes, responsive verification). The key insight for 04-01 is that since draft posts are already excluded from `getStaticPaths`, they are never built and therefore never appear in the auto-generated sitemap — no explicit filter is needed for drafts in the sitemap config. For RSS, drafts must be explicitly filtered in the feed endpoint.

**Primary recommendation:** Use Astro's native tooling exclusively — `@astrojs/sitemap`, `@astrojs/rss`, `astro:assets Image`, and the built-in `fontProviders` API from `astro/config`. Do not hand-roll any of these.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | `BaseHead.astro` with title, description, OG tags, canonical URL | Canonical pattern `new URL(Astro.url.pathname, Astro.site)` verified; official blog example confirms exact API |
| SEO-02 | Canonical URLs via `new URL(Astro.url.pathname, Astro.site)`; SITE_URL fallback in config.ts | `Astro.site` is set to `https://dawoodkamar.com` in astro.config.mjs; SITE_URL already exported from src/config.ts |
| SEO-03 | Article JSON-LD with `set:html` directive on script tag | `<script type="application/ld+json" set:html={JSON.stringify(schema)} />` pattern confirmed; avoids double-escaping |
| SEO-04 | `@astrojs/sitemap` with draft filter | Drafts excluded from build by getStaticPaths — sitemap auto-excludes them; no explicit filter needed |
| SEO-05 | RSS feed at /rss.xml via `@astrojs/rss` excluding drafts | `src/pages/rss.xml.js` with `getCollection` filtered by `data.draft !== true` |
| SEO-06 | `public/robots.txt` referencing sitemap URL | Static file in `public/` dir; no public/ dir exists yet — must create |
| SEO-07 | All images use `<Image />` from `astro:assets` | No raw `<img>` tags found in src/ — site currently has no images in Astro pages; hero is text-only |
| SEO-08 | Hero images use `loading="eager"` and `fetchpriority="high"` | Verified as valid `<Image />` props in astro:assets |
| SEO-09 | Google Fonts with `display=swap` + preconnect or Astro Fonts API | `fontProviders` confirmed in Astro 5.17.0 node_modules; `fonts` is a top-level (non-experimental) config key |
| SEO-10 | Lighthouse ≥90 on all categories on homepage and blog post | Image optimization + font loading are the two main levers for this score |
| RESP-01 | Mobile-first at 375px, 768px, 1280px | Tailwind's responsive prefixes (sm:, md:, lg:) already used throughout; requires manual audit |
| RESP-02 | Minimum 16px body text at all breakpoints | Tailwind default base is 16px; verify no text-sm/text-xs on body content |
| RESP-03 | Touch targets min 44×44px | Buttons/links need min-h-[44px] min-w-[44px] or equivalent; requires audit |
| RESP-04 | Responsive images | `<Image />` from astro:assets handles srcset generation automatically |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @astrojs/sitemap | 3.7.2 | Generates sitemap-index.xml + sitemap-0.xml | Official Astro integration; zero config for static sites |
| @astrojs/rss | 4.0.18 | Generates /rss.xml feed | Official Astro integration; works directly with content collections |
| astro:assets Image | built-in (Astro 5.17.0) | Optimized images with CLS prevention | No install needed; automatic srcset, WebP, width/height inference |
| fontProviders (astro/config) | built-in (Astro 5.17.0) | Google Fonts with self-hosting + preloads | No install needed; confirmed present in installed node_modules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro:assets getImage | built-in | Programmatic image URL for OG image src | When passing image URL to BaseHead as a string (og:image) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fontProviders` API | Manual `<link rel="preconnect">` + Google Fonts URL | Manual approach works but requires hand-crafting display=swap URL and preconnect tags; fontProviders self-hosts the font for better privacy and eliminates third-party latency |
| `@astrojs/sitemap` | Hand-rolled sitemap endpoint | Custom endpoint requires maintaining URL list and XML template; sitemap integration handles this automatically with zero maintenance |

**Installation:**
```bash
npm install @astrojs/sitemap @astrojs/rss
```

**Version verification (run before writing plans):**
```bash
npm view @astrojs/sitemap version   # 3.7.2 (verified 2026-04-02)
npm view @astrojs/rss version       # 4.0.18 (verified 2026-04-02)
```

---

## Architecture Patterns

### Recommended Project Structure additions for Phase 4
```
src/
├── components/
│   ├── BaseHead.astro        # NEW — title, description, OG tags, canonical, RSS link
│   └── ArticleJsonLd.astro   # NEW — BlogPosting JSON-LD, used only on [id].astro
├── pages/
│   └── rss.xml.js            # NEW — RSS feed endpoint
public/
└── robots.txt                # NEW — must create public/ dir first
```

### Pattern 1: BaseHead Component
**What:** A reusable `<head>` fragment component that every page includes. Replaces the ad-hoc `<title>` and `<meta name="description">` currently in BaseLayout.astro.
**When to use:** Every page via BaseLayout.astro

```astro
---
// src/components/BaseHead.astro
// Source: https://github.com/withastro/astro/blob/main/examples/blog/src/components/BaseHead.astro

interface Props {
  title: string;
  description: string;
  image?: string;  // absolute URL for og:image
}

const { title, description, image = '/og-default.png' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href={canonicalURL} />
<title>{title}</title>
<meta name="description" content={description} />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
{image && <meta property="og:image" content={image} />}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{image && <meta name="twitter:image" content={image} />}

<!-- RSS autodiscovery -->
<link rel="alternate" type="application/rss+xml" title="Dawood Kamar" href="/rss.xml" />
```

**Integration point:** BaseLayout.astro currently has `<title>` and `<meta name="description">` inline. Replace those with `<BaseHead {title} {description} />`.

### Pattern 2: ArticleJsonLd Component
**What:** Injects `BlogPosting` JSON-LD into blog post pages only. Uses `set:html` to avoid double HTML-encoding of quotes/special chars.
**When to use:** Only on `src/pages/blog/[id].astro`

```astro
---
// src/components/ArticleJsonLd.astro
interface Props {
  title: string;
  description: string;
  publishDate: Date;
  url: string;
  authorName: string;
}
const { title, description, publishDate, url, authorName } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description: description,
  datePublished: publishDate.toISOString(),
  url: url,
  author: {
    "@type": "Person",
    name: authorName,
  },
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

**CRITICAL:** Must use `set:html` not `{JSON.stringify(schema)}` — Astro HTML-escapes `{}` expressions which produces invalid JSON (`&quot;` instead of `"`). `set:html` bypasses escaping.

### Pattern 3: sitemap configuration
**What:** Add `@astrojs/sitemap` to astro.config.mjs integrations.

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: "static",
  site: "https://dawoodkamar.com",
  integrations: [sitemap()],   // No filter needed — drafts excluded from build
  // ...
});
```

**Key insight:** Since `getStaticPaths` already filters drafts with `import.meta.env.PROD ? data.draft !== true : true`, draft pages are never built and therefore never appear in the sitemap. No explicit `filter` callback required.

Generated files: `/sitemap-index.xml` (index) + `/sitemap-0.xml` (entries).

### Pattern 4: RSS Feed Endpoint
**What:** `src/pages/rss.xml.js` — Astro endpoint that returns XML response.

```javascript
// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../config';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE_TITLE,
    description: 'Writing on AI, focus, and building a meaningful career.',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

### Pattern 5: Font Loading via fontProviders API
**What:** Register Google Fonts in astro.config.mjs; use `<Font />` component in BaseHead.

```javascript
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [{
    name: 'Inter',
    cssVariable: '--font-inter',
    provider: fontProviders.google(),
    weights: [400, 500, 600, 700],
    styles: ['normal'],
  }],
  // ...
});
```

```astro
---
// In BaseHead.astro
import { Font } from 'astro:assets';
---
<Font cssVariable="--font-inter" preload />
```

**Note:** If the site currently uses system fonts (no Google Fonts), SEO-09 is trivially satisfied by confirming no render-blocking font requests. Audit the current `global.css` and BaseLayout.astro before deciding whether to add fonts.

### Pattern 6: robots.txt
**What:** Static file at `public/robots.txt`. Must reference sitemap URL.

```
User-agent: *
Allow: /

Sitemap: https://dawoodkamar.com/sitemap-index.xml
```

**Note:** `public/` directory does not exist yet. Create it as part of this plan.

### Anti-Patterns to Avoid
- **`{JSON.stringify(schema)}` in script tag:** Astro HTML-escapes `{}` expressions — quotes become `&quot;`, making the JSON invalid. Always use `set:html`.
- **Putting SEO tags in BaseLayout.astro directly:** BaseLayout currently has inline title/description; refactoring to BaseHead is cleaner and the correct pattern for phase 4.
- **Hard-coding canonical URLs as strings:** Always use `new URL(Astro.url.pathname, Astro.site)` — it handles trailing slashes, encodes special characters, and uses the production domain from config.
- **Using `<img>` instead of `<Image />`:** Raw `<img>` tags produce no srcset, no WebP conversion, and no width/height inference, causing CLS.
- **Loading fonts from `@import url(google.com)` in CSS:** Adds a render-blocking third-party request. Use the `fontProviders` API which self-hosts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML endpoint with URL list | `@astrojs/sitemap` | Handles pagination (45k limit), lastmod, priority, changefreq, index format |
| RSS XML generation | Custom XML template | `@astrojs/rss` | Handles correct pubDate format, CDATA wrapping, feed validation |
| Image optimization | Manual srcset/WebP conversion | `astro:assets Image` | Built-in: srcset, WebP, AVIF, width/height inference, CLS prevention |
| JSON-LD escaping | Custom sanitizer | `set:html` directive | Astro's `set:html` is the correct bypass for script content |

**Key insight:** All four of these have well-known edge cases (XML escaping, date format RFC 822 vs ISO 8601, image format negotiation, JSON-in-HTML escaping) that the official integrations handle correctly out of the box.

---

## Common Pitfalls

### Pitfall 1: JSON-LD Double-Escaping
**What goes wrong:** Using `{JSON.stringify(schema)}` inside `<script type="application/ld+json">` produces `&quot;` instead of `"`, rendering the JSON unparseable. Google's Rich Results Test will report errors.
**Why it happens:** Astro HTML-escapes all `{}` expression values by default for XSS safety.
**How to avoid:** Always use `set:html`: `<script type="application/ld+json" set:html={JSON.stringify(schema)} />`
**Warning signs:** Rich Results Test shows "Invalid JSON" or escaping errors.

### Pitfall 2: Sitemap Missing `site` in astro.config.mjs
**What goes wrong:** `@astrojs/sitemap` throws a build error or generates relative URLs in the sitemap (invalid).
**Why it happens:** The integration requires `site` to be set in astro.config.mjs with a full `https://` URL.
**How to avoid:** `site: "https://dawoodkamar.com"` is already in astro.config.mjs — verify it remains after adding integrations array.
**Warning signs:** Build error: "The 'site' configuration option is required for the sitemap integration."

### Pitfall 3: RSS `context.site` is undefined in `getStaticPaths`
**What goes wrong:** If `site` is not set in Astro config, `context.site` is undefined and RSS item URLs are relative.
**Why it happens:** `site` config was set correctly — this is a non-issue here but worth checking.
**How to avoid:** Use `context.site` (from the GET function parameter) not `import.meta.env.SITE` for the RSS `site` option.
**Warning signs:** RSS validator reports relative links.

### Pitfall 4: CLS from Images with Unknown Dimensions
**What goes wrong:** Images without explicit width/height (or without local import) cause layout shift as they load, hurting CLS Lighthouse score.
**Why it happens:** Browser doesn't reserve space before image loads without known aspect ratio.
**How to avoid:** Use `<Image />` from `astro:assets` with local imports — dimensions are inferred automatically. For remote images, specify explicit `width` and `height`.
**Warning signs:** Lighthouse CLS score > 0.1.

### Pitfall 5: Font Render-Blocking
**What goes wrong:** Google Fonts loaded via CSS `@import` block rendering until font file downloads.
**Why it happens:** Browser waits for CSS (including @import) to finish parsing before painting.
**How to avoid:** Use `fontProviders` API (self-hosted) OR use `<link rel="preconnect">` + `<link rel="stylesheet">` with `display=swap` in URL. The fontProviders approach is simpler and more performant.
**Warning signs:** Lighthouse flags "Eliminate render-blocking resources."

### Pitfall 6: `public/` Directory Does Not Exist
**What goes wrong:** `robots.txt` placed in project root instead of `public/` is not served by Astro.
**Why it happens:** `public/` does not exist in the current project structure (verified).
**How to avoid:** Create `public/robots.txt` — Astro serves everything in `public/` as static files at the root.
**Warning signs:** `curl https://dawoodkamar.com/robots.txt` returns 404.

### Pitfall 7: Responsive Touch Targets
**What goes wrong:** Navigation links and buttons are smaller than 44×44px on mobile, failing WCAG 2.5.5 and Lighthouse accessibility.
**Why it happens:** Default `<a>` links have only their text content as tap target.
**How to avoid:** Audit Navigation.astro, footer links, and all CTAs. Add `min-h-[44px] flex items-center` or padding to ensure tap target size.
**Warning signs:** Lighthouse Accessibility score below 90, axe-core reports "Target size" violations.

---

## Code Examples

### Canonical URL Generation
```astro
---
// Source: https://docs.astro.build/en/reference/api-reference/
// Pattern confirmed in Astro official blog example
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<link rel="canonical" href={canonicalURL} />
```

### Image with CLS Prevention (above-fold)
```astro
---
// Source: https://docs.astro.build/en/guides/images/
import { Image } from 'astro:assets';
import heroImg from '../assets/hero.jpg';
---
<Image src={heroImg} alt="Description" loading="eager" fetchpriority="high" />
```

### Image in Markdown (automatically optimized)
Astro 5 processes markdown images through `astro:assets` automatically when images are in `src/`. No extra config needed.

### RSS Feed with Draft Filter
```javascript
// Source: https://docs.astro.build/en/guides/rss/
const posts = await getCollection('blog', ({ data }) => data.draft !== true);
```

### Sitemap Integration (minimal — drafts auto-excluded)
```javascript
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from '@astrojs/sitemap';
// In defineConfig:
integrations: [sitemap()],
```

### Font API (Astro 5.17 — confirmed in node_modules)
```javascript
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';
// In defineConfig:
fonts: [{
  name: 'Inter',
  cssVariable: '--font-inter',
  provider: fontProviders.google(),
  weights: [400, 500, 600, 700],
  styles: ['normal'],
}],
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<ViewTransitions />` | `<ClientRouter />` from `astro:transitions` | Astro 4.x → 5.x | Already using correct API (Phase 2 decision) |
| `@astrojs/tailwind` | `@tailwindcss/vite` | Astro 5.2 | Already using correct approach (Phase 1 decision) |
| `post.render()` | standalone `render()` from `astro:content` | Astro 5 content layer | Already using correct API (Phase 1 decision) |
| Manual font `<link>` tags | `fontProviders` API + `<Font />` | Astro 5.7+ | New: self-hosts fonts, adds preloads automatically |
| `src/content/config.ts` | `src/content.config.ts` | Astro 5 | Already using correct path (Phase 1 decision) |

**Deprecated/outdated:**
- `Astro.canonicalURL`: Removed in Astro 3. Use `new URL(Astro.url.pathname, Astro.site)` instead.
- `pagesGlobToRssItems()` from `@astrojs/rss`: Still works but only for file-based pages, not content collections. Use `getCollection()` mapped to items.

---

## Open Questions

1. **Does the site use any custom font currently?**
   - What we know: No `@import` or `<link>` to Google Fonts found in `global.css` or any layout. The site uses system fonts.
   - What's unclear: Whether adding a Google Font is desired for the final design, or whether the system font stack satisfies SEO-09 (which only requires `display=swap` IF fonts are loaded).
   - Recommendation: If no font is being loaded, SEO-09 is trivially satisfied. If a font IS desired, use the `fontProviders` API. Plan should audit this and only add font loading if the design requires it.

2. **OG image — does a default image exist?**
   - What we know: No `public/` directory exists. No OG default image is present in the project.
   - What's unclear: Whether a static OG image (e.g., `public/og-default.png`) should be created, or whether og:image can be omitted initially.
   - Recommendation: Plan 04-01 should create a minimal `public/og-default.png` (even a 1200×630 placeholder) so og:image is always populated. Advanced OG image generation (satori) is explicitly deferred to v2 per REQUIREMENTS.md.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, astro build | Yes | v22.22.2 | — |
| @astrojs/sitemap | SEO-04 | Not installed | (3.7.2 on registry) | None — must install |
| @astrojs/rss | SEO-05 | Not installed | (4.0.18 on registry) | None — must install |
| astro:assets Image | SEO-07, RESP-04 | Yes (built-in) | Astro 5.17.0 | — |
| fontProviders (astro/config) | SEO-09 | Yes (built-in) | Astro 5.17.0 | Manual preconnect + link |
| public/ directory | SEO-06 | Does not exist | — | Create it |

**Missing dependencies with no fallback:**
- `@astrojs/sitemap` — must be installed before build
- `@astrojs/rss` — must be installed before build
- `public/` directory — must be created for robots.txt to be served

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no vitest.config.*, jest.config.*, or test files found) |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run build` (build-time validation — no unit test framework) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | Every page has title, description, og:title, og:description, og:image, canonical | smoke — view page source after build | `npm run build && grep -r 'og:title' dist/` | N/A (CLI check) |
| SEO-02 | Canonical URLs use Astro.site (https://dawoodkamar.com) | smoke | `npm run build && grep 'canonical' dist/index.html` | N/A |
| SEO-03 | BlogPosting JSON-LD on post pages, no escaping errors | smoke | `npm run build && grep 'application/ld+json' dist/blog/*/index.html` | N/A |
| SEO-04 | /sitemap-index.xml accessible; no draft slugs | smoke | `npm run build && cat dist/sitemap-index.xml` | N/A |
| SEO-05 | /rss.xml accessible with published posts only | smoke | `npm run build && cat dist/rss.xml` | N/A |
| SEO-06 | /robots.txt references sitemap URL | smoke | `npm run build && cat dist/robots.txt` | N/A |
| SEO-07 | No raw `<img>` tags in built HTML | smoke | `npm run build && grep -r '<img ' dist/ --include="*.html"` | N/A |
| SEO-08 | Hero images have loading="eager" | smoke | `npm run build && grep 'fetchpriority' dist/index.html` | N/A |
| SEO-09 | No render-blocking fonts | manual | Lighthouse DevTools audit | manual |
| SEO-10 | Lighthouse ≥90 all categories | manual | Lighthouse CLI or DevTools | manual |
| RESP-01 | Usable at 375px, 768px, 1280px | manual | Browser DevTools responsive mode | manual |
| RESP-02 | 16px minimum body text | smoke | `npm run build && grep 'text-xs\|text-sm' dist/*.html` | N/A |
| RESP-03 | 44×44px tap targets | manual | Lighthouse Accessibility + DevTools | manual |
| RESP-04 | Responsive images | smoke | `npm run build && grep 'srcset' dist/blog/*/index.html` | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` — confirms no build errors
- **Per wave merge:** `npm run build` + smoke grep checks above
- **Phase gate:** `npm run build` clean + all smoke checks pass + manual Lighthouse ≥90 before `/gsd:verify-work`

### Wave 0 Gaps
- No unit test framework is installed or needed for this phase — all validation is build-time smoke checks and manual Lighthouse audits. This is appropriate for a static site with no business logic to unit test.

*(No Wave 0 test file gaps — existing infrastructure (build pipeline) covers automated validation; manual steps are documented above)*

---

## Sources

### Primary (HIGH confidence)
- Astro official blog example (`/examples/blog/src/components/BaseHead.astro`) — canonical URL pattern, OG tags structure
- `https://docs.astro.build/en/guides/integrations-guide/sitemap/` — sitemap filter API, file generation (sitemap-index.xml + sitemap-0.xml), draft exclusion mechanism
- `https://docs.astro.build/en/guides/rss/` — RSS endpoint pattern, getCollection integration, draft filtering
- `https://docs.astro.build/en/guides/images/` — Image component props, loading="eager", fetchpriority, CLS prevention
- `https://docs.astro.build/en/guides/fonts/` — fontProviders API, Font component, self-hosting
- Astro 5.17.0 node_modules inspection — confirmed `fontProviders` in `astro/dist/config/entrypoint.js`, confirmed `fonts` as top-level schema key (non-experimental)

### Secondary (MEDIUM confidence)
- `https://johndalesandro.com/blog/astro-add-json-ld-structured-data-to-your-website-for-rich-search-results/` — `set:html` pattern for JSON-LD, BlogPosting schema structure (verified against Astro docs for the directive)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — both package versions verified via npm registry; built-in APIs confirmed in installed node_modules
- Architecture: HIGH — all patterns verified against official Astro docs fetched during research
- Pitfalls: HIGH — JSON-LD escaping pitfall confirmed by Astro's `set:html` documentation; others verified by code inspection of existing project

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable integrations; Astro patch releases unlikely to break these APIs)
