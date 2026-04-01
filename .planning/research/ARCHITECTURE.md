# Architecture Patterns: Astro Static Blog

**Project:** Astro + Tailwind + Content Collections, static output, Netlify hosting
**Researched:** 2026-04-01
**Confidence:** HIGH (official Astro docs + Netlify docs verified)

---

## 1. Meta Tags in a BaseLayout Component

### Pattern: BaseHead Component with Prop-Driven Overrides

The standard approach is a dedicated `src/components/BaseHead.astro` component that accepts per-page overrides and falls back to site-wide defaults. This component is imported once in your layout and placed inside `<head>`.

```astro
---
// src/components/BaseHead.astro
interface Props {
  title: string;
  description: string;
  image?: string;
}

const { title, description, image = "/og-default.jpg" } = Astro.props;

// Requires site set in astro.config.mjs
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const ogImageURL = new URL(image, Astro.site);
---

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImageURL} />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageURL} />
```

Usage in `src/layouts/BaseLayout.astro`:

```astro
---
import BaseHead from '../components/BaseHead.astro';

interface Props {
  title: string;
  description: string;
  image?: string;
}
const { title, description, image } = Astro.props;
---
<html lang="en">
  <head>
    <BaseHead title={title} description={description} image={image} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Usage in a blog post layout (with Content Collections):

```astro
---
// src/layouts/PostLayout.astro
const { post } = Astro.props;
const { title, description, heroImage } = post.data;
---
<BaseLayout title={title} description={description} image={heroImage}>
  <slot />
</BaseLayout>
```

### Key Requirements

- **`site` must be set in `astro.config.mjs`**: `{ site: 'https://yoursite.com' }`. Without it, `Astro.site` is `undefined` and canonical/OG image URLs will break silently in production.
- **`og:image` needs an absolute URL** — use `new URL(image, Astro.site)` to convert relative paths.
- **Title length**: keep under 60 characters, place primary keyword near start.
- **Description length**: 120–160 characters.
- **Confidence:** HIGH — verified against official Astro docs and multiple production examples.

---

## 2. Structured Data: Article JSON-LD

### Pattern: Inline Script with `set:html`

Astro escapes HTML inside `{}` expressions by default. To inject raw JSON-LD, use `set:html` on a `<script>` tag. The recommended approach is a dedicated component rather than inline in every layout.

```astro
---
// src/components/ArticleJsonLd.astro
interface Props {
  title: string;
  description: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
  authorName: string;
  url: string;
}

const {
  title,
  description,
  publishDate,
  updatedDate,
  image,
  authorName,
  url,
} = Astro.props;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description: description,
  url: url,
  datePublished: publishDate.toISOString(),
  ...(updatedDate && { dateModified: updatedDate.toISOString() }),
  ...(image && { image: new URL(image, Astro.site).toString() }),
  author: {
    "@type": "Person",
    name: authorName,
  },
  publisher: {
    "@type": "Organization",
    name: "Your Site Name",
    url: Astro.site?.toString(),
  },
};
---

<script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
```

Slot into PostLayout's `<head>` via a named slot:

```astro
<!-- In PostLayout.astro -->
<head>
  <BaseHead title={title} description={description} image={image} />
  <ArticleJsonLd
    title={title}
    description={description}
    publishDate={publishDate}
    url={new URL(Astro.url.pathname, Astro.site).toString()}
    authorName="Dawood Kamar"
  />
</head>
```

### Key Points

- Use `"@type": "BlogPosting"` (Google's preferred type for blog content, more specific than `Article`).
- `set:html` is mandatory — without it, Astro escapes the JSON and Google will not parse it.
- Validate output with [Google's Rich Results Test](https://search.google.com/test/rich-results).
- **Confidence:** HIGH — verified against multiple current (2025–2026) Astro implementation articles.

---

## 3. Canonical URLs

### How Astro Resolves Canonical URLs

Astro provides two globals for URL construction:

| Global | Value | Use case |
|--------|-------|----------|
| `Astro.site` | Full origin from `astro.config.mjs` `site` option | Build absolute URLs |
| `Astro.url` | `URL` object of the current request path | Get pathname, origin |

The canonical URL pattern:

```astro
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
// → "https://yoursite.com/blog/my-post/"
```

### `astro.config.mjs` Setup

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://yoursite.com',
  // If using a subdirectory: base: '/blog'
});
```

