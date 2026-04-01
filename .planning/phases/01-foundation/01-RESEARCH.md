# Phase 1: Foundation — Research

**Researched:** 2026-04-01
**Domain:** Astro 5.17 + Tailwind v4 + Content Collections + Netlify Static Deployment
**Confidence:** HIGH (all core findings verified against npm registry, official Astro docs, and prior project research)

---

## Summary

Phase 1 scaffolds the Astro project in an existing vanilla HTML repo, installs Tailwind v4 correctly, defines a type-safe blog content collection, and writes three sample posts. The prior project research (`.planning/research/STACK.md`, `FEATURES.md`, `PITFALLS.md`) is comprehensive and accurate — this document does not duplicate it but focuses specifically on what Phase 1 needs.

The single environment risk is the local Node.js version. The machine runs Node 21.5.0, but Astro 5.17's `engines` field requires `18.20.8 || ^20.3.0 || >=22.0.0`. Node 21.x is not in that range. npm will print a warning but `--engine-strict` is `false`, so install and build should still succeed locally. Netlify's build uses Node 22 (already set in `netlify.toml`), so production builds are fine. The plan should include a note that `brew install node@22` is available as a simple upgrade path if local build warnings become errors in a future Astro patch.

The correct initialization strategy is NOT `npm create astro@latest` (which would install Astro 6.1.2, the current `latest` dist-tag). It is `npm create astro@5` or manual scaffolding, then pinning `astro@5.17.0` in `package.json`.

**Primary recommendation:** Initialize manually (not via the CLI wizard) to avoid version drift, then install `astro@5.17.0`, `@tailwindcss/vite@4.2.2`, and `@tailwindcss/typography@0.5.19` explicitly. The existing `index.html`, `styles.css`, and `scripts.js` files will be replaced but should be left in the repo history — the plan should not delete them in Phase 1; they become dead files until Phase 2 wiring replaces them.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SETUP-01 | Astro 5.17 project initialized with TypeScript, replacing existing vanilla HTML/CSS/JS files | CLI init + manual package.json; `astro@5.17.0` pinned; TypeScript strict config |
| SETUP-02 | Tailwind CSS v4 integrated via `@tailwindcss/vite` (not deprecated `@astrojs/tailwind`) | `@tailwindcss/vite@4.2.2` added to `vite.plugins` in `astro.config.mjs`; `@import "tailwindcss"` in global CSS |
| SETUP-03 | `@tailwindcss/typography` plugin configured in global CSS for blog post rendering | `@plugin "@tailwindcss/typography"` directive in `src/styles/global.css` |
| SETUP-04 | `netlify.toml` updated with `command = "npm run build"` and `publish = "dist"` | Existing file only has `[build.environment]`; add `[build]` section with command and publish |
| SETUP-05 | Environment variables configured for newsletter API key | Not needed in Phase 1 — newsletter is Phase 3. Deferred. |
| SETUP-06 | `astro.config.mjs` with `output: "static"`, `site` URL, sitemap integration, Tailwind Vite plugin | Full config documented in Standard Stack section below |
| CONTENT-01 | `src/content.config.ts` defines blog collection with Zod schema | `defineCollection` + `glob` loader + Zod schema at `src/content.config.ts` |
| CONTENT-02 | Blog frontmatter schema: title, date, description, category (enum), tags, draft | Zod schema with `z.coerce.date()`, `z.enum([...])`, `z.array(z.string())`, `z.boolean().default(false)` |
| CONTENT-03 | Draft posts excluded from production in all 4 locations | Phase 1 scope: draft filter in `getCollection`; RSS/sitemap/`getStaticPaths` in later phases |
| CONTENT-04 | 3 sample blog posts with realistic frontmatter and placeholder content | 3 `.md` files in `src/content/blog/` with specified titles, dates, categories |
| CONTENT-05 | `remarkReadingTime` plugin installed; `minutesRead` injected via `remarkPluginFrontmatter` | `reading-time` + `mdast-util-to-string` npm packages; plugin at `src/plugins/remark-reading-time.mjs`; accessed via `render()` return value |
</phase_requirements>

---

## User Constraints (from project decisions)

### Locked Decisions

From `.planning/STATE.md` Accumulated Context:

- Use `@tailwindcss/vite` NOT `@astrojs/tailwind` (deprecated in Astro 5.2)
- Use `<ClientRouter />` from `astro:transitions` NOT `<ViewTransitions />`
- `src/content.config.ts` NOT `src/content/config.ts` (Astro 5 path)
- Use standalone `render()` from `astro:content` NOT `post.render()` method
- Do NOT install `@astrojs/netlify` adapter — static site, no SSR needed

