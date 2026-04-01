# Project Research Summary

**Project:** Dawood Kamar — Personal Brand Website
**Domain:** Static personal portfolio + blog (Astro SSG, Netlify)
**Researched:** 2026-04-01
**Confidence:** HIGH

---

## Executive Summary

This is a content-first static site: a personal portfolio and blog built with Astro 5.17, Tailwind CSS v4, and Netlify static hosting. Research across all four domains (stack, features, architecture, pitfalls) is consistently high confidence, sourced primarily from official docs. The recommended approach is a migration from the existing vanilla HTML site — keeping Netlify as the deployment target, adding Astro as a build layer, and adopting Content Collections for the blog. The architecture is deliberately simple: no SSR adapter, no framework components, no server-side secrets in the static bundle.

The two most impactful risks — both with clear mitigations — are dark mode FOUC caused by Astro's view transition page swaps resetting `<html>` attributes, and Netlify Forms failing silently when the contact form is not present in the pre-built static HTML. Both require specific patterns at setup time; retrofitting them later is costly. A third cross-cutting concern is draft filtering: the `import.meta.env.PROD` guard must be applied consistently to every `getCollection` call, RSS feed, sitemap filter, and `getStaticPaths` — not just the blog index.

The stack is locked in and non-controversial. All major features (blog with reading time/prev-next/drafts, Buttondown newsletter, Netlify Forms contact, view transitions, SEO/sitemap/RSS) have documented implementation patterns and fit within static output with no SSR adapter required. The project can ship in three focused phases.

---

## Key Findings

### Recommended Stack

Astro 5.17 is the correct target (not Astro 6.x, which just shipped and has breaking API changes). Tailwind v4 is integrated via the `@tailwindcss/vite` Vite plugin — the old `@astrojs/tailwind` integration is deprecated and must not be used. Content Collections use the new Astro 5 Content Layer API with the `glob()` loader; the config lives at `src/content.config.ts`, not the legacy `src/content/config.ts` path. All output is static; the `@astrojs/netlify` SSR adapter is explicitly not needed and should not be installed.

**Core technologies:**
- **Astro 5.17** — static site framework; zero-JS default, MDX support, Content Collections, ClientRouter for view transitions
- **Tailwind CSS v4 + `@tailwindcss/vite`** — utility styling via Vite plugin; CSS-first config (`@theme` directive, `@plugin`, `@custom-variant`); no `tailwind.config.js`
- **`@tailwindcss/typography`** — `prose` classes for blog post rendering; configured via `@plugin` in global CSS
- **Astro Content Layer API (glob loader)** — file-based blog collections with Zod schema validation at build time
- **`@astrojs/mdx` v4+** — MDX support for embedding components in blog posts
- **`@astrojs/rss`** — RSS feed generation
- **`@astrojs/sitemap`** — automatic sitemap at build time
- **Node 22 LTS** — required by Astro 5.17; already set in `netlify.toml`

**Deprecated — do not use:**
- `@astrojs/tailwind` — replaced by `@tailwindcss/vite`
- `<ViewTransitions />` — replaced by `<ClientRouter />` from `astro:transitions`
- `post.render()` (method) — replaced by `render(post)` from `astro:content`
- `slug` field on collection entries — replaced by `id`
- `src/content/config.ts` — replaced by `src/content.config.ts`

### Expected Features

Features research provides a clear priority order. All table-stakes features have low implementation complexity.

**Must have (table stakes — blog feels broken without these):**
- Draft filtering via `import.meta.env.PROD` in every `getCollection` call — do this first, everything else depends on it
- Reading time — one remark plugin (`reading-time` + `mdast-util-to-string`), two npm deps
- Post description / excerpt — required `description` field in schema (doubles as `<meta name="description">`)
- RSS feed — `@astrojs/rss`, ~20 lines, requires `site` in `astro.config.mjs`
- Sitemap — `@astrojs/sitemap`, zero config after `site` is set
- Prev/next navigation — `findIndex` on sorted collection, sort order must match blog index

**Should have (differentiators):**
- Static tag pages via `getStaticPaths` — SEO-indexable topic clusters
- Client-side tag filter on blog index — instant UX, vanilla JS, no framework needed
- Buttondown newsletter embed — drop-in HTML form, zero backend needed on static site
- Netlify Forms contact form — static `.astro` component with `data-netlify="true"`
- View transitions (`<ClientRouter />`) — page-to-page animation, dark mode FOUC fix required