### In `getStaticPaths()`

**Known regression (Astro ≥ 5.13.10):** `Astro.site` is `undefined` inside `getStaticPaths()`. Workaround: import site URL from a config constant instead of relying on `Astro.site` in that scope.

```ts
// src/config.ts
export const SITE_URL = 'https://yoursite.com';
```

```ts
// src/pages/blog/[slug].astro
import { SITE_URL } from '../../config';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { canonicalBase: SITE_URL }, // pass explicitly if needed
  }));
}
```

### Netlify Override Warning

Netlify can inject its own canonical URLs during deployment, overriding what Astro sets. If you observe this, check Netlify's "Asset optimization" settings (Pretty URLs) and disable "Post processing" → canonical URL injection.

- **Confidence:** HIGH for the pattern. MEDIUM for the Astro 5.13.10 regression — it is a confirmed open GitHub issue (#14575) but may be resolved in a patch release by the time you build.

---

## 4. robots.txt: Static vs Dynamic

### Recommendation: Dynamic Endpoint for Config Reuse

Use `src/pages/robots.txt.ts` rather than `public/robots.txt` when you need to reference `Astro.site` or control crawl rules per environment. For a simple blog with no environment-specific rules, a static file is sufficient.

**Option A — Static file (simplest):**

```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap-index.xml
```

This works at build time with zero configuration. Update the sitemap URL manually if the domain changes.

**Option B — Dynamic endpoint (config-aware):**

```ts
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('/sitemap-index.xml', site);
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL}`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  );
};
```

This file is output as `robots.txt` at the root of the build. The `site` parameter comes from `astro.config.mjs` automatically.

### Pairing with `@astrojs/sitemap`

Install the official integration for automatic sitemap generation:

```bash
npx astro add sitemap
```

This generates `sitemap-index.xml` at build time. Reference it in your robots.txt.

- **Confidence:** HIGH for both patterns — verified against Astro project structure docs and community implementations.

---

## 5. Lighthouse 90+ Targets: Pitfalls in Astro + Tailwind

Astro ships minimal JavaScript by default and generates static HTML, giving it a structural advantage. The pitfalls below are the most common causes of failing Lighthouse audits in Astro + Tailwind projects.

### Pitfall 1: Tailwind Unused CSS Not Purged

**What goes wrong:** Tailwind v3 requires correct `content` path configuration. With Tailwind v4, the auto-detection of content paths handles most cases, but `@layer components` semantics changed — v4 treats it differently than v3, potentially leaving bloat.

**Prevention:**
```js
// tailwind.config.js (v3)
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,vue}'],
};
```

For Tailwind v4, confirm auto-detection covers your `.astro` files. Avoid constructing class names dynamically (e.g., `` `text-${color}-500` `` — this prevents purging).

**Detection:** Run `npx astro build` and inspect the output CSS size. Over 50KB of CSS is a red flag for a blog site.

### Pitfall 2: Google Fonts Blocking Render

**What goes wrong:** A `<link>` to Google Fonts in `<head>` blocks rendering. The browser must connect to `fonts.googleapis.com`, download the CSS, then connect to `fonts.gstatic.com` for the actual font files. This adds 200–600ms to LCP.

**Prevention (Option A — Astro Fonts API, preferred):**
```ts
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro';

export default defineConfig({
  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
    }]
  }
});
```

The Fonts API self-hosts the font files, adds `preload` links automatically, and applies `font-display: swap` by default.

**Prevention (Option B — manual self-hosting):**
```html
<!-- Preconnect first -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Then the stylesheet -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" />
```

`display=swap` in the query string adds `font-display: swap`, preventing invisible text (FOIT).

### Pitfall 3: Images Without Explicit Dimensions (CLS)

**What goes wrong:** `<img>` tags without `width` and `height` attributes cause Cumulative Layout Shift (CLS) as the browser doesn't reserve space before the image loads. CLS is heavily weighted in Lighthouse.

**Prevention:** Use Astro's `<Image />` component from `astro:assets`. It automatically:
- Infers dimensions from source metadata (prevents CLS)
- Converts to WebP/AVIF
- Adds `loading="lazy"` for below-fold images
- Generates `srcset` with `layout` prop

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---
<Image src={heroImage} alt="Description" width={1200} height={600} />
```

