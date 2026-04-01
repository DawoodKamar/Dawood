# Phase 2: Layout & Navigation — Research

**Researched:** 2026-04-01
**Domain:** Astro 5 ClientRouter, View Transitions, BaseLayout, dark mode FOUC, homepage sections
**Confidence:** HIGH — all core patterns verified against official Astro docs and prior project research

---

## Summary

Phase 2 builds the persistent site shell (BaseLayout, Navigation, Footer) with Astro's ClientRouter for view transitions, then renders all five homepage sections wired to live content collection data. The phase also deletes the throwaway `test-reading-time.astro` page from Phase 1.

The two technically tricky areas are dark mode FOUC prevention and script re-execution after transitions. Both have well-established solutions in the project's prior research (`.planning/research/PITFALLS.md`) and are verified against official Astro docs. The `is:inline` + `astro:before-swap` pattern is the correct approach; `astro:after-swap` is one lifecycle step too late and risks a visible flash.

For the homepage featured-posts section (HOME-04), the collection query must filter drafts and sort by `date` descending before slicing the first three. The `switzerland-ambition.md` post has `draft: true`, so only two posts currently exist as published — the section will render two cards unless a third non-draft post is added, or the slice is changed to show "up to 3". This is a known, benign state.

The newsletter section (HOME-05) is a placeholder form per the roadmap — full Buttondown integration ships in Phase 3. Phase 2 should render the section with static HTML only (no API call, no hidden fields). The plan should make this explicit so no incomplete integration is accidentally wired.

**Primary recommendation:** Build BaseLayout first with ClientRouter + dark mode fix, wire Navigation with `astro:page-load` listener for hamburger, then build all five homepage sections in a single plan step using live collection data.

---

<user_constraints>
## User Constraints (from STATE.md Accumulated Context)

