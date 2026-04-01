# Domain Pitfalls: Astro + Netlify Portfolio Migration

**Domain:** Static personal portfolio/blog, vanilla HTML → Astro SSG
**Researched:** 2026-04-01
**Applies to:** redesign branch, same Netlify deployment

---

## Critical Pitfalls

Mistakes that cause broken deploys, visible regressions, or rewrites.

---

### Pitfall 1: Dark Mode FOUC with View Transitions

**What goes wrong:** The `dark` class lives on `<html>`. When Astro's ClientRouter swaps pages, the entire `<body>` is replaced, but `<html>` attributes are also reset during the swap phase. The result is a flash of light mode on every navigation, even when the user has dark mode active.

**Why it happens:** Theme preference is typically read from `localStorage` and applied via JavaScript. If that script runs after the swap, the browser paints the unstyled (light) state first. This is the same root cause as the classic FOUC, but triggered on every client-side navigation rather than only on first load.

**Consequences:** Highly visible flicker on every page transition. Worsens on slower connections or CPUs. Breaks the dark-mode contract the user already has on the current site.

**Prevention:**
1. Place a `is:inline` script in the `<head>` of your base layout that reads `localStorage` and sets the class synchronously — before the first paint.
2. Add an `astro:after-swap` event listener that re-applies the class immediately after each page swap, before the browser paints:
   ```js
   document.addEventListener('astro:after-swap', () => {
     const theme = localStorage.getItem('theme');
     document.documentElement.classList.toggle('dark', theme === 'dark');
   });
   ```
3. In Tailwind v4, configure the dark variant with `:where()` to reduce specificity conflicts: `@custom-variant dark (&:where(.dark, .dark *))`.

**Detection:** Open DevTools → Performance tab. Record a page navigation. Look for a brief white/light frame before content settles.