For hero/above-fold images, override lazy loading:

```astro
<Image src={heroImage} alt="Hero" loading="eager" fetchpriority="high" />
```

### Pitfall 4: Render-Blocking Scripts and Styles

**What goes wrong:** Any `<script>` without `type="module"`, `async`, or `defer` blocks HTML parsing. Astro scripts default to `type="module"` (deferred), so this mainly affects manually added third-party scripts.

**Prevention:** Always add `async` or `defer` to third-party `<script>` tags in `<head>`. Astro inline scripts use `type="module"` by default and are safe.

### Pitfall 5: Missing `alt` on Images (Accessibility / Best Practices Score)

Lighthouse deducts points in Accessibility and Best Practices for images without `alt`. Astro's `<Image />` requires `alt` at the type level — use it consistently.

### Pitfall 6: Large Unoptimized OG Images

OG images are not part of the rendered page but can become build-time liabilities if stored as large PNGs. Keep OG images under 1.2MB, ideally in WebP. For dynamic OG images, use an Astro endpoint with `@vercel/og` or `satori`.

### Summary Checklist for Lighthouse 90+

| Check | Target | Tool |
|-------|--------|------|
| CSS size | < 50KB after purge | `astro build` output |
| Font loading | `font-display: swap` + preconnect | Lighthouse audit |
| Hero image | `loading="eager"`, explicit dimensions | `<Image />` component |
| Below-fold images | `loading="lazy"` (default) | `<Image />` component |
| CLS | < 0.1 | Core Web Vitals |
| LCP | < 2.5s | Lighthouse |
| No render-blocking | `async`/`defer` on third-party scripts | Lighthouse audit |

- **Confidence:** HIGH for Astro image/font patterns (official docs). MEDIUM for Tailwind v4 purging (evolving — verify against current Tailwind v4 docs at build time).

---

## 6. Netlify Forms with Astro SSG

### How Netlify Forms Work with Static Sites

Netlify's build bots scan the deployed HTML for forms with the `netlify` or `data-netlify="true"` attribute. For Astro static output, the HTML is pre-built and available to the scanner — this is the key difference from client-side rendered SPAs.

**Native Astro SSG forms work without JavaScript server-side** because the form submits directly to Netlify's edge via a standard `method="POST"`, and the browser follows the redirect.

### Basic Pattern (No JavaScript Required)

```astro
---
// src/pages/contact.astro
---
<form
  name="contact"
  method="POST"
  data-netlify="true"
  data-netlify-honeypot="bot-field"
  action="/success"
>
  <!-- Honeypot spam filter — hidden from humans -->
  <p style="display: none;">
    <label>
      Do not fill this out: <input name="bot-field" />
    </label>
  </p>

  <!-- The form-name hidden input is automatically injected by Netlify's
       build bot for static HTML forms, but including it explicitly is
       safer and required for any JS-enhanced submission -->
  <input type="hidden" name="form-name" value="contact" />

  <label>
    Name <input type="text" name="name" required />
  </label>
  <label>
    Email <input type="email" name="email" required />
  </label>
  <label>
    Message <textarea name="message" required></textarea>
  </label>
  <button type="submit">Send</button>
</form>
```

Create the success page:

```astro
---
// src/pages/success.astro
---
<html>
  <head><title>Message sent</title></head>
  <body>
    <h1>Thank you — your message was received.</h1>
    <a href="/">Back to home</a>
  </body>
</html>
```

### The Hidden Form Trick (SPA/JS-enhanced forms only)

If the form is rendered entirely by JavaScript (React, Vue, Svelte components), the Netlify build bot will not find it in pre-built HTML. The workaround is a **hidden static form** in a `.astro` file:

```astro
<!-- Somewhere in your layout or a dedicated .astro file -->
<!-- This form is invisible to users but visible to the Netlify build bot -->
<form name="contact" data-netlify="true" style="display: none;">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
</form>
```