### Locked Decisions
- Use `@tailwindcss/vite` NOT `@astrojs/tailwind` (deprecated in Astro 5.2)
- Use `<ClientRouter />` from `astro:transitions` NOT `<ViewTransitions />`
- `src/content.config.ts` NOT `src/content/config.ts` (Astro 5 path)
- Use standalone `render()` from `astro:content` NOT `post.render()` method
- Do NOT install `@astrojs/netlify` adapter — static site, no SSR needed
- `@tailwindcss/vite` NOT `@astrojs/tailwind` (deprecated in Astro 5.2)
- Astro 5.17.0 pinned exactly (no caret) for reproducible builds
- Tailwind v4 pattern: `@import 'tailwindcss'` + `@plugin` directive (not `@tailwind` directives)
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))` — class-based on `html` element
- Content collection at `src/content.config.ts` (Astro 5 requires `src/` root, not `src/content/`)
- `test-reading-time.astro` is a throwaway verification artifact to be deleted in Phase 2

### Claude's Discretion
- Component design and visual layout of homepage sections (pending UI hint: yes)
- Whether to use `aria-current="page"` or a CSS class for active nav link styling
- Whether newsletter placeholder uses a disabled input or a static CTA message

### Deferred Ideas (OUT OF SCOPE)
- Full Buttondown API integration (Phase 3: NEWS-01 through NEWS-04)
- Blog listing page `/blog` (Phase 3: BLOG-01)
- Individual post pages `/blog/[slug]` (Phase 3: BLOG-03)
- Contact page (Phase 3: CONTACT-01 through CONTACT-06)
- SEO metadata components (Phase 4: SEO-01 through SEO-10)
- Sitemap, RSS, robots.txt (Phase 4)
- Lighthouse performance audit (Phase 4)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | `BaseLayout.astro` wraps all pages with `<ClientRouter />` from `astro:transitions` for view transitions | `import { ClientRouter } from "astro:transitions"` — verified official import path |
| NAV-02 | `Navigation.astro`: links to `/`, `/blog`, `/contact`; active page highlighted; mobile hamburger menu | `Astro.url.pathname` comparison for active state; `astro:page-load` for hamburger re-init |
| NAV-03 | `Footer.astro`: copyright, nav links, social links (YouTube, LinkedIn); persistent on all pages | Static `.astro` component rendered inside `BaseLayout` |
| NAV-04 | View transitions (crossfade or slide) between all pages; graceful fallback for unsupported browsers | `<ClientRouter />` defaults to `fade`; `fallback="animate"` is the default for unsupported browsers |
| NAV-05 | Scripts using `DOMContentLoaded` migrated to `astro:page-load` event listener | Replace all `DOMContentLoaded` / `window.onload` with `document.addEventListener("astro:page-load", ...)` |
| NAV-06 | Dark mode FOUC prevention: synchronous `is:inline` head script + `astro:after-swap` listener | Use `astro:before-swap` on `event.newDocument` — fires before DOM swap, inside the transition |
| NAV-07 | Dark mode toggled via `.dark` class on `<html>`; preference stored in `localStorage` | Already established in `global.css` via `@custom-variant dark`; toggle logic in `BaseLayout` inline script |
| HOME-01 | Hero section with headline, subheadline, and CTA linking to `/blog` | Static section in `src/pages/index.astro` |
| HOME-02 | Positioning section with 2–3 paragraphs of body text | Static section with placeholder text from brief |
| HOME-03 | Content pillars section: 4 pillars each with title and short description | Static 4-item grid: AI & Work, Focus & Discipline, Culture & Place, Clarity & Communication |
| HOME-04 | Featured posts: 3 most recent non-draft blog posts (title, excerpt, date, reading time) with links | `getCollection("blog", draft filter)` + sort by `date` desc + `render()` for `minutesRead` |
| HOME-05 | Newsletter signup section with email input and submit button | Placeholder HTML form only (no Buttondown action — full integration deferred to Phase 3) |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 5.17.0 | Framework — already installed, pinned | Locked decision; do not upgrade |
| astro:transitions | (built-in) | `ClientRouter` for SPA-style navigation | Built into Astro 5, no install needed |
| @tailwindcss/vite | 4.2.2 | Tailwind v4 Vite plugin — already installed | Locked decision |
| @tailwindcss/typography | 0.5.19 | `prose` classes — already installed | For blog post rendering later; already configured |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro:content | (built-in) | `getCollection`, `render` | Fetch blog posts for HOME-04 |
| astro/zod | (bundled) | Schema types | Already used; no new install |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `astro:before-swap` for dark mode | `astro:after-swap` | `after-swap` fires after DOM paint — risks visible flash. `before-swap` fires inside the transition while old page is still shown. |
| `Astro.url.pathname` for active link | JS-based `window.location` after load | SSR approach is zero-JS; JS approach requires `astro:page-load` listener and adds complexity |
| Static newsletter placeholder | Wiring Buttondown form now | Buttondown integration is Phase 3 scope; shipping a broken/untested form is worse than a placeholder |

**Installation:** No new packages needed for Phase 2. All dependencies are already installed from Phase 1.

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
  layouts/
    BaseLayout.astro        # Wraps every page; contains ClientRouter, head, nav, footer
  components/
    Navigation.astro        # Nav links + hamburger menu
    Footer.astro            # Copyright + social links
  pages/
    index.astro             # Homepage — five sections wired to live data
    test-reading-time.astro # DELETE in Wave 0 of Plan 02-01
```

### Pattern 1: BaseLayout with ClientRouter and FOUC Prevention

**What:** The base layout that every page wraps. Includes `<ClientRouter />`, an `is:inline` script that applies the dark theme synchronously on load, and an `astro:before-swap` listener to re-apply it on every navigation.

**When to use:** Every page in the site uses this layout.