### Out of Scope for Phase 1

From REQUIREMENTS.md traceability and ROADMAP.md phase assignments:
- NAV-01 through NAV-07 — Phase 2
- HOME-01 through HOME-05 — Phase 2
- All blog page rendering (BLOG-01 through BLOG-07) — Phase 3
- Newsletter (NEWS-01 through NEWS-04) — Phase 3
- Contact form (CONTACT-01 through CONTACT-06) — Phase 3
- SEO metadata components (SEO-01 through SEO-10) — Phase 4
- Responsive design audit (RESP-01 through RESP-04) — Phase 4

---

## Standard Stack

### Core (Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 5.17.0 | Static site framework | Pinned per roadmap; 5.18.1 is latest 5.x but 5.17.0 is the specified target |
| @tailwindcss/vite | 4.2.2 | Tailwind CSS v4 build integration | Official Vite plugin — only correct integration for Tailwind v4 with Astro 5.2+ |
| @tailwindcss/typography | 0.5.19 | `prose` classes for blog post styling | Required by SETUP-03; loaded via CSS `@plugin` directive |
| reading-time | 1.5.0 | Word count → minutes estimate | Used inside the remark plugin; 200 wpm default |
| mdast-util-to-string | 4.0.0 | Extract plain text from Markdown AST | Required by `reading-time`; converts mdast tree to string |
| typescript | (bundled by Astro) | Type safety | Astro 5 installs TypeScript automatically via `--typescript strict` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro@5 / zod | bundled | Frontmatter schema validation | Import from `astro/zod`; Zod 3.x bundled in Astro 5 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| astro@5.17.0 (pinned) | astro@5.18.1 (latest 5.x) | 5.17.0 is the specified version; 5.18.1 has bug fixes but no breaking changes |
| `npm create astro@5` | `npm create astro@latest` | `@latest` resolves to Astro 6.1.2 — different major version, not what we want |
| `reading-time` npm package | Hand-rolled word count | `reading-time` handles edge cases (numbers, CJK, code blocks); not worth rolling custom |

### Installation

```bash
# Pin to specified Astro version — do NOT use @latest (resolves to Astro 6)
npm create astro@5 . -- --template minimal --typescript strict --no-install --no-git

# Then install dependencies with pinned versions
npm install astro@5.17.0
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography
npm install reading-time mdast-util-to-string
```

**Note on `npm create astro@5`:** The `@5` tag resolves `create-astro` to the version that generates Astro 5.x projects. The `.` argument initializes in the current directory. The `--no-install` flag skips `npm install` so we can pin `astro@5.17.0` before the first install. The `--no-git` flag skips re-initializing git in an existing repo.

**Version verification (confirmed 2026-04-01 via npm registry):**
- `astro@5.17.0` — confirmed exists, published
- `@tailwindcss/vite@4.2.2` — current latest
- `@tailwindcss/typography@0.5.19` — current latest
- `reading-time@1.5.0` — current latest
- `mdast-util-to-string@4.0.0` — current latest

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)

```
src/
  content.config.ts          # collection definitions (NOT src/content/config.ts)
  content/
    blog/
      ai-noise.md            # "Most People Aren't Behind on AI..."
      focus-advantage.md     # "Focus Is Becoming a Competitive Advantage"
      switzerland-ambition.md  # "What Switzerland Taught Me About Ambition"
  plugins/
    remark-reading-time.mjs  # reading time remark plugin
  config.ts                  # exports SITE_URL constant
  pages/
    index.astro              # placeholder homepage (minimal, no layout yet)
astro.config.mjs
tsconfig.json
package.json
netlify.toml                 # updated with [build] section
```

### Pattern 1: Astro Config with Tailwind v4 Vite Plugin

**What:** Configure `@tailwindcss/vite` as a Vite plugin inside `astro.config.mjs`. This is the only supported path for Tailwind v4 with Astro 5.