The JS-rendered form must then include the `form-name` hidden input to route submissions at runtime:

```jsx
<form name="contact" method="POST" onSubmit={handleSubmit}>
  <input type="hidden" name="form-name" value="contact" />
  {/* ... fields ... */}
</form>
```

For pure Astro SSG (no JS framework components), this hidden-form trick is **not needed** because the `.astro` file compiles to static HTML that the build bot can detect directly.

### Success/Error Handling Without a JS Server

| Approach | How it works | Requires JS? |
|----------|-------------|--------------|
| `action="/success"` redirect | Browser follows redirect after POST | No |
| Netlify default thank-you page | Netlify shows a default page if no `action` set | No |
| AJAX + `fetch()` | Intercept submit, POST via fetch, show inline message | Yes (client JS only) |

The simplest no-JS path: set `action="/success"` on the form and create `src/pages/success.astro`. No backend, no JS.

For inline success messages (no page reload), use client-side JavaScript to intercept the submit event and POST to Netlify's endpoint with `Content-Type: application/x-www-form-urlencoded`.

### Deployment Checklist

1. Deploy the site (form must be in a completed build before it appears in the dashboard).
2. In Netlify UI: **Site settings → Forms → Enable form detection**.
3. Test a submission — it appears under **Site overview → Forms**.
4. Set up **email notifications** in Netlify Forms settings if needed.

### Known Gotcha

If Netlify's "Post processing → Asset optimization" is enabled with "Pretty URLs", it can interfere with form action redirects. Test after deploy and disable Pretty URLs if the `action="/success"` redirect misbehaves.

- **Confidence:** HIGH — verified against official Netlify Forms documentation, the netlify-templates/astro-toolbox reference implementation, and multiple support forum resolutions.

---

## Component Boundaries Summary

| Component | File | Responsibility |
|-----------|------|----------------|
| `BaseHead` | `src/components/BaseHead.astro` | All `<head>` meta, OG, canonical |
| `ArticleJsonLd` | `src/components/ArticleJsonLd.astro` | JSON-LD for blog posts only |
| `BaseLayout` | `src/layouts/BaseLayout.astro` | Page shell, imports BaseHead |
| `PostLayout` | `src/layouts/PostLayout.astro` | Blog post shell, adds ArticleJsonLd |
| robots.txt | `src/pages/robots.txt.ts` | Dynamic, references `site` config |
| success page | `src/pages/success.astro` | Form submission landing page |

---

## Sources

- [Astro Configuration Reference — `site` option](https://docs.astro.build/en/reference/configuration-reference/)
- [Astro Images Guide](https://docs.astro.build/en/guides/images/)
- [Astro Fonts Guide](https://docs.astro.build/en/guides/fonts/)
- [Astro — @astrojs/sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Netlify Forms Setup Docs](https://docs.netlify.com/manage/forms/setup/)
- [Netlify: Deploy an Astro site with Forms, Serverless Functions, and Redirects](https://www.netlify.com/blog/deploy-an-astro-site-with-forms-serverless-functions-and-redirects/)
- [netlify-templates/astro-toolbox — Reference implementation](https://github.com/netlify-templates/astro-toolbox)
- [Stephen Lunt — Astro Structured Data](https://stephen-lunt.dev/blog/astro-structured-data/)
- [John Dalesandro — Add JSON-LD to Astro](https://johndalesandro.com/blog/astro-add-json-ld-structured-data-to-your-website-for-rich-search-results/)
- [Astro SEO Complete Guide (2025)](https://eastondev.com/blog/en/posts/dev/20251202-astro-seo-complete-guide/)
- [Astro Performance Optimization Guide (2025)](https://eastondev.com/blog/en/posts/dev/20251202-astro-performance-optimization/)
- [Tailwind v4 @layer components behavior change — Discussion #17526](https://github.com/tailwindlabs/tailwindcss/discussions/17526)
- [Astro.site undefined in getStaticPaths regression — Issue #14575](https://github.com/withastro/astro/issues/14575)
- [Netlify canonical URL override — Support forum](https://answers.netlify.com/t/in-production-netlify-keeps-overriding-my-canonical-url-that-i-have-set-up-in-astro-config/139110)