```astro
---
// src/layouts/BaseLayout.astro
// Source: https://docs.astro.build/en/guides/view-transitions/
import { ClientRouter } from "astro:transitions";
import Navigation from "../components/Navigation.astro";
import Footer from "../components/Footer.astro";
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Dawood Kamar — writing on AI, focus, and work." } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <ClientRouter />
    <!-- FOUC prevention: runs synchronously before first paint -->
    <script is:inline>
      (function () {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      })();
      // Re-apply after each page swap (fires before DOM paint of new page)
      document.addEventListener("astro:before-swap", (event) => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
          event.newDocument.documentElement.classList.add("dark");
        }
      });
    </script>
  </head>
  <body>
    <Navigation />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**Critical detail:** The `astro:before-swap` listener must use `event.newDocument.documentElement` — not `document.documentElement`. The new document is passed as `event.newDocument` before it replaces the current DOM. Writing to `document.documentElement` in `before-swap` modifies the outgoing page, not the incoming one.

### Pattern 2: Navigation with Active Link and astro:page-load

**What:** Navigation component that highlights the active page using `Astro.url.pathname` (server-side) and wires the hamburger toggle using `astro:page-load` (so it fires on every navigation, not just initial load).

```astro
---
// src/components/Navigation.astro
// Source: https://docs.astro.build/en/guides/view-transitions/#astropage-load
const currentPath = Astro.url.pathname;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];
---
<nav>
  <a href="/" aria-label="Home">Dawood Kamar</a>

  <ul>
    {navLinks.map(({ href, label }) => (
      <li>
        <a
          href={href}
          aria-current={currentPath === href ? "page" : undefined}
          class={currentPath === href ? "active" : ""}
        >
          {label}
        </a>
      </li>
    ))}
  </ul>

  <!-- Hamburger toggle (mobile) -->
  <button id="menu-toggle" aria-expanded="false" aria-controls="mobile-menu">
    <span class="sr-only">Toggle menu</span>
    <!-- icon -->
  </button>

  <div id="mobile-menu" hidden>
    <!-- Mobile nav links -->
  </div>
</nav>

<script>
  // astro:page-load fires on initial load AND after every ClientRouter navigation
  // This is the correct replacement for DOMContentLoaded in an Astro transitions site
  document.addEventListener("astro:page-load", () => {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  });
