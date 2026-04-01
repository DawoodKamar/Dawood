# Technology Stack

**Project:** Dawood Kamar — Personal Brand Site (Astro + Tailwind + Netlify)
**Researched:** 2026-04-01
**Overall Confidence:** HIGH (all findings verified against official Astro docs, Tailwind docs, and Netlify docs)

---

## Version Landscape (Critical — Read First)

As of April 2026, the Astro ecosystem has two stable major versions in active use:

| Version | Status | Node Requirement | Notes |
|---------|--------|-----------------|-------|
| Astro 5.x (latest: 5.17) | Stable | Node 22+ recommended | Safest migration target from vanilla HTML project |
| Astro 6.x (latest: 6.1.2) | Stable | Node 22.12.0+ required | Removes legacy APIs, upgrades to Zod 4 |

**Recommendation: Start on Astro 5.x.** Astro 6 was just released and removes several legacy APIs (Astro.glob(), legacy content collections, deprecated `<ViewTransitions />`). For a new personal site build, Astro 5.17 is the safer choice with a longer upgrade runway. The content patterns documented here apply to Astro 5's Content Layer API, which is also the only option in Astro 6.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 5.17.x | Static site framework | Zero-JS by default, excellent for content sites, strong MDX + content collections support, native Vite integration |
| Node.js | 22.x LTS | Runtime | Required by Astro 5.17+; Netlify build images default to Node 22 |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Astro 5.2+ has first-class support via Vite plugin; no config file needed; CSS-first configuration |
| @tailwindcss/vite | 4.x | Build integration | Official Vite plugin replaces deprecated `@astrojs/tailwind` integration; only correct path for Tailwind v4 |
| @tailwindcss/typography | latest | Blog post rendering | Adds `prose` classes for polished long-form content styling |

### Content

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro Content Layer API | Built into Astro 5 | Blog posts as typed collections | File-system collections with Zod schema validation, build-time type safety, replaces Astro 4 legacy collections |
| Zod | 3.x (bundled) | Schema validation | Built into Astro via `astro/zod` — validates frontmatter at build time, not runtime |
| MDX | via @astrojs/mdx v4+ | Rich blog posts | Allows JSX components inside Markdown; required if embedding interactive content in posts |

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Netlify | — | Hosting | Already in use for current site; auto-detects Astro; zero-config static deploys |

---

## Installation

### 1. Create New Astro Project

```bash
npm create astro@latest dawood-site -- --template minimal
cd dawood-site
```

The `--template minimal` gives a blank slate without opinion on styling.

### 2. Install Tailwind CSS 4 (Vite Plugin — Not @astrojs/tailwind)

```bash
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography
```

Do NOT run `npx astro add tailwind` — as of Astro 5.2 this installs the Vite plugin correctly, but doing it manually gives you more control over the global CSS file location.

### 3. Configure Vite Plugin in astro.config.mjs

```javascript
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 4. Create Global CSS File

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

The single `@import "tailwindcss"` replaces the old three-directive approach (`@tailwind base`, `@tailwind components`, `@tailwind utilities`). The `@plugin` directive loads the typography plugin — no separate `tailwind.config.js` needed.

### 5. Import in Base Layout

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
---
```

Import once in the root layout. Do not repeat per-page.

### 6. Add MDX Integration (if needed for blog posts)

```bash
npx astro add mdx
```

This installs `@astrojs/mdx` v4+ which is required for Astro 5 compatibility.

---

## Tailwind CSS: Key API Differences in v4

| Old (v3) | New (v4) | Notes |
|----------|----------|-------|
| `tailwind.config.js` | CSS `@theme` directive | Config lives in CSS, not JS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Single import |
| `plugins: [require('@tailwindcss/typography')]` | `@plugin "@tailwindcss/typography"` | In CSS file |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` plugin | Integration is deprecated |
| Class detection via `content` paths | Auto-detected by Vite | No content config needed |

---

## Content Collections: Setup and Schema

### File Location

Astro 5 moved the config file out of `src/content/`:

```
src/
  content.config.ts      ← collection definitions live here (NOT src/content/config.ts)
  content/
    blog/
      my-first-post.md
      second-post.mdx