**Defer to v2+:**
- Full-content RSS (requires `sanitize-html` + `markdown-it`; summary-only RSS is sufficient for launch)
- Dynamic OG image generation (Satori/`@vercel/og` endpoint)
- Comments system

**Anti-patterns to avoid:**
- Astro Actions for newsletter — requires SSR adapter; use Buttondown's HTML embed instead
- Framework (React/Vue/Svelte) components for tag filtering — vanilla JS is sufficient
- `PUBLIC_` prefix on any API key — will be exposed in static bundle

### Architecture Approach

The architecture is a clean component hierarchy with a single shared `BaseLayout`. SEO concerns are isolated in a `BaseHead` component (canonical URLs, OG tags, Twitter card). Blog posts get an additional `ArticleJsonLd` component for structured data. All pages are statically rendered. The contact form and newsletter subscribe form are plain `.astro` components — not JS framework components — so Netlify's build-time HTML scanner detects them reliably.

**Major components:**
1. `src/components/BaseHead.astro` — all `<head>` meta, OG tags, canonical URL (requires `site` in `astro.config.mjs`)
2. `src/layouts/BaseLayout.astro` — page shell; imports `BaseHead` and `<ClientRouter />`; includes `is:inline` dark mode script in `<head>`
3. `src/layouts/PostLayout.astro` — blog post shell; adds `ArticleJsonLd`, `Prose` wrapper, prev/next navigation
4. `src/components/ArticleJsonLd.astro` — JSON-LD `BlogPosting` schema; uses `set:html` for raw JSON injection
5. `src/components/Prose.astro` — `@tailwindcss/typography` wrapper for rendered Markdown
6. `src/content.config.ts` — Content Layer API collection definition with Zod schema
7. `src/pages/rss.xml.js` — RSS endpoint (static, built at compile time)
8. `src/pages/robots.txt.ts` — dynamic endpoint referencing `Astro.site`
9. `src/pages/success.astro` — form submission redirect target