**Sources:** [simonporter.co.uk FOUC post](https://www.simonporter.co.uk/posts/what-the-fouc-astro-transitions-and-tailwind/), [namoku.dev dark mode + view transitions](https://namoku.dev/blog/darkmode-tailwind-astro/), [Astro issue #7765](https://github.com/withastro/astro/issues/7765)

---

### Pitfall 2: Scripts That Only Run Once (View Transitions)

**What goes wrong:** Module scripts (`<script>`) are deduplicated by Astro's bundler and executed only once per browser session, not on every navigation. Any code that initialises UI state (hamburger menu listeners, scroll animations, analytics) will stop working after the first navigation.

**Why it happens:** This is intentional browser + bundler behaviour. Module scripts are cached; the browser will not re-execute a script it has already run. Astro's ClientRouter does not override this.

**Consequences:** Interactive elements silently break after the first page load. Hard to catch in development because you typically test pages in isolation.

**Prevention:**
- Replace `DOMContentLoaded` with `astro:page-load`:
  ```js
  document.addEventListener('astro:page-load', () => {
    // re-initialise menu, listeners, etc.
  });
  ```
- Use `data-astro-rerun` on an `is:inline` script only as a last resort (it prevents bundling and deduplication, increasing payload).
- Never rely on `window.onload` or `DOMContentLoaded` for anything that needs to survive navigation.

**Detection:** Navigate away from a page and back. Click hamburger menu or any interactive element. If it is unresponsive, this is the cause.

**Sources:** [Astro view transitions docs](https://docs.astro.build/en/guides/view-transitions/), [issue #9798 inline scripts not re-executing](https://github.com/withastro/astro/issues/9798)

---

### Pitfall 3: Netlify Forms Not Detected in Astro SSG Builds

**What goes wrong:** Netlify detects forms by parsing the static HTML output at build time. If the form is rendered client-side by a framework component (React, Svelte, etc.) or conditionally hidden, Netlify never sees it and the form will not appear in the dashboard, silently dropping all submissions.

**Why it happens:** Netlify's post-build HTML parser does not execute JavaScript. It only sees the raw `.html` files in the `dist/` directory.

**Consequences:** Form submissions silently 404 or are ignored. No error shown to the user.

**Prevention:**
1. Keep the contact form as a plain `.astro` component (not a JS framework component). Astro renders it to static HTML at build time, which Netlify will detect.
2. If you must enhance the form with JavaScript, add a hidden duplicate form in `public/` as a static `.html` file — Netlify will detect the hidden form and map submissions to it.
3. Required attributes for detection:
   ```html
   <form name="contact" method="POST" data-netlify="true">
     <input type="hidden" name="form-name" value="contact" />
     <!-- fields -->
   </form>
   ```
4. The `name` attribute on the `<form>` element must match the `value` of the hidden `form-name` input exactly.
5. For spam protection, add `netlify-honeypot="bot-field"` and a hidden honeypot field.

**Detection:** After deploy, go to Netlify dashboard → Forms. If the form does not appear within a minute of deploy, it was not detected.

**Sources:** [Netlify Forms setup docs](https://docs.netlify.com/manage/forms/setup/), [Netlify support thread](https://answers.netlify.com/t/netlify-forms-on-astro-no-framework-doesnt-work/103723), [Netlify official Astro blog post](https://www.netlify.com/blog/deploy-an-astro-site-with-forms-serverless-functions-and-redirects/)

---

### Pitfall 4: API Keys Exposed in Static Builds

**What goes wrong:** Any environment variable used inside an `.astro` component's frontmatter (`---`) or any server-side code is evaluated at build time and baked into the HTML output. If the value ends up in client-visible markup or is prefixed `PUBLIC_`, it is exposed to every visitor.

**Why it happens:** Astro (via Vite) statically replaces `import.meta.env.*` references at build time. There is no runtime secret layer for a static site.

**Consequences:** Newsletter API keys, Mailchimp/Resend/ConvertKit tokens leak publicly. Attackers can send unlimited emails on your quota or harvest subscriber lists.

**Prevention:**
- Never use `PUBLIC_` prefix for API keys. `PUBLIC_*` variables are explicitly included in the client bundle.
- For newsletter sign-up (POST to external API): use a Netlify Function as a proxy. The function runs server-side, holds the secret, and the client POSTs to `/.netlify/functions/subscribe` instead of directly to the API.
- Set secrets in Netlify UI under Site Settings → Environment Variables. They are available to Netlify Functions at runtime without being baked into the build.

**Detection:** `grep -r "PUBLIC_" src/` for any key that should remain secret. Inspect built HTML in `dist/` for leaked tokens.

---

### Pitfall 5: Tailwind v4 Dark Mode Requires CSS Config, Not JS Config

**What goes wrong:** Developers migrating from v3 write a `tailwind.config.js` with `darkMode: 'class'`. In v4, the JS config file is no longer the primary configuration mechanism. The `darkMode: 'class'` setting has no effect in v4 without the corresponding CSS declaration.

**Why it happens:** Tailwind v4 moved to a CSS-first configuration. The `@tailwindcss/vite` plugin does not read a JS config for variant definitions.

**Consequences:** `dark:` utility classes silently have no effect. The site looks broken in dark mode.

**Prevention:** In your global CSS file (e.g. `src/styles/global.css`), add the variant declaration instead of a JS config:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```
Do not use `@astrojs/tailwind` for v4 — it is deprecated. Use `@tailwindcss/vite` added directly to `astro.config.mjs` under `vite.plugins`.

**Sources:** [Tailwind v4 Astro setup guide](https://tailkits.com/blog/astro-tailwind-setup/), [Tailwind dark mode docs v3](https://v3.tailwindcss.com/docs/dark-mode), [Astro 5.2 announcement](https://astro.build/blog/astro-520/)

---

## Moderate Pitfalls

---

### Pitfall 6: Content Collections Config File Location Changed in Astro 5

**What goes wrong:** Docs, tutorials, and blog posts written for Astro 2–4 place the config at `src/content/config.ts`. Astro 5 moved it to `src/content.config.ts` (at the `src/` root, not inside `src/content/`).

**Prevention:** Create the file at `src/content.config.ts`. Run `npx astro sync` after changing config to regenerate TypeScript types. Also note: Astro 5 replaces `type: 'content'` with the `loader: glob(...)` API.

**Sources:** [Chen Hui Jing migration post](https://chenhuijing.com/blog/migrating-content-collections-from-astro-4-to-5/), [Astro content collections docs](https://docs.astro.build/en/guides/content-collections/)

---

### Pitfall 7: netlify.toml Must Be Updated for Astro's Build Output

**What goes wrong:** The existing `netlify.toml` in this repo was created for vanilla HTML — no build command, served from root. Netlify will use those settings if the file is not updated, deploying the wrong directory or skipping the Astro build entirely.

**Prevention:** Update `netlify.toml` to:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```
Node 22 is required (Astro requires v22.12.0+). The repo already sets this in `netlify.toml` for Netlify's build image, which is correct — just ensure the `command` and `publish` fields are added.

**Detection:** After first Astro deploy, check Netlify build log for the publish directory. If it says the root `/` is being published, the config was not updated.

---

### Pitfall 8: View Transitions Break Scroll Position on Back Navigation

**What goes wrong:** When a user scrolls down a page, clicks a link, then presses the browser back button, the scroll position is not restored to where they were. Astro's ClientRouter does not automatically restore scroll position from history.

**Prevention:** Manually persist scroll position using `astro:before-swap` (save) and `astro:after-swap` (restore) with `sessionStorage`. For a portfolio this is lower priority, but worth noting if blog post pages become long.

**Sources:** [Astro issue #7847](https://github.com/withastro/astro/issues/7847), [Astro view transitions docs](https://docs.astro.build/en/guides/view-transitions/)

---

### Pitfall 9: Remote Images Require Explicit width and height

**What goes wrong:** If you use Astro's `<Image>` component with remote URLs (e.g. a CDN-hosted headshot or project screenshot) and omit `width` and `height`, Astro throws a build error and the build fails.

**Why it happens:** Astro infers dimensions for local images by reading the file. Remote images have no intrinsic size available at build time, so dimensions must be provided explicitly to prevent CLS.

**Prevention:** Always pass `width` and `height` to `<Image>` for remote sources. For local images in `src/`, dimensions are inferred automatically — prefer `src/` over `public/` for images that benefit from optimisation.

**Sources:** [Astro missing image dimension error](https://docs.astro.build/en/reference/errors/missing-image-dimension/), [Astro images guide](https://docs.astro.build/en/guides/images/)

---

### Pitfall 10: Netlify Adapter Version Instability

**What goes wrong:** The `@astrojs/netlify` adapter has had regressions in recent versions. v6.5.0+ broke all SSR requests with an unhandled exception related to Edge Functions. v6.5.1 did not fix it.

**Why it matters for this project:** This project is pure SSG (no SSR). The Netlify adapter is only required for on-demand rendering. A static Astro site does NOT need the adapter at all — Netlify serves the `dist/` output directly.

**Prevention:** Do not install `@astrojs/netlify` unless SSR or on-demand rendering is needed. Keep output mode as `'static'` (Astro's default). If a Netlify Function is needed for newsletter subscriptions, implement it as a standalone function in `netlify/functions/`, not via the adapter.

**Sources:** [Netlify adapter issue #14087](https://github.com/withastro/astro/issues/14087), [Astro deploy to Netlify docs](https://docs.astro.build/en/guides/deploy/netlify/)

---

## Minor Pitfalls

---

### Pitfall 11: Google Fonts via `<link>` Tags Tank LCP

**What goes wrong:** The common pattern of pasting a Google Fonts `<link>` into `<head>` adds two render-blocking round trips (DNS + CSS fetch) before the browser can render text. Lighthouse penalises this heavily under "Eliminate render-blocking resources."

**Prevention:** Choose one of:
- Self-host fonts using [Fontsource](https://fontsource.org/) (npm package, tree-shaken, local files) — best for Lighthouse.
- If Google Fonts is preferred, inline the CSS using [astro-google-fonts-optimizer](https://github.com/sebholstein/astro-google-fonts-optimizer) which downloads and inlines the font CSS at build time.
- Add `font-display: swap` and a `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` as a minimum mitigation.

**Sources:** [astro-google-fonts-optimizer](https://github.com/sebholstein/astro-google-fonts-optimizer), [Astro custom fonts guide](https://docs.astro.build/en/guides/fonts/)

---

### Pitfall 12: Overusing client:load Destroys Performance

**What goes wrong:** Adding `client:load` to every interactive component forces JavaScript to hydrate on every page load, negating Astro's zero-JS default. The result is bundle bloat and poor TTI.

**Prevention:** Default to no client directive (server-render only). Use directives in this order of preference: `client:visible` (hydrate when in viewport) → `client:idle` (hydrate when browser is idle) → `client:load` (hydrate immediately, only for above-the-fold critical UI).

**Sources:** [Astro performance guide](https://eastondev.com/blog/en/posts/dev/20251202-astro-performance-optimization/)

---

### Pitfall 13: Forms With view transitions Submit Without Page Reload

**What goes wrong:** By default, Astro's ClientRouter intercepts form `GET` and `POST` submissions and handles them as view transitions rather than full navigations. This can cause unexpected behaviour with Netlify Forms, which expects a standard HTTP POST and redirect.

**Prevention:** Add `data-astro-reload` to any form element that should submit via standard browser navigation:
```html
<form name="contact" method="POST" data-netlify="true" data-astro-reload>
```

**Sources:** [Astro view transitions docs — forms](https://docs.astro.build/en/guides/view-transitions/)

---

### Pitfall 14: Tailwind v3 `@astrojs/tailwind` Integration is Deprecated for v4

**What goes wrong:** Running `npx astro add tailwind` on a fresh Astro 5 project may still install the legacy `@astrojs/tailwind` integration depending on the CLI version. This integration is designed for Tailwind v3. Using it with v4 produces silent failures or mismatched styles.

**Prevention:** For Tailwind v4, install manually:
```bash
npm install tailwindcss @tailwindcss/vite
```
Then add the Vite plugin directly to `astro.config.mjs`. Do not install `@astrojs/tailwind` for new projects targeting Tailwind v4.

**Sources:** [Tailwind official Astro install guide](https://tailwindcss.com/docs/installation/framework-guides/astro), [Astro 5.2 release](https://astro.build/blog/astro-520/)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Initial Astro setup | Wrong Tailwind integration (`@astrojs/tailwind` vs `@tailwindcss/vite`) | Use Vite plugin, not legacy integration |
| Dark mode implementation | FOUC on view transitions | `is:inline` head script + `astro:after-swap` listener |
| View transitions rollout | Scripts stop re-running | Replace all `DOMContentLoaded` with `astro:page-load` |
| Contact form | Netlify Forms not detected | Pure `.astro` component + `data-netlify` + `data-astro-reload` |
| Newsletter feature | API key leaked in static build | Netlify Function proxy; never use `PUBLIC_` prefix for secrets |
| Content collections | Wrong config file path | `src/content.config.ts` (Astro 5), not `src/content/config.ts` |
| Netlify deploy | Old `netlify.toml` settings | Update `command` and `publish` fields; keep `NODE_VERSION = "22"` |
| Images | CLS on remote images | Always pass `width` and `height` to `<Image>` |
| Fonts | LCP regression | Self-host via Fontsource or inline CSS at build time |

---

## Sources

- [Astro View Transitions Docs](https://docs.astro.build/en/guides/view-transitions/) — HIGH confidence, official
- [Astro Deploy to Netlify Docs](https://docs.astro.build/en/guides/deploy/netlify/) — HIGH confidence, official
- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/) — HIGH confidence, official
- [Astro Images Docs](https://docs.astro.build/en/guides/images/) — HIGH confidence, official
- [Tailwind v4 Astro Install Guide](https://tailwindcss.com/docs/installation/framework-guides/astro) — HIGH confidence, official
- [Netlify Forms Setup Docs](https://docs.netlify.com/manage/forms/setup/) — HIGH confidence, official
- [FOUC with Astro transitions and Tailwind — Simon Porter](https://www.simonporter.co.uk/posts/what-the-fouc-astro-transitions-and-tailwind/) — MEDIUM confidence, community post with code
- [Dark mode + view transitions — namoku.dev](https://namoku.dev/blog/darkmode-tailwind-astro/) — MEDIUM confidence, community post
- [Netlify adapter breaking changes issue #14087](https://github.com/withastro/astro/issues/14087) — HIGH confidence, official tracker
- [astro-fouc-killer library](https://github.com/avgvstvs96/astro-fouc-killer) — MEDIUM confidence
- [Netlify Forms not working thread](https://answers.netlify.com/t/netlify-forms-on-astro-no-framework-doesnt-work/103723) — MEDIUM confidence, community report verified by multiple users
- [Astro view transitions issue #7765 (html attributes reset)](https://github.com/withastro/astro/issues/7765) — HIGH confidence, official tracker
- [astro-google-fonts-optimizer](https://github.com/sebholstein/astro-google-fonts-optimizer) — MEDIUM confidence
- [Astro performance guide — BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20251202-astro-performance-optimization/) — MEDIUM confidence
- [Chen Hui Jing — Astro 4→5 content collections migration](https://chenhuijing.com/blog/migrating-content-collections-from-astro-4-to-5/) — MEDIUM confidence