```

The old `src/content/config.ts` path still works for legacy collections but is not recommended for new projects.

### Collection Definition

```typescript
// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),           // coerce handles "2024-01-15" strings
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),       // path to cover image
    imageAlt: z.string().optional(),
  }),
});

export const collections = { blog };
```

### Frontmatter Example

```yaml
---
title: "Building a Personal Site with Astro"
description: "A walkthrough of migrating from vanilla HTML to Astro."
pubDate: 2026-03-15
tags: ["astro", "webdev", "portfolio"]
draft: false
image: "/images/astro-blog-cover.png"
imageAlt: "Astro logo on a dark background"
---
```

### Querying in Pages

```astro
---
// src/pages/blog/index.astro
import { getCollection } from "astro:content";

const posts = await getCollection("blog", ({ data }) => {
  return data.draft !== true;           // filter out drafts in production
});
const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

### Rendering a Post

```astro
---
// src/pages/blog/[...id].astro
import { getCollection, render } from "astro:content";  // render() is now a standalone import

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
---
```

Note: In Astro 5, `render()` is imported from `astro:content` as a function — it is no longer a method on the entry object (`post.render()` no longer works).

---

## @tailwindcss/typography: Blog Post Layout

### Prose Wrapper Component

```astro
<!-- src/components/Prose.astro -->
<div class="prose prose-slate dark:prose-invert max-w-none
  prose-a:text-blue-600 dark:prose-a:text-blue-400
  prose-headings:font-semibold
  prose-code:before:content-none prose-code:after:content-none">
  <slot />
</div>
```

### Blog Post Layout Usage

```astro
---
// src/layouts/BlogPostLayout.astro
import BaseLayout from "./BaseLayout.astro";
import Prose from "../components/Prose.astro";
import { type CollectionEntry } from "astro:content";

interface Props {
  post: CollectionEntry<"blog">;
}

const { post } = Astro.props;
---

<BaseLayout title={post.data.title} description={post.data.description}>
  <article class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-4">{post.data.title}</h1>
    <time class="text-sm text-gray-500">{post.data.pubDate.toLocaleDateString()}</time>
    <Prose>
      <slot />
    </Prose>
  </article>
</BaseLayout>
```

---

## View Transitions: ClientRouter

### Enable Globally

Add `<ClientRouter />` to the `<head>` of your base layout. Once present, it intercepts all internal navigation automatically.

```astro
---
// src/layouts/BaseLayout.astro
import { ClientRouter } from "astro:transitions";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

No additional configuration is required to get default fade animations.

### Component Name History (Important)

| Astro Version | Import | Status |
|---------------|--------|--------|
| Astro 2.9 – 4.x | `<ViewTransitions />` from `astro:transitions` | Deprecated, removed in v6 |
| Astro 5+ | `<ClientRouter />` from `astro:transitions` | Current name — use this |
| Astro 6 | `<ViewTransitions />` removed entirely | `<ClientRouter />` only |

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome / Edge / Opera | Native | Full support for View Transitions Level 1 |
| Firefox 144+ | Supported | Via Astro's ClientRouter emulation |
| Safari | Partial | Technology Preview 192+ added Level 1 support; production Safari has limited support |

Astro's `ClientRouter` provides a JavaScript-based fallback for browsers without native support. The fallback behavior is configurable:

```astro
<ClientRouter fallback="animate" />
<!-- Options: "animate" (default), "swap", "none" -->
```

### Known Caveats

**Script execution (critical for third-party scripts and analytics):**
Bundled module scripts (`<script>`) execute only once per full page load, not on every navigation. If you need scripts to re-run after transitions, use:

```html
<script is:inline data-astro-rerun>
  // this re-runs on every navigation