</script>
```

**Key insight on active link:** `Astro.url.pathname` is evaluated at server render time. This means the active state is baked into the HTML for every page — no client-side JavaScript is needed for highlighting. The `aria-current="page"` attribute is the correct semantic approach alongside any visual CSS class.

**Trailing slash behaviour:** Astro's default config adds trailing slashes to all internal routes. `/blog` and `/blog/` are different strings. Use the trailing-slash form in nav hrefs to match `Astro.url.pathname`.

### Pattern 3: Dark Mode Toggle in Navigation

**What:** The dark mode toggle button updates `localStorage` and toggles the `.dark` class on `document.documentElement`. Must be wrapped in `astro:page-load` to re-attach after navigation.

```javascript
document.addEventListener("astro:page-load", () => {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
```

**What NOT to do:** Do not use `DOMContentLoaded` for this. After the first navigation, `DOMContentLoaded` will not fire again and the toggle will stop working.

### Pattern 4: Homepage Featured Posts (HOME-04)

**What:** Query the blog collection, filter drafts, sort by date descending, slice 3, render each to get `minutesRead`.

```astro
---
// In src/pages/index.astro (featured posts section)
import { getCollection, render } from "astro:content";

const allPosts = await getCollection("blog", ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
);

const featuredPosts = allPosts
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);

// Get reading time for each featured post
const postsWithReadingTime = await Promise.all(
  featuredPosts.map(async (post) => {
    const { remarkPluginFrontmatter } = await render(post);
    return { post, minutesRead: remarkPluginFrontmatter.minutesRead };
  })
);
---
{postsWithReadingTime.map(({ post, minutesRead }) => (
  <article>
    <a href={`/blog/${post.id}/`}>
      <h3>{post.data.title}</h3>
    </a>
    <p>{post.data.description}</p>
    <time datetime={post.data.date.toISOString()}>
      {post.data.date.toLocaleDateString("en-GB", { dateStyle: "medium" })}
    </time>
    <span>{minutesRead}</span>
    <span>{post.data.category}</span>
  </article>
))}
```

**Important:** The field name is `date`, not `pubDate` — matches the content schema in `src/content.config.ts`. Using `pubDate` will return `undefined`.

### Pattern 5: Newsletter Placeholder (HOME-05)

**What:** A static HTML form section with no action URL wired. Full Buttondown integration is Phase 3 scope.

```astro
<!-- Newsletter placeholder — action intentionally left empty until Phase 3 -->
<section>
  <h2>Stay in the loop</h2>
  <p>Writing on AI, focus, and meaningful work. No noise.</p>
  <form>
    <input type="email" placeholder="your@email.com" required disabled />
    <button type="submit" disabled>Coming soon</button>
  </form>
  <p class="text-sm">Newsletter launching soon.</p>
</section>
```

Alternatively, use a static call-to-action link to the Buttondown signup page directly (no form) — this also satisfies HOME-05 without shipping a broken form. Planner may choose either approach.

### Anti-Patterns to Avoid

- **`DOMContentLoaded` for interactive UI:** Fires only once per browser session with ClientRouter. Replace with `astro:page-load`.
- **`astro:after-swap` for dark mode:** Fires after DOM is painted — user sees a flash. Use `astro:before-swap` with `event.newDocument`.
- **`document.documentElement` in `astro:before-swap`:** This is the outgoing document. Use `event.newDocument.documentElement` for the incoming page.
- **`<ViewTransitions />`:** Renamed component from Astro 4. In Astro 5 it is `<ClientRouter />` from `astro:transitions`. Using the old name is a runtime error.
- **Trailing slash mismatch:** If navLink href is `/blog` but `Astro.url.pathname` returns `/blog/`, active link check silently fails. Match trailing slashes consistently.
- **Calling `render()` on all posts for reading time:** Only call `render()` on the posts you need to display. Calling it on all posts at homepage load time adds unnecessary build cost.
- **Wiring Buttondown form in Phase 2:** The Buttondown username/API endpoint is not yet set up in Phase 2 scope. Ship a placeholder to avoid a broken UX.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SPA-style navigation | Custom fetch + DOM replacement | `<ClientRouter />` | Handles scroll, history, transitions, fallback — hundreds of edge cases |
| FOUC prevention | Complex cookie or server-side theme detection | `is:inline` script + `astro:before-swap` | The platform gives you the exact hook needed; custom solutions are fragile |
| Active link detection | JS that reads `window.location` after load | `Astro.url.pathname` at render time | Zero JS, baked into HTML, works with transitions |
| Script re-execution after navigation | Manual script cloning or MutationObserver | `astro:page-load` event | Built-in lifecycle event designed exactly for this |
| View transition animation | CSS keyframe animations | `transition:animate="fade"` or `"slide"` | Built-in, GPU-accelerated, graceful fallback included |

**Key insight:** Astro's view transitions lifecycle events (`astro:page-load`, `astro:before-swap`, `astro:after-swap`) solve every common SPA scripting problem. Never work around them with custom DOM manipulation.

---

## Common Pitfalls

### Pitfall 1: Dark Mode Flash on Navigation (FOUC)

**What goes wrong:** User navigates to a new page while in dark mode. The page briefly appears in light mode before snapping dark.

**Why it happens:** `astro:after-swap` fires after the DOM has already been swapped and the browser has painted the new page. The new page starts in light mode for one frame.

**How to avoid:** Use `astro:before-swap` with `event.newDocument.documentElement`:
```javascript
document.addEventListener("astro:before-swap", (event) => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    event.newDocument.documentElement.classList.add("dark");
  }
});
```
This fires while the old page's snapshot is still visible — the new document is being prepared, not yet painted.

**Warning signs:** Dark mode works fine on first load and direct URL visits, but flashes light on every internal link click.

### Pitfall 2: Hamburger Menu Stops Working After Navigation

**What goes wrong:** User opens page directly — hamburger works. User clicks a nav link — hamburger on the new page does nothing.

**Why it happens:** The `<script>` block in `Navigation.astro` executes only once per browser session (Astro deduplicates module scripts). `DOMContentLoaded` never fires again after the first navigation.

**How to avoid:** Wrap all event listeners in `document.addEventListener("astro:page-load", () => { ... })`. This fires on initial load AND after every ClientRouter navigation.

**Warning signs:** All interactive elements (menu, theme toggle, accordions) work on first load but are dead after navigating away and back.

### Pitfall 3: Active Nav Link Shows Wrong Page

**What goes wrong:** `/blog` is highlighted as active when on the homepage, or no link is ever highlighted.

**Why it happens:** Trailing slash mismatch. `Astro.url.pathname` for the homepage may be `/` while the nav link href is `"/"` — that's fine. But for `/blog/`, if the nav href is `"/blog"` (no trailing slash), the comparison `currentPath === "/blog"` fails when Astro returns `"/blog/"`.

**How to avoid:** Use trailing slashes consistently in nav hrefs. Astro's default `trailingSlash` config is `"ignore"`, but in practice built pages use trailing slashes. Test with `console.log(Astro.url.pathname)` in each page to verify.

**Warning signs:** Active state works on homepage (`/`) but not on `/blog/` or `/contact/`.

### Pitfall 4: `render()` Called on Wrong Slice

**What goes wrong:** Building reads all blog posts and calls `render()` on each to get reading time, slows down build for large collections.

**Why it happens:** Developer calls `render()` in a map over all posts before slicing.

**How to avoid:** Sort and slice first, then call `render()` only on the 3 posts being displayed.

**Warning signs:** Build time grows linearly with number of posts; HOME-04 renders all posts not just 3.

### Pitfall 5: `event.newDocument` vs `document` in `astro:before-swap`

**What goes wrong:** Dark mode fix appears to work in testing but fails intermittently. Or the old page's theme toggles instead of the new page's.

**Why it happens:** Modifying `document.documentElement` in `astro:before-swap` changes the outgoing document (the current page), not the incoming one.

**How to avoid:** Always use `event.newDocument.documentElement` in `astro:before-swap` listeners.

**Warning signs:** Theme class is applied to outgoing page DOM (visible in DevTools during transition), not incoming.

### Pitfall 6: `date` Field Name (Not `pubDate`)

**What goes wrong:** `post.data.pubDate` is `undefined` when sorting or displaying dates.

**Why it happens:** Phase 1 established the schema field as `date`, not `pubDate`. Many Astro blog tutorials and the official tutorial use `pubDate`.

**How to avoid:** Use `post.data.date` consistently throughout. The schema is defined in `src/content.config.ts` — check it as the source of truth.

**Warning signs:** Dates display as `Invalid Date` or posts don't sort correctly.

---

## Code Examples

Verified patterns from official sources:

### ClientRouter in BaseLayout

```astro
---
// Source: https://docs.astro.build/en/guides/view-transitions/
import { ClientRouter } from "astro:transitions";
---
<html lang="en">
  <head>
    <ClientRouter />
    <script is:inline>
      // Runs synchronously before first paint
      if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark");
      }
      // Re-apply after each navigation swap
      document.addEventListener("astro:before-swap", (e) => {
        if (localStorage.getItem("theme") === "dark") {
          e.newDocument.documentElement.classList.add("dark");
        }
      });
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### astro:page-load for Script Re-Execution