**Example:**
```javascript
// astro.config.mjs
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  site: "https://dawoodkamar.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Pattern 2: Global CSS with Tailwind v4 Directives

**What:** A single `@import "tailwindcss"` replaces the old three-directive approach. The typography plugin uses `@plugin`, not `tailwind.config.js`.

**Example:**
```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/installation/framework-guides/astro */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Dark mode: class-based toggle */
@custom-variant dark (&:where(.dark, .dark *));
```

Note: The `@custom-variant dark` line is needed even in Phase 1 because later phases (2+) will use `dark:` utility classes. Establishing it now prevents a FOUC pitfall later.

### Pattern 3: Content Collection Definition (Astro 5)

**What:** `src/content.config.ts` with `glob` loader. The old `type: 'content'` API from Astro 4 is replaced with `loader: glob(...)`.

**Example:**
```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum([
      "AI & Work",
      "Focus & Discipline",
      "Culture & Place",
      "Clarity & Communication",
    ]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

Key notes:
- Use `date` (not `pubDate`) — matches REQUIREMENTS.md frontmatter spec
- `z.coerce.date()` handles ISO date strings in frontmatter (`"2026-03-15"`)
- `category` as `z.enum()` enforces the four allowed values at build time
- `draft: z.boolean().default(false)` means posts without `draft:` are treated as published

### Pattern 4: remarkReadingTime Plugin

**What:** A remark plugin that runs during Markdown processing at build time, injecting `minutesRead` into the post's `remarkPluginFrontmatter`. This is NOT a Zod schema field — it is injected by the plugin.

**Plugin file:**
```javascript
// src/plugins/remark-reading-time.mjs
// Source: https://docs.astro.build/en/recipes/reading-time/
import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // Injects: "3 min read" string
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
```

**Wiring in astro.config.mjs:**
```javascript
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  // ...rest of config
});
```

**Accessing the injected value:**
```astro
---
// In any page that renders a blog post
import { render } from "astro:content";

const { Content, remarkPluginFrontmatter } = await render(entry);
const minutesRead = remarkPluginFrontmatter.minutesRead; // "3 min read"
---
<span>{minutesRead}</span>
```

**Critical:** `minutesRead` is only accessible after calling `render()`. It is NOT available on `entry.data`. A throwaway verification page (e.g. `src/pages/test-reading-time.astro`) is the correct way to confirm it works — delete after verification.

### Pattern 5: Draft Filtering

**What:** Filter in `getCollection()` using `import.meta.env.PROD`.

**Example:**
```typescript
// Drafts visible in dev, hidden in production
const posts = await getCollection("blog", ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
);
```

**Phase 1 scope:** This filter is needed in the throwaway verification page. Phase 3 will apply it in `getStaticPaths` for the blog post pages.

### Pattern 6: netlify.toml Update

```toml
[build]
  command   = "npm run build"
  publish   = "dist"

[build.environment]
  NODE_VERSION = "22"
```

The existing `netlify.toml` only has `[build.environment]`. Add the `[build]` section.

### Pattern 7: src/config.ts

```typescript
// src/config.ts
// Needed by SEO-02 — Astro.site undefined regression in getStaticPaths (>= 5.13.10)
export const SITE_URL = "https://dawoodkamar.com";
```

Phase 1 creates this file. Phase 4 uses it in canonical URL generation.

### Anti-Patterns to Avoid

- **`npm create astro@latest`**: Installs Astro 6.1.2 (`latest` dist-tag), not 5.x. Use `create-astro@5` or initialize manually.
- **`@astrojs/tailwind` integration**: Deprecated since Astro 5.2. Do not install. Use `@tailwindcss/vite` in `vite.plugins` instead.
- **`src/content/config.ts`**: Astro 4 path. Astro 5 requires `src/content.config.ts` (at src root).
- **`post.render()` as a method**: Removed in Astro 5. Import `render` from `astro:content` and call `render(entry)`.
- **Adding `minutesRead` to Zod schema**: It is injected by remark, not parsed from frontmatter. Adding it to the schema would cause validation errors for posts that don't have it written manually.
- **`tailwind.config.js` for dark mode**: In Tailwind v4, `darkMode: 'class'` in a JS config has no effect. Use `@custom-variant dark` in global CSS.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reading time calculation | Custom word-count function | `reading-time` npm package | Handles numbers, code blocks, CJK characters; tested against real-world content |
| Markdown AST text extraction | Manual tree traversal | `mdast-util-to-string` | Works correctly with all mdast node types; single-purpose, 0 deps |
| Frontmatter schema validation | Runtime `if` checks | Zod via `astro/zod` | Build-time errors, TypeScript inference, default values |
| Content glob loading | `fs.readdir` + gray-matter | `glob` loader from `astro/loaders` | Integrated with Astro's type generation and `npx astro sync` |
| Draft filtering logic | Bespoke `process.env.NODE_ENV` checks | `import.meta.env.PROD` | Astro-native; works correctly in `astro dev` vs `astro build` |

**Key insight:** The reading time pipeline (`mdast-util-to-string` → `reading-time` → remark plugin → `remarkPluginFrontmatter`) is 5 lines of code using battle-tested packages. Any custom implementation would miss edge cases.

---

## Common Pitfalls

### Pitfall 1: `npm create astro@latest` Installs Astro 6

**What goes wrong:** The `latest` npm dist-tag for `astro` resolves to 6.1.2 (current as of 2026-04-01). Running `npm create astro@latest` scaffolds an Astro 6 project.

**Why it happens:** npm dist-tags are mutable. `latest` advanced to 6.x.

**How to avoid:** Use `npm create astro@5` or install `astro@5.17.0` directly after scaffolding.

**Warning signs:** `package.json` shows `"astro": "^6.x.x"` after scaffolding.

### Pitfall 2: `@import "tailwindcss"` Not in a CSS File Imported by Astro

**What goes wrong:** Tailwind v4 utility classes generate zero CSS output. The build succeeds but no styles appear.

**Why it happens:** The `@tailwindcss/vite` plugin only processes CSS files that are part of the Vite module graph. The global CSS file must be imported somewhere (typically in a layout), not just placed in `src/styles/`.

**How to avoid:** Add `import "../styles/global.css"` to at least one Astro component that is rendered on every page. For Phase 1, this can be the placeholder `index.astro`.

**Warning signs:** `npx astro build` succeeds but `dist/` CSS file is empty or tiny (< 1KB).

### Pitfall 3: `minutesRead` Not Available on `entry.data`

**What goes wrong:** Code like `entry.data.minutesRead` returns `undefined`.

**Why it happens:** `remarkPluginFrontmatter` values are injected during rendering, not at collection load time. They live on the result of `render(entry)`, not on `entry.data`.

**How to avoid:** Always destructure `remarkPluginFrontmatter` from `await render(entry)`:
```typescript
const { Content, remarkPluginFrontmatter } = await render(entry);
const minutesRead = remarkPluginFrontmatter.minutesRead;
```

**Warning signs:** Reading time displays `undefined` in the UI despite the plugin being configured.

### Pitfall 4: Node 21.x Engine Warning

**What goes wrong:** `npm install` prints an engine compatibility warning because Astro 5.17 requires `18.20.8 || ^20.3.0 || >=22.0.0` and the local Node version is 21.5.0. With `engine-strict = false` (the npm default), install proceeds but the warning is alarming.

**Why it happens:** Node 21.x was a Current (non-LTS) release; Astro skipped it in engine requirements. The machine runs Node 21.5.0 (installed via Homebrew).

**How to avoid:** The warning can be safely ignored for local development; Netlify runs Node 22. To silence it, install Node 22 via Homebrew:
```bash
brew install node@22
# Then link it:
brew link node@22
```
Node 22.22.2 is available in the Homebrew catalog.

**Warning signs:** Build output works despite the warning — this is expected behavior when `engine-strict` is false.

### Pitfall 5: `create-astro` Scaffold Conflicts with Existing Root Files

**What goes wrong:** Running `npm create astro@5 .` in the existing repo root may prompt to overwrite `index.html`, `package.json`, or `tsconfig.json`. The CLI might fail or produce unexpected results when existing files conflict.

**Why it happens:** The project already has `index.html`, `styles.css`, `scripts.js` in the root. These are the files being replaced, but `create-astro` has its own scaffolding behavior.

**How to avoid:** Use `--force` flag to allow overwriting, or (preferred) initialize with `--no-install` and manually review what the scaffold generates. The old `index.html` etc. become dead files after Astro takes over — they can be committed as-is in Phase 1 and removed when Phase 2 wires up the full layout.

**Warning signs:** CLI prompts asking about existing files, or scaffold generates an Astro-style `index.html` alongside the old one.

### Pitfall 6: `zod` Imported from Wrong Path

**What goes wrong:** `import { z } from "zod"` works locally but may pull a different Zod version than Astro bundles.

**How to avoid:** Always import Zod from `astro/zod` in content config files:
```typescript
import { z } from "astro/zod";
```

---

## Code Examples

### Full `astro.config.mjs` for Phase 1

```javascript
// Source: official Astro docs + project requirements
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

export default defineConfig({
  output: "static",
  site: "https://dawoodkamar.com",
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
```

### Sample Blog Post Frontmatter (CONTENT-04 spec)

```yaml
---
title: "Most People Aren't Behind on AI — They're Overloaded by Noise"
description: "The real problem isn't that people aren't using AI tools. It's that the signal-to-noise ratio in AI discourse is terrible."
date: 2026-03-15
category: "AI & Work"
tags: ["ai", "productivity", "signal-noise"]
draft: false
---
```

```yaml
---
title: "Focus Is Becoming a Competitive Advantage"
description: "In a world of constant distraction, the ability to concentrate deeply is increasingly rare — and increasingly valuable."
date: 2026-03-22
category: "Focus & Discipline"
tags: ["focus", "deep-work", "productivity"]
draft: false
---
```

```yaml
---
title: "What Switzerland Taught Me About Ambition"
description: "Switzerland has taught me that there's a quieter, more sustainable form of ambition — one built on craft, precision, and long-term thinking."
date: 2026-03-29
category: "Culture & Place"
tags: ["switzerland", "ambition", "culture"]
draft: true
---
```

Note: The third post is marked `draft: true` per success criterion 4 — it must not appear in production collection queries.

### Throwaway Verification Page (delete after confirming)

```astro
---
// src/pages/test-reading-time.astro
// Verify CONTENT-05 success criterion — delete after validation
import { getCollection, render } from "astro:content";

const posts = await getCollection("blog");
const testPost = posts[0];
const { remarkPluginFrontmatter } = await render(testPost);
console.log("minutesRead:", remarkPluginFrontmatter.minutesRead);
---
<pre>{JSON.stringify(remarkPluginFrontmatter, null, 2)}</pre>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Astro 5.2 (Feb 2026) | Different import path, CSS-first config |
| `tailwind.config.js` with `darkMode: 'class'` | `@custom-variant dark` in global CSS | Tailwind v4.0 (Jan 2025) | JS config no longer drives variants |
| `src/content/config.ts` | `src/content.config.ts` | Astro 5.0 (Dec 2024) | File location moved to `src/` root |
| `post.render()` method | `render(post)` from `astro:content` | Astro 5.0 | Import `render` as standalone function |
| `ViewTransitions` component | `ClientRouter` component | Astro 5.0 (renamed), removed in v6 | Import name change only |
| `type: 'content'` in defineCollection | `loader: glob(...)` | Astro 5.0 Content Layer API | New API, old still works but deprecated |

---

## Open Questions

1. **Should Phase 1 initialize via CLI or manually?**
   - What we know: `npm create astro@5 .` works in an existing directory with `--force`; it will scaffold `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/pages/index.astro`, and `src/env.d.ts`.
   - What's unclear: Whether it will conflict with existing `index.html`, `styles.css`, `scripts.js` in meaningful ways (those files are HTML/CSS/JS — Astro's scaffold adds TypeScript files, no direct conflict).
   - Recommendation: Use `npm create astro@5 . -- --template minimal --typescript strict --no-git --no-install` then immediately update `package.json` to pin `astro@5.17.0`.

2. **Which `site` URL to use?**
   - What we know: `astro.config.mjs` `site` is required for canonical URLs, sitemap, and RSS. The current live site has an existing Netlify URL.
   - What's unclear: The exact production domain is not documented in the planning files.
   - Recommendation: Use `"https://dawoodkamar.com"` as a placeholder; update if the actual Netlify URL differs. The site will deploy to whatever domain is configured in Netlify.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro runtime | ✓ (warning) | 21.5.0 (local) / 22.x (Netlify) | `brew install node@22` (22.22.2 available) |
| npm | Package management | ✓ | 10.5.0 | — |
| Homebrew | Node upgrade path | ✓ | — | — |
| Git | Version control | ✓ | (existing repo) | — |
| Netlify | Production hosting | ✓ | Node 22 in netlify.toml | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- Node 22 locally: Astro works with Node 21.x (engine warning only, not error). Netlify deploys use Node 22. If local strict-engine errors appear, `brew install node@22 && brew link node@22` resolves it.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

There is no existing test framework in this project. Phase 1 is infrastructure-only — there are no application behaviors to unit-test. Validation is done via build commands and manual inspection.

| Property | Value |
|----------|-------|
| Framework | None (build verification only) |
| Config file | N/A |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npx astro check` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETUP-01 | `npm run build` succeeds, `dist/` produced | build smoke | `npm run build` | ❌ Wave 0: create package.json with build script |
| SETUP-02 | No `@astrojs/tailwind` in package.json; Tailwind utility classes in built CSS | build + inspect | `npm run build && grep -v "@astrojs/tailwind" package.json && ls dist/_astro/*.css` | ❌ Wave 0 |
| SETUP-03 | `prose` CSS class exists in built CSS | build inspect | `npm run build && grep "prose" dist/_astro/*.css` | ❌ Wave 0 |
| SETUP-04 | `netlify.toml` has `command` and `publish` fields | file check | `grep -E "command|publish" netlify.toml` | ❌ Wave 0: update netlify.toml |
| SETUP-05 | N/A — deferred to Phase 3 | — | — | — |
| SETUP-06 | `astro.config.mjs` has `output: "static"`, `site`, Tailwind plugin | file check | `node -e "import('./astro.config.mjs').then(c => { console.log(c.default) })"` | ❌ Wave 0 |
| CONTENT-01 | `npx astro sync` produces no TypeScript errors | type check | `npx astro sync` | ❌ Wave 0: create src/content.config.ts |
| CONTENT-02 | Invalid frontmatter fails build | build smoke | `npm run build` (relies on Zod validation) | ❌ Wave 0 |
| CONTENT-03 | Draft post absent from `getCollection` in PROD | build inspect | Deploy to Netlify and verify draft post URL 404s, OR: write throwaway page that calls `getCollection` with PROD flag | ❌ Wave 0 |
| CONTENT-04 | 3 posts in `src/content/blog/` with valid frontmatter | file + build | `npm run build` (Zod validates all posts) | ❌ Wave 0: create 3 .md files |
| CONTENT-05 | `minutesRead` non-null on first post via `remarkPluginFrontmatter` | manual inspect | `npx astro dev` → visit `/test-reading-time` | ❌ Wave 0: create throwaway page |

### Sampling Rate

- **Per task commit:** `npm run build` — confirms no compilation errors
- **Per wave merge:** `npm run build && npx astro check` — full TypeScript check
- **Phase gate:** `npm run build` green + Netlify deploy succeeded + manual verification of all 5 success criteria before marking phase complete

### Wave 0 Gaps

All test infrastructure for this phase requires the Astro project to exist first. The following must be created in Plan 01-01 before any verification is possible:

- [ ] `package.json` with `"build": "astro build"` script — covers SETUP-01, SETUP-02, SETUP-03, SETUP-06
- [ ] `astro.config.mjs` — covers SETUP-06
- [ ] `netlify.toml` updated — covers SETUP-04
- [ ] `src/content.config.ts` — covers CONTENT-01, CONTENT-02
- [ ] 3 `.md` files in `src/content/blog/` — covers CONTENT-04
- [ ] `src/pages/test-reading-time.astro` (throwaway) — covers CONTENT-05

---

## Sources

### Primary (HIGH confidence)

- npm registry (`npm view astro versions`) — verified astro@5.17.0 exists; latest 5.x is 5.18.1; `latest` dist-tag is 6.1.2
- npm registry — verified `@tailwindcss/vite@4.2.2`, `reading-time@1.5.0`, `mdast-util-to-string@4.0.0`, `@tailwindcss/typography@0.5.19`
- `.planning/research/STACK.md` — prior project research (HIGH confidence, verified against official Astro docs)
- `.planning/research/FEATURES.md` — reading time recipe, draft filtering patterns
- `.planning/research/PITFALLS.md` — dark mode FOUC, netlify.toml, content config location, script re-execution
- [Astro Reading Time Recipe](https://docs.astro.build/en/recipes/reading-time/) — official docs, remark plugin pattern
- [Tailwind CSS — Install Astro](https://tailwindcss.com/docs/installation/framework-guides/astro) — official docs, `@tailwindcss/vite` setup

### Secondary (MEDIUM confidence)

- Astro engine field verified via `npm view astro@5.17.0 engines` — `18.20.8 || ^20.3.0 || >=22.0.0` (confirmed Node 21.x not in range)
- `brew info node@22` API confirmed Node 22.22.2 available via Homebrew

### Tertiary (LOW confidence)

- None — all Phase 1 patterns are verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry on 2026-04-01
- Architecture: HIGH — patterns sourced from official Astro docs and prior project research
- Pitfalls: HIGH — prior research (STACK.md, PITFALLS.md) verified against official sources; Node version issue confirmed via `node --version` and `npm view` engine field

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable ecosystem; Tailwind v4 and Astro 5.x are mature; recheck if Astro 5.19+ is released)