</script>
```

Or listen on the `astro:page-load` lifecycle event:

```javascript
document.addEventListener("astro:page-load", () => {
  // runs after every page transition
});
```

**Island state loss:**
Interactive framework components (React/Vue/Svelte islands) lose state across navigations unless you add `transition:persist`:

```astro
<ThemeToggle transition:persist />
```

**CSS animations and iframes:** Cannot be prevented from resetting during a transition, even with `transition:persist`.

**Same-origin only:** ClientRouter enforces same-origin navigation. Cross-domain links trigger full page loads.

**Props vs state:** `transition:persist` preserves internal state but islands re-render with new props unless you also add `transition:persist-props`.

---

## Netlify Deployment Configuration

### netlify.toml

For a fully static Astro site (no SSR adapter), the configuration is minimal:

```toml
[build]
  command   = "npm run build"
  publish   = "dist"

[build.environment]
  NODE_VERSION = "22"
```

Netlify auto-detects Astro and will suggest this configuration. No adapter package is needed for static output.

### Static vs SSR

| Mode | Config | When to Use |
|------|--------|-------------|
| Static (default) | No adapter, `output: "static"` in astro.config | Blog/portfolio with no server-side logic |
| SSR (server) | `@astrojs/netlify` adapter required | API routes, auth, dynamic rendering |

For a personal brand site with a blog, static output is correct. Do not install `@astrojs/netlify` unless you need SSR.

### Node Version

Netlify's current build images support Node 22. Set `NODE_VERSION = "22"` explicitly to avoid being assigned an older default. This matches what the current `netlify.toml` already does for the existing project.

---

## Deprecated / Avoid

| Package | Status | Replacement |
|---------|--------|-------------|
| `@astrojs/tailwind` | Deprecated in Astro 5.2 | `@tailwindcss/vite` Vite plugin |
| `tailwind.config.js` | Not needed for v4 | CSS `@theme` directive |
| `src/content/config.ts` | Legacy path | `src/content.config.ts` |
| `post.render()` (method) | Removed in Astro 5 | `render(post)` from `astro:content` |
| `<ViewTransitions />` | Deprecated in Astro 5, removed in Astro 6 | `<ClientRouter />` from `astro:transitions` |
| `Astro.glob()` | Removed in Astro 6 | `getCollection()` from `astro:content` |
| `slug` field on entries | Replaced in Astro 5 | `id` field |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Astro 5 | Astro 6 | v6 just released; fewer themes/community examples; Zod 4 API changes add friction |
| CSS | Tailwind CSS 4 | Tailwind CSS 3 | v3 still works but v4 is the active path; `@astrojs/tailwind` (v3 integration) is deprecated |
| Blog content | Content Layer API (glob loader) | Contentful / Sanity CMS | Remote CMS adds unnecessary complexity for a personal site; file-based is simpler to maintain |
| Deploy | Netlify static | Netlify SSR | No SSR required; static is faster, simpler, cheaper |
| Markdown | MDX via @astrojs/mdx | Plain .md only | MDX gives ability to embed Astro components in posts; low overhead |

---

## Sources

- [Astro Docs: @astrojs/tailwind (deprecated)](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Tailwind CSS Docs: Install with Astro](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [Astro Blog: Astro 5.2 Release (Tailwind v4 support)](https://astro.build/blog/astro-520/)
- [Astro Docs: Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs: View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Astro Docs: Upgrade to v5](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Astro Docs: Upgrade to v6](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Astro Docs: Deploy to Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Astro Docs: Style Rendered Markdown with Tailwind Typography](https://docs.astro.build/en/recipes/tailwind-rendered-markdown/)
- [GitHub: ViewTransitions → ClientRouter rename PR #11980](https://github.com/withastro/astro/pull/11980)
- [Heise: Astro 5.2 Tailwind CSS 4.0 support](https://www.heise.de/en/news/Web-framework-Astro-5-2-brings-support-for-Tailwind-CSS-4-0-10267445.html)
- [Astro: What's New January 2026](https://astro.build/blog/whats-new-january-2026/)