```javascript
// Source: https://docs.astro.build/en/guides/view-transitions/#astropage-load
// Replace ALL DOMContentLoaded and window.onload usages with this
document.addEventListener("astro:page-load", () => {
  // Runs on initial page load AND after every navigation
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
});
```

### Active Nav Link with aria-current

```astro
---
// Source: https://docs.astro.build/en/guides/routing/
const path = Astro.url.pathname;
---
<a href="/blog/" aria-current={path === "/blog/" ? "page" : undefined}>Blog</a>
```

### Featured Posts Query (HOME-04)

```astro
---
// Source: https://docs.astro.build/en/guides/content-collections/
import { getCollection, render } from "astro:content";

const posts = (await getCollection("blog", ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);

const postsWithMeta = await Promise.all(
  posts.map(async (post) => {
    const { remarkPluginFrontmatter } = await render(post);
    return { post, minutesRead: remarkPluginFrontmatter.minutesRead };
  })
);
---
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<ViewTransitions />` | `<ClientRouter />` | Astro 5.0 (Dec 2024) | Import renamed; old import is a runtime error |
| `DOMContentLoaded` for interactive scripts | `astro:page-load` | When using ClientRouter | Scripts must use lifecycle event or break after navigation |
| `astro:after-swap` for dark mode | `astro:before-swap` on `event.newDocument` | Astro 3+ pattern evolved | `before-swap` prevents flash; `after-swap` arrives too late |
| `darkMode: 'class'` in `tailwind.config.js` | `@custom-variant dark` in CSS | Tailwind v4.0 (Jan 2025) | Already set in Phase 1; no change needed |