**Known regression to track:** `Astro.site` is `undefined` inside `getStaticPaths()` in Astro >= 5.13.10 (issue #14575). Workaround: export `SITE_URL` from `src/config.ts` and import it directly.

### Critical Pitfalls

1. **Dark mode FOUC on view transitions** — `<html>` attributes are reset on every ClientRouter page swap. Fix: add an `is:inline` script in `<head>` that reads `localStorage` and sets `.dark` synchronously, plus an `astro:after-swap` listener that re-applies it. Also requires `@custom-variant dark (&:where(.dark, .dark *))` in global CSS (v4 CSS config, not JS config).

2. **Tailwind v4 dark mode config is CSS-only** — `darkMode: 'class'` in a `tailwind.config.js` has no effect in v4. Dark mode classes silently stop working. Must be declared in CSS via `@custom-variant dark`.

3. **Netlify Forms not detected** — Netlify's post-build HTML scanner only sees static HTML. If the contact form is inside a JS framework component, it is invisible. Keep the form as a plain `.astro` file. Also: add `data-astro-reload` to the `<form>` tag so ClientRouter does not intercept the POST as a view transition (Pitfall 13).

4. **Draft pages still generate URLs** — filtering `getCollection` removes posts from listings, RSS, and sitemap, but the individual post URL is still generated unless the same filter is applied in `getStaticPaths`. Must filter in all four places: blog index, `getStaticPaths`, RSS, sitemap.

5. **Scripts only execute once with view transitions** — Module scripts are deduplicated by the bundler and do not re-run on ClientRouter navigations. Replace all `DOMContentLoaded` handlers with `document.addEventListener('astro:page-load', ...)`.

6. **`netlify.toml` must be updated** — the existing file has no `command` or `publish` fields (was for vanilla HTML). Must add `command = "npm run build"` and `publish = "dist"` before the first Astro deploy.

---

## Implications for Roadmap

Based on research findings, three phases are recommended. Dependency analysis from FEATURES.md drives the order: the content foundation (collections + schema + dark mode + SEO) must be solid before blog features are layered on, and integrations (newsletter, forms, analytics) come last.

### Phase 1: Foundation — Astro Setup, Layout, Dark Mode, SEO Infrastructure

**Rationale:** Every subsequent phase depends on the base layout, Tailwind v4 dark mode working correctly with view transitions, and `site` being set in `astro.config.mjs` (RSS, sitemap, canonical URLs, OG images all fail without it). The `netlify.toml` update must happen in this phase before any Astro build is deployed. Dark mode FOUC fix belongs here, not as a later cleanup.

**Delivers:** Deployable Astro site on Netlify; dark mode working correctly across navigations; `BaseLayout`, `BaseHead`, `ClientRouter` in place; `src/config.ts` with `SITE_URL`; updated `netlify.toml`.

**Addresses:** Table stakes foundation — all other features depend on this scaffolding.

**Avoids:**
- Pitfall 1 (dark mode FOUC) — fixed at setup, not retrofitted
- Pitfall 5 (Tailwind v4 dark mode CSS-only config) — handled during Tailwind install
- Pitfall 7 (`netlify.toml` not updated) — must be done before first deploy
- Pitfall 14 (wrong Tailwind integration) — use `@tailwindcss/vite`, not `@astrojs/tailwind`

### Phase 2: Blog — Content Collections, Posts, All Blog Features

**Rationale:** Content Collections, draft filtering, reading time, RSS, and sitemap are tightly coupled — they share the same `getCollection` calls and must apply the same draft filter consistently. Building them together avoids the drift that happens when features are added incrementally and the filter gets missed in one place. Prev/next navigation and static tag pages are also built here because they depend on the collection sort order being established.

**Delivers:** Fully functional blog: draft filtering everywhere, reading time, prev/next navigation, static tag pages, client-side tag filter, RSS feed, sitemap, `robots.txt`.

**Addresses:**
- All blog table-stakes features (reading time, excerpt, prev/next, drafts, RSS, sitemap)
- Differentiator: tag filtering (static + client-side)

**Avoids:**
- Pitfall 4 (draft URLs still generated) — filter applied in `getStaticPaths` as well as listings
- Pitfall 6 (wrong content config path) — `src/content.config.ts` with glob loader
- Pitfall 2 (scripts stop re-running) — `astro:page-load` used from the start

**Uses from stack:** Content Layer API (glob loader), Zod schema, `@astrojs/mdx`, `reading-time` + `mdast-util-to-string`, `@astrojs/rss`, `@astrojs/sitemap`, `@tailwindcss/typography` (Prose component), `ArticleJsonLd`

### Phase 3: Integrations — Contact Form, Newsletter, Performance Polish

**Rationale:** These features are self-contained and have no blocking dependencies on Phase 2 internals, but they benefit from a stable layout and deployed site to test against. Netlify Forms verification requires a live deploy. Newsletter embed is a drop-in form. Performance audit belongs last when the full page weight is known.

**Delivers:** Working contact form (Netlify Forms, honeypot spam filter, success page); Buttondown newsletter subscribe form; Lighthouse 90+ audit pass; OG image strategy confirmed.

**Addresses:**
- Contact form (Netlify Forms)
- Newsletter (Buttondown embed)
- Performance (Core Web Vitals: CLS, LCP, font loading)

**Avoids:**
- Pitfall 3 (Netlify Forms not detected) — pure `.astro` component + `data-netlify="true"` + `data-astro-reload`
- Pitfall 13 (ClientRouter intercepts form POST) — `data-astro-reload` on form element
- Pitfall 11 (Google Fonts render-blocking) — Fontsource npm package or Astro Fonts API
- Pitfall 12 (`client:load` overuse) — use `client:visible` or `client:idle` as default
- Pitfall 9 (remote image dimensions) — `width` and `height` always explicit for remote `<Image />`

### Phase Ordering Rationale

- `site` in `astro.config.mjs` is a hard dependency for RSS, sitemap, canonical URLs, and OG images — Phase 1 sets it; Phases 2 and 3 consume it.
- Draft filtering in Phase 2 must be applied to `getStaticPaths`, the blog index, RSS, sitemap, and tag pages simultaneously — grouping them in one phase prevents the scattered-filter bug.
- The `astro:page-load` event pattern (replacing `DOMContentLoaded`) is established in Phase 1 so that Phase 3 integrations (analytics, form scripts) follow the correct pattern from the start.
- Netlify Forms verification requires a complete build and deploy; testing it in Phase 3 ensures the form HTML is present in the built output.

### Research Flags

Phases with well-documented patterns (research-phase likely unnecessary):
- **Phase 1:** Standard Astro + Tailwind v4 setup; official docs are definitive
- **Phase 2:** All blog features have official Astro recipes or verified community patterns
- **Phase 3:** Netlify Forms and Buttondown are thoroughly documented; no novel integration

Phases that may benefit from a quick research check during planning:
- **Phase 3 (performance):** Tailwind v4 CSS purging behaviour is marked MEDIUM confidence — verify actual output CSS size after build before assuming purging is working correctly
- **Phase 1 (fonts):** Astro Fonts API (`experimental.fonts`) is still experimental as of April 2026; confirm stability or fall back to Fontsource

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from official Astro and Tailwind docs; version choices are conservative (Astro 5.17 over 6.x) |
| Features | HIGH | All table-stakes features use official Astro recipes; MEDIUM only on excerpt auto-generation and client-side filter (community patterns, but multiple sources agree) |
| Architecture | HIGH | BaseHead/BaseLayout/PostLayout pattern is the standard Astro template approach; Netlify Forms pattern verified against official docs and netlify-templates/astro-toolbox reference implementation |
| Pitfalls | HIGH | Critical pitfalls (FOUC, Forms, scripts) sourced from official GitHub issues and Netlify docs; one MEDIUM on Tailwind v4 CSS purging |

**Overall confidence: HIGH**

### Gaps to Address

- **Tailwind v4 CSS purging:** Behaviour for `.astro` files under the Vite plugin auto-detection is marked MEDIUM confidence. After Phase 2 build, inspect `dist/` CSS output size. Over 50KB is a red flag.
- **Astro.site in getStaticPaths (issue #14575):** May be resolved in a patch release by build time. Use `src/config.ts` `SITE_URL` export as the workaround regardless — it is a safer pattern than relying on `Astro.site` in that scope.
- **Astro Fonts API stability:** `experimental.fonts` may not be stable. Decide at Phase 1 whether to use it or Fontsource. Fontsource is the lower-risk choice.
- **OG image strategy:** Research did not fully resolve whether static OG images per post or a single default OG image is sufficient for launch. Defer dynamic OG generation (Satori) to v2+; use a single default `og-default.jpg` in Phase 1.

---

## Sources

### Primary (HIGH confidence)
- [Astro Docs — Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs — View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Astro Docs — Deploy to Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Astro Docs — Images](https://docs.astro.build/en/guides/images/)
- [Astro Docs — Reading Time Recipe](https://docs.astro.build/en/recipes/reading-time/)
- [Astro Docs — RSS Recipe](https://docs.astro.build/en/recipes/rss/)
- [Astro Docs — @astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro Docs — Upgrade to v5](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Tailwind CSS Docs — Install with Astro](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [Netlify Forms Setup Docs](https://docs.netlify.com/manage/forms/setup/)
- [Buttondown Docs — Building Your Subscriber Base](https://docs.buttondown.com/building-your-subscriber-base)
- [netlify-templates/astro-toolbox — Reference implementation](https://github.com/netlify-templates/astro-toolbox)
- [Astro issue #14575 — Astro.site undefined in getStaticPaths](https://github.com/withastro/astro/issues/14575)
- [Astro issue #7765 — html attributes reset on view transition swap](https://github.com/withastro/astro/issues/7765)
- [Netlify adapter issue #14087 — SSR regression](https://github.com/withastro/astro/issues/14087)

### Secondary (MEDIUM confidence)
- [Simon Porter — FOUC with Astro transitions and Tailwind](https://www.simonporter.co.uk/posts/what-the-fouc-astro-transitions-and-tailwind/)
- [namoku.dev — Dark mode + view transitions](https://namoku.dev/blog/darkmode-tailwind-astro/)
- [Chen Hui Jing — Astro 4→5 content collections migration](https://chenhuijing.com/blog/migrating-content-collections-from-astro-4-to-5/)
- [Scott Willsey — Creating Drafts in Astro](https://scottwillsey.com/creating-drafts-in-astro/)
- [John Dalesandro — Prev/Next Post Navigation](https://johndalesandro.com/blog/astro-adding-previous-and-next-post-navigation-links-to-blog/)
- [Tailwind v4 @layer components change — Discussion #17526](https://github.com/tailwindlabs/tailwindcss/discussions/17526)
- [Netlify canonical URL override — Support forum](https://answers.netlify.com/t/in-production-netlify-keeps-overriding-my-canonical-url-that-i-have-set-up-in-astro-config/139110)
- [Netlify Forms not working on Astro — Support thread](https://answers.netlify.com/t/netlify-forms-on-astro-no-framework-doesnt-work/103723)

---

*Research completed: 2026-04-01*
*Ready for roadmap: yes*