**Deprecated/outdated:**
- `<ViewTransitions />` component: Use `<ClientRouter />` from `astro:transitions`
- `DOMContentLoaded` inside Astro `<script>` blocks: Does not fire after ClientRouter navigation

---

## Open Questions

1. **Trailing slash behaviour for active nav link**
   - What we know: `Astro.url.pathname` returns the full path including trailing slash on most routes
   - What's unclear: Whether the homepage (`/`) and blog (`/blog/`) always include the slash in Astro 5.17 static builds
   - Recommendation: Test with `console.log(Astro.url.pathname)` in dev, use trailing slashes in nav hrefs to be safe

2. **Newsletter placeholder form vs static CTA**
   - What we know: HOME-05 requires "email input and submit button" — but Buttondown isn't wired until Phase 3
   - What's unclear: Whether a `disabled` form or a static "coming soon" message better satisfies the requirement
   - Recommendation: Use a visually complete but non-functional form (action="#", disabled fields with explanatory text) — this satisfies the visual requirement while avoiding a broken integration

3. **Featured posts count: only 2 non-draft posts exist**
   - What we know: `switzerland-ambition.md` has `draft: true`; only 2 of 3 posts are published
   - What's unclear: Whether to show 2 posts (honest) or add a third non-draft post
   - Recommendation: The `.slice(0, 3)` will return 2 posts gracefully; this is fine for now. Phase 3 will add more posts.

---

## Environment Availability

> Phase 2 is code/config-only changes building on the Astro project from Phase 1. No new external dependencies.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|---------|
| Node.js 22 | `npm run build` | ✓ (via Homebrew) | 22.22.2 at `/opt/homebrew/opt/node@22/bin/node` | Node 21.5.0 works with warning (see Phase 1) |
| Astro 5.17.0 | All Astro features | ✓ (installed) | 5.17.0 | — |
| @tailwindcss/vite 4.2.2 | Tailwind v4 | ✓ (installed) | 4.2.2 | — |
| astro:transitions | ClientRouter | ✓ (built-in) | bundled | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** Node 21.5.0 is the active `node` symlink; builds should use `/opt/homebrew/opt/node@22/bin/node` directly or via `PATH` update. This is a carry-over from Phase 1 — see Phase 1 RESEARCH.md Pitfall 4.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

No dedicated test framework. Validation is via build commands, `astro check`, and browser inspection.

| Property | Value |
|----------|-------|
| Framework | None (build verification + browser inspection) |
| Config file | N/A |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npx astro check` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | `ClientRouter` included; no document reload on internal links | build + browser | `npm run build` (build check) + Network tab in browser | ✅ build script exists |
| NAV-02 | Active nav link highlighted; hamburger works after navigation | browser manual | `npm run dev` → navigate between pages, test hamburger | ✅ dev script exists |
| NAV-03 | Footer present on all pages | build + inspect | `npm run build && grep -r "Footer" dist/` (indirect) | ✅ build script exists |
| NAV-04 | Crossfade transition with no full-page reload | browser manual | Network tab in DevTools — no Document requests on navigation | ✅ dev script exists |
| NAV-05 | Hamburger works after navigating away and back | browser manual | Navigate away from page, return, test hamburger | ✅ dev script exists |
| NAV-06 | No light flash when navigating in dark mode | browser manual | Enable dark mode, navigate pages, watch for flash | ✅ dev script exists |
| NAV-07 | Dark mode persists across refresh | browser manual | Toggle dark, refresh, confirm state retained | ✅ dev script exists |
| HOME-01 | Hero section renders with CTA link | build + inspect | `npm run build && grep -l "href=\"/blog"` dist/index.html | ✅ build script exists |
| HOME-02 | Positioning text visible on homepage | build + inspect | `npm run build` + browser inspect | ✅ build script exists |
| HOME-03 | 4 content pillars render | build + inspect | `npm run build` + browser inspect | ✅ build script exists |
| HOME-04 | 3 most-recent non-draft posts rendered (2 currently) | build + inspect | `npm run build && grep "ai-noise\|focus-advantage" dist/index.html` | ✅ build script exists |
| HOME-05 | Newsletter section with email input renders | build + inspect | `npm run build && grep 'type="email"' dist/index.html` | ✅ build script exists |

### Sampling Rate

- **Per task commit:** `npm run build` — confirms no compilation errors
- **Per wave merge:** `npm run build && npx astro check` — full TypeScript check
- **Phase gate:** All 5 success criteria verified in browser before `/gsd:verify-work`

### Wave 0 Gaps

The following must be created before implementation plans can be validated:

- [ ] `src/layouts/BaseLayout.astro` — covers NAV-01, NAV-04, NAV-06, NAV-07
- [ ] `src/components/Navigation.astro` — covers NAV-02, NAV-05
- [ ] `src/components/Footer.astro` — covers NAV-03
- [ ] `src/pages/index.astro` (rewrite from placeholder) — covers HOME-01 through HOME-05
- [ ] Delete `src/pages/test-reading-time.astro` — cleanup from Phase 1

*(No new test infrastructure required — build command covers automated checks; manual browser verification covers the rest)*

---

## Sources

### Primary (HIGH confidence)

- [Astro View Transitions Docs](https://docs.astro.build/en/guides/view-transitions/) — ClientRouter import, lifecycle events, `fallback` options, `astro:page-load`, `astro:before-swap`
- [Astro Routing Docs](https://docs.astro.build/en/guides/routing/) — `Astro.url.pathname` for active nav link
- `.planning/research/PITFALLS.md` — verified pitfalls for dark mode FOUC, script re-execution, view transitions (sourced from official Astro docs and confirmed GitHub issues)
- `.planning/research/FEATURES.md` — collection query patterns, `render()` for reading time, draft filtering
- `.planning/phases/01-foundation/01-RESEARCH.md` — locked decisions, existing stack, schema field names

### Secondary (MEDIUM confidence)

- [FOUC with Astro transitions — simonporter.co.uk](https://www.simonporter.co.uk/posts/what-the-fouc-astro-transitions-and-tailwind/) — community post confirming `is:inline` + `astro:after-swap` pattern (now superseded by `astro:before-swap`)
- [namoku.dev dark mode + view transitions](https://namoku.dev/blog/darkmode-tailwind-astro/) — community post with code for Tailwind dark mode + ClientRouter

### Tertiary (LOW confidence)

- None — all Phase 2 patterns verified against official sources or prior project research

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all verified in Phase 1
- Architecture: HIGH — ClientRouter, lifecycle events verified against official Astro 5 docs
- Pitfalls: HIGH — FOUC and script re-execution pitfalls from prior project research, confirmed via official Astro docs and GitHub issues
- Homepage sections: HIGH — collection query patterns verified in Phase 1; field names confirmed from `src/content.config.ts`

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Astro 5.x is stable; recheck if Astro 5.19+ ships with view transitions changes)
