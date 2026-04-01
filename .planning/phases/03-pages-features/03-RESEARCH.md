# Phase 3: Pages & Features — Research

**Researched:** 2026-04-01
**Domain:** Astro 5 dynamic routes, blog rendering, Buttondown newsletter, Netlify Forms, @tailwindcss/typography
**Confidence:** HIGH — all core patterns verified against official Astro docs, Netlify docs, and Buttondown docs

---

## Summary

Phase 3 builds three functional page types on top of the shell established in Phase 2: a blog listing page (`/blog`), individual blog post pages (`/blog/[id]`), and a contact page (`/contact`) with a server-side Netlify form. A reusable `NewsletterSignup.astro` component replaces the Phase 2 placeholder across all three deployment locations.

The most critical correctness concern is the Astro 5 content layer API shift. The project already uses `post.id` (not `post.slug`) for URLs — confirmed in Phase 2 SUMMARY. The standalone `render()` from `astro:content` is the correct import; `post.render()` method does not exist in Astro 5 and will throw at build time. These decisions are locked in STATE.md and confirmed by official Astro 5 docs.

The second major concern is Netlify Forms + Astro view transitions. When `<ClientRouter />` is active, a standard form POST triggers a client-side navigation instead of a full browser redirect. The `data-astro-reload` attribute on the form element opts out of the client router for that specific form, restoring native POST-redirect-GET behavior. Without it, the redirect to `/success` will be intercepted and silently fail. This pattern is verified against official Astro docs.

The Buttondown newsletter integration uses a direct HTML form POST to `https://buttondown.com/api/emails/embed-subscribe/{username}` — no API key required for this embed endpoint. The form needs `method="post"` and a hidden input `<input type="hidden" name="embed" value="1" />`. This is a cross-origin POST; the Buttondown endpoint is explicitly designed to accept it.

**Primary recommendation:** Build blog pages in Plan 03-01 first (no external dependencies), then build the contact form and newsletter wiring in Plan 03-02 (requires Buttondown username configuration).

---

<user_constraints>
## User Constraints (from STATE.md Accumulated Context)

### Locked Decisions
- Use `@tailwindcss/vite` NOT `@astrojs/tailwind` (deprecated in Astro 5.2)
- Use `<ClientRouter />` from `astro:transitions` NOT `<ViewTransitions />`
- `src/content.config.ts` NOT `src/content/config.ts` (Astro 5 path)
- Use standalone `render()` from `astro:content` NOT `post.render()` method
- Do NOT install `@astrojs/netlify` adapter — static site, no SSR needed
- Astro 5.17.0 pinned exactly (no caret) for reproducible builds
- Tailwind v4 pattern: `@import 'tailwindcss'` + `@plugin` directive (not `@tailwind` directives)
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))` — class-based on `html` element
- Content collection at `src/content.config.ts` (Astro 5 requires `src/` root, not `src/content/`)
- Use `post.id` (not `post.slug`) for blog post URLs — Astro 5 content layer uses `id`
- Newsletter form placeholder in Phase 2 used `disabled` attribute — Phase 3 must replace it with live component
- Use `astro:before-swap` with `event.newDocument.documentElement` to prevent dark mode FOUC
- Use `astro:page-load` (not `DOMContentLoaded`) for all client scripts

### Claude's Discretion
- Visual design and layout of blog listing cards, post page, contact form, and success page
- Whether `NewsletterSignup.astro` shows inline success text or redirects to a thank-you page after subscription
- Exact error messaging for contact form client-side validation
- Whether to display category tags as colored badges or plain text on post pages

### Deferred Ideas (OUT OF SCOPE)
- SEO metadata components — `BaseHead.astro`, OG tags, canonical URLs (Phase 4: SEO-01 through SEO-10)
- JSON-LD structured data for blog posts (Phase 4: SEO-03)
- Sitemap, RSS feed, robots.txt (Phase 4: SEO-04, SEO-05, SEO-06)
- Lighthouse performance audit (Phase 4: SEO-10)
- Blog search (v2: DISC-01)
- Tag filter pages (v2: DISC-02)
- MDX support (v2: CONT-06)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BLOG-01 | Blog listing page (`/blog`) showing all non-draft posts in reverse chronological order | `getCollection("blog", draft filter)` + sort by `data.date` desc — same pattern as HOME-04 |
| BLOG-02 | Post cards: title, excerpt (from `description`), date, reading time, category tag | `render(post)` → `remarkPluginFrontmatter.minutesRead`; `post.data.description`, `post.data.category` |
| BLOG-03 | Individual post pages (`/blog/[id]`) using `getStaticPaths` + standalone `render()` | `params: { id: post.id }` in `getStaticPaths`; `const { Content } = await render(post)` |
| BLOG-04 | Full markdown rendered with `@tailwindcss/typography` | `<Content />` component inside `<div class="prose dark:prose-invert">` — plugin already configured in `global.css` |
| BLOG-05 | Previous/Next post navigation at bottom of each post | Sort all posts by date, find current post index, pass `posts[idx-1]` and `posts[idx+1]` as props |
| BLOG-06 | `NewsletterSignup.astro` component at end of each blog post | Reusable component — import into blog post page template |
| BLOG-07 | Category tags on post cards and individual post pages | `post.data.category` from Zod schema; display as badge |
| NEWS-01 | `NewsletterSignup.astro` POSTs to Buttondown embed API endpoint | `action="https://buttondown.com/api/emails/embed-subscribe/{username}" method="post"` + hidden `embed` field |
| NEWS-02 | Email validation on input | HTML5 `type="email"` + `required` attribute |
| NEWS-03 | Success/error feedback | Buttondown embed redirects to its own thank-you page by default; can override with `?tag=...` params |
| NEWS-04 | Component in ≥3 locations: homepage, post footer, site footer | Import into `index.astro` (replace placeholder), blog post template, `Footer.astro` |
| CONTACT-01 | `/contact` page with mailto link | Static `.astro` page in `src/pages/contact.astro` |
| CONTACT-02 | `ContactForm.astro` with Netlify Forms: `data-netlify="true"`, honeypot, Name/Email/Message fields | `netlify-honeypot="bot-field"` on `<form>`; hidden `<input name="bot-field">` hidden via CSS |
| CONTACT-03 | Form `action="/success"` — `src/pages/success.astro` created | `src/pages/success.astro` with BaseLayout; no dynamic data needed |
| CONTACT-04 | `data-astro-reload` on form to prevent view transitions intercepting POST | Attribute on `<form>` element — forces full-page navigation for form submission |
| CONTACT-05 | Client-side form validation (required fields, email format) | Vanilla JS in `<script>` wrapped in `astro:page-load` listener |
| CONTACT-06 | Social links (YouTube, LinkedIn) on contact page | Static links — same URLs as Footer.astro |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 5.17.0 | Framework — already installed, pinned | Locked decision; do not upgrade |
| astro:content | built-in | `getCollection`, `render` for blog data | Official Astro 5 content API |
| @tailwindcss/typography | 0.5.19 | `prose` classes for blog post rendering | Already installed (`@plugin "@tailwindcss/typography"` already in `global.css`) |
| astro:transitions | built-in | `<ClientRouter />` — already active | Required for `data-astro-reload` behavior |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Buttondown embed API | N/A (external) | Newsletter subscriptions via form POST | `NewsletterSignup.astro` component form action |
| Netlify Forms | N/A (platform) | Contact form handling, no backend code | `ContactForm.astro` with `data-netlify="true"` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Buttondown embed POST | Buttondown REST API with API key | REST API requires server-side code or SSR — this site is static; embed is designed for static sites |
| Netlify Forms | Formspree / EmailJS | Netlify Forms is zero-cost, zero-config for this Netlify deployment; no third-party service needed |
| `data-astro-reload` on form | Custom JS to submit form via fetch | `fetch` approach cannot trigger a browser redirect to `/success`; `data-astro-reload` is the idiomatic Astro solution |
| `prose dark:prose-invert` on wrapper div | Per-element dark mode overrides | `prose-invert` flips the entire typography palette atomically; per-element overrides are fragile and verbose |

**Installation:** No new packages needed for Phase 3. All dependencies are already installed from Phase 1.

---

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
src/
  components/
    NewsletterSignup.astro   # Reusable Buttondown embed form (NEWS-01)
    PostNavigation.astro     # Prev/Next post links (BLOG-05)
    ContactForm.astro        # Netlify form component (CONTACT-02)
  pages/
    blog/
      index.astro            # /blog listing page (BLOG-01, BLOG-02, BLOG-07)
      [id].astro             # /blog/[id] individual post page (BLOG-03, BLOG-04)
    contact.astro            # /contact page (CONTACT-01, CONTACT-06)
    success.astro            # /success redirect target (CONTACT-03)
```

### Pattern 1: Blog Listing Page (`/blog`)

**What:** Query all non-draft posts, sort by date descending, render a card grid.

**When to use:** `src/pages/blog/index.astro`

```astro
---
// src/pages/blog/index.astro
// Source: https://docs.astro.build/en/guides/content-collections/
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getCollection, render } from "astro:content";

const posts = (await getCollection("blog", ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Get reading time for all listing posts
const postsWithMeta = await Promise.all(
  posts.map(async (post) => {
    const { remarkPluginFrontmatter } = await render(post);
    return { post, minutesRead: remarkPluginFrontmatter.minutesRead };
  })
);
---

<BaseLayout title="Blog — Dawood Kamar">
  <h1>Blog</h1>
  {postsWithMeta.map(({ post, minutesRead }) => (
    <article>
      <a href={`/blog/${post.id}/`}>
        <h2>{post.data.title}</h2>
      </a>
      <p>{post.data.description}</p>
      <time datetime={post.data.date.toISOString()}>
        {post.data.date.toLocaleDateString("en-GB", { dateStyle: "medium" })}
      </time>
      <span>{minutesRead}</span>
      <span>{post.data.category}</span>
    </article>
  ))}
</BaseLayout>
```

**Note:** Unlike HOME-04 which only renders 3 posts, the blog listing renders ALL non-draft posts. Calling `render()` on every post adds build time — acceptable with the current small post count; flag for optimization when post count exceeds ~50.

### Pattern 2: Individual Post Page with `getStaticPaths`

**What:** Dynamic route that generates one page per non-draft post using `getStaticPaths`. Uses `post.id` as the route parameter.

**When to use:** `src/pages/blog/[id].astro`

```astro
---
// src/pages/blog/[id].astro
// Source: https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getCollection, render } from "astro:content";
import PostNavigation from "../../components/PostNavigation.astro";
import NewsletterSignup from "../../components/NewsletterSignup.astro";

export async function getStaticPaths() {
  // Filter drafts in production — draft posts get no route generated
  const posts = (await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  )).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return posts.map((post, index) => ({
    params: { id: post.id },
    props: {
      post,
      prevPost: posts[index + 1] ?? null,   // older post
      nextPost: posts[index - 1] ?? null,   // newer post
    },
  }));
}

const { post, prevPost, nextPost } = Astro.props;
const { Content, remarkPluginFrontmatter } = await render(post);
const minutesRead = remarkPluginFrontmatter.minutesRead;
---

<BaseLayout title={post.data.title} description={post.data.description}>
  <article>
    <header>
      <h1>{post.data.title}</h1>
      <time datetime={post.data.date.toISOString()}>
        {post.data.date.toLocaleDateString("en-GB", { dateStyle: "long" })}
      </time>
      <span>{minutesRead}</span>
      <span>{post.data.category}</span>
    </header>

    <!-- prose + dark:prose-invert is the entire typography solution -->
    <div class="prose dark:prose-invert max-w-none">
      <Content />
    </div>
  </article>

  <PostNavigation prevPost={prevPost} nextPost={nextPost} />
  <NewsletterSignup />
</BaseLayout>
```

**Critical points:**
- `params: { id: post.id }` — the param key MUST match the filename bracket segment `[id]`
- The array is sorted by date descending BEFORE mapping — so `posts[index + 1]` is the chronologically older post (lower index = newer)
- Draft filtering happens inside `getStaticPaths` — this is the ONLY location that controls whether a draft URL is generated

### Pattern 3: NewsletterSignup Component (Buttondown Embed)

**What:** Reusable form that POSTs to Buttondown's embed endpoint. No API key required. Cross-origin POST accepted by Buttondown.

**When to use:** Import anywhere a newsletter signup should appear.

```astro
---
// src/components/NewsletterSignup.astro
// Source: https://docs.buttondown.com (embed endpoint)
// Replace USERNAME with actual Buttondown username
const BUTTONDOWN_USERNAME = "dawoodkamar"; // update if different
---

<section>
  <h2>Stay in the Loop</h2>
  <p>Writing on AI, focus, and meaningful work. No noise.</p>
  <form
    action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
    method="post"
    target="_blank"
  >
    <input type="hidden" name="embed" value="1" />
    <input
      type="email"
      name="email"
      placeholder="your@email.com"
      required
      aria-label="Email address"
    />
    <button type="submit">Subscribe</button>
  </form>
</section>
```

**Important details:**
- `method="post"` (lowercase) is correct for HTML forms
- `target="_blank"` opens Buttondown's thank-you page in a new tab — this is the simplest success state and avoids CORS complexity
- The hidden `<input name="embed" value="1" />` tells Buttondown this is an embed submission
- The Buttondown username is the URL segment, not an API key — it is safe to hardcode in client-rendered HTML

**Alternative for inline success feedback:** Remove `target="_blank"` and handle the redirect. Buttondown will redirect the user to `https://buttondown.com/thank-you` unless a custom redirect is configured in the Buttondown dashboard.

### Pattern 4: Contact Form with Netlify Forms

**What:** Static HTML form that Netlify detects at build time. Uses `data-netlify="true"`, honeypot spam filter, and `data-astro-reload` to bypass view transitions.

**When to use:** `src/components/ContactForm.astro`, imported into `src/pages/contact.astro`

```astro
---
// src/components/ContactForm.astro
// Sources:
//   https://docs.netlify.com/forms/setup/
//   https://docs.netlify.com/manage/forms/spam-filters/
//   https://docs.astro.build/en/guides/view-transitions/#data-astro-reload
---

<form
  name="contact"
  method="POST"
  action="/success/"
  data-netlify="true"
  netlify-honeypot="bot-field"
  data-astro-reload
>
  <!-- Required: form-name hidden input for static site generators -->
  <input type="hidden" name="form-name" value="contact" />

  <!-- Honeypot: hidden from humans, filled by bots -->
  <p class="hidden" aria-hidden="true">
    <label>
      Do not fill this field: <input name="bot-field" tabindex="-1" autocomplete="off" />
    </label>
  </p>

  <div>
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />
  </div>

  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />
  </div>

  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message" required></textarea>
  </div>

  <button type="submit">Send Message</button>
</form>
```

**Critical details:**
- `data-netlify="true"` — tells Netlify's buildbot to process this form. Must be on the `<form>` element.
- `netlify-honeypot="bot-field"` — the attribute value must match the name of the hidden input field
- `<input type="hidden" name="form-name" value="contact" />` — REQUIRED for static site generators; without this Netlify cannot match submissions to the form definition
- `data-astro-reload` — prevents `<ClientRouter />` from intercepting the POST submission. Without this, the POST redirect to `/success` is intercepted by the SPA router and the form submission silently fails.
- `action="/success/"` — trailing slash consistent with Astro's routing

### Pattern 5: PostNavigation Component

**What:** Receives `prevPost` and `nextPost` as props (either a collection entry or `null`), renders conditional navigation links.

```astro
---
// src/components/PostNavigation.astro
import type { CollectionEntry } from "astro:content";

interface Props {
  prevPost: CollectionEntry<"blog"> | null;
  nextPost: CollectionEntry<"blog"> | null;
}

const { prevPost, nextPost } = Astro.props;
---

<nav aria-label="Post navigation">
  <div>
    {prevPost && (
      <a href={`/blog/${prevPost.id}/`}>
        <span>Previous</span>
        <span>{prevPost.data.title}</span>
      </a>
    )}
  </div>
  <div>
    {nextPost && (
      <a href={`/blog/${nextPost.id}/`}>
        <span>Next</span>
        <span>{nextPost.data.title}</span>
      </a>
    )}
  </div>
</nav>
```

**Terminology convention** (array sorted newest-first):
- `prevPost` = the post at `index + 1` = chronologically OLDER = "Previous" direction
- `nextPost` = the post at `index - 1` = chronologically NEWER = "Next" direction

This is the most natural reading experience: "Previous" shows the older post you may have missed, "Next" shows newer content.

### Pattern 6: Replacing the Homepage Newsletter Placeholder

The homepage `index.astro` has a disabled placeholder form (Phase 2 known stub). In Phase 3 Plan 02, replace the entire `<!-- Section 5: Newsletter Placeholder -->` section with:

```astro
import NewsletterSignup from "../components/NewsletterSignup.astro";
// ...
<NewsletterSignup />
```

### Anti-Patterns to Avoid

- **`post.render()` method call:** Does not exist in Astro 5. Use `import { render } from "astro:content"` and call `render(post)` standalone.
- **`post.slug` for URLs:** Astro 5 content layer exposes `id`, not `slug`. The schema does not define a `slug` field. Using `post.slug` returns `undefined`.
- **Missing `data-astro-reload` on contact form:** The POST will be intercepted by `<ClientRouter />` and treated as a client-side navigation. The form submission appears to succeed but Netlify never receives it. This is a silent failure — no error is shown to the user.
- **Missing `<input name="form-name">` hidden field:** Netlify's buildbot detects the form at build time. At runtime, without the `form-name` hidden field, submissions cannot be matched to the registered form and are silently dropped.
- **`DOMContentLoaded` for contact form validation:** Will not re-fire after view transitions. Use `astro:page-load`.
- **Calling `render()` before sorting/filtering in `getStaticPaths`:** `render()` is for page rendering at request time, not inside `getStaticPaths`. Only call `render(post)` outside of `getStaticPaths`, in the component's frontmatter.
- **`target="_blank"` on contact form:** Contact form should NOT have `target="_blank"` — the success redirect should happen in the same tab. Only `NewsletterSignup` uses `target="_blank"`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blog post rendering | Custom markdown parser | `const { Content } = await render(post)` | Astro's `render()` handles remark/rehype pipeline, code highlighting, link transforms |
| Reading time calculation | Word count loop | `remarkPluginFrontmatter.minutesRead` (already injected by Phase 1 plugin) | Plugin is already wired; calling `render()` makes it available |
| Form spam protection | IP rate limiting, custom captcha | Netlify honeypot (`netlify-honeypot="bot-field"`) | Platform-level, zero JS, already available |
| Typography styles | Custom CSS for headings, lists, code blocks | `prose dark:prose-invert` Tailwind classes | Typography plugin handles all typographic defaults including code, blockquotes, tables |
| Newsletter backend | Node.js email subscription endpoint | Buttondown embed POST endpoint | Buttondown handles list management, unsubscribes, GDPR compliance |
| Post prev/next logic | Complex index calculation | Sort array + pass adjacent items as `getStaticPaths` props | Done at build time; zero runtime cost; cleanest data flow |

**Key insight:** Every data-fetching and rendering problem in this phase has a build-time solution. There is no need for client-side fetch calls for blog content.

---

## Common Pitfalls

### Pitfall 1: `post.render()` vs standalone `render()` (Astro 5 Breaking Change)

**What goes wrong:** Build error — `post.render is not a function` or `post.render()` returns undefined.

**Why it happens:** Astro 4 put `render()` as a method on each collection entry. Astro 5 moved it to a standalone import from `astro:content`.

**How to avoid:** Always import and call:
```astro
import { getCollection, render } from "astro:content";
// ...
const { Content, remarkPluginFrontmatter } = await render(post);
```
Never call `post.render()`.

**Warning signs:** `TypeError: post.render is not a function` at build time, or tutorials/examples showing `const { Content } = await post.render()`.

### Pitfall 2: Missing `data-astro-reload` on Contact Form

**What goes wrong:** Form submits, user sees a brief transition animation, page appears to "reload" back to the contact page, but no submission appears in Netlify dashboard. User may retry repeatedly.

**Why it happens:** `<ClientRouter />` intercepts all form submissions by default. It performs a client-side navigation to the `action` URL instead of a full browser POST. Netlify Forms requires a real browser POST to detect and process the submission.

**How to avoid:** Add `data-astro-reload` to the `<form>` element. This opts out of client-side routing for this specific form.

**Warning signs:** Form appears to work locally (where Netlify Forms isn't active anyway), but submissions never appear in the Netlify dashboard after deploy.

### Pitfall 3: Missing `<input name="form-name">` Hidden Field

**What goes wrong:** Netlify detects the form at build time (it appears in the dashboard under "Forms"), but no submissions are recorded after users submit.

**Why it happens:** For static sites, Netlify's buildbot registers forms during the build. At runtime, it needs to match the incoming POST to the correct form by name. Without the hidden `form-name` field, the POST body doesn't identify which form is being submitted.

**How to avoid:** Always include inside the form:
```html
<input type="hidden" name="form-name" value="contact" />
```
The value must match the `name` attribute on the `<form>` element exactly.

**Warning signs:** Form appears in Netlify dashboard under "Forms" tab, but "Submissions" count stays at 0.

### Pitfall 4: Draft Posts in `getStaticPaths` vs Only in Collection Queries

**What goes wrong:** A draft post's URL is accessible in production (returns a page, not 404), even though the draft doesn't appear in listings.

**Why it happens:** The draft filter is applied when querying for display but forgotten in `getStaticPaths`, which generates the URL. Astro builds a page for every entry returned by `getStaticPaths`.

**How to avoid:** Apply the draft filter inside `getStaticPaths`:
```javascript
export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );
  // ...
}
```

**Warning signs:** `npm run build` generates a `dist/blog/switzerland-ambition/index.html` — the draft post gets a built page.

### Pitfall 5: `prose` Class Applied to Wrong Container

**What goes wrong:** Blog post content renders with default browser styles — plain text, no visual hierarchy, no code block styling.

**Why it happens:** `prose` must wrap the `<Content />` component output. Placing it on the `<article>` parent or on a sibling element has no effect.

**How to avoid:** Wrap only the rendered content:
```astro
<div class="prose dark:prose-invert max-w-none">
  <Content />
</div>
```
`max-w-none` removes the default prose max-width constraint (useful when BaseLayout already constrains the page width).

**Warning signs:** Post page renders but looks like unstyled HTML — headings the same size as body text, no code block background.

### Pitfall 6: Buttondown Username vs API Key

**What goes wrong:** Developer confuses the embed endpoint (username-based, public) with the REST API (API key required, server-side only).

**Why it happens:** Buttondown has two separate integration methods. The embed endpoint is designed for static sites; the REST API requires an API key that must never be exposed in client HTML.

**How to avoid:** Use the embed endpoint for the `NewsletterSignup.astro` component:
```
https://buttondown.com/api/emails/embed-subscribe/{username}
```
The username is the public Buttondown account name, safe to embed in HTML.

**Warning signs:** Form posts to `/api/emails/subscribers` with an `Authorization` header in client-side JS — this exposes the API key.

### Pitfall 7: `params` Key Must Match File Segment Name

**What goes wrong:** Build error: `getStaticPaths` returned params that don't match the dynamic route file.

**Why it happens:** If the file is `src/pages/blog/[id].astro`, the params key must be `id`. Using `slug` (e.g., `{ params: { slug: post.id } }`) will cause a build error.

**How to avoid:** Match exactly — `[id].astro` requires `params: { id: ... }`.

**Warning signs:** `Error: getStaticPaths returned params with unexpected key "slug". Expected "id".`

---

## Code Examples

Verified patterns from official sources:

### getStaticPaths with Content Collections (Astro 5)

```astro
// Source: https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
```

### Draft Filter Inside getStaticPaths (Production Safety)

```astro
export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );
  return posts.map(post => ({
    params: { id: post.id },
    props: { post },
  }));
}
```

### Buttondown Embed Form

```html
<!-- Source: https://docs.buttondown.com (embed endpoint pattern) -->
<form
  action="https://buttondown.com/api/emails/embed-subscribe/USERNAME"
  method="post"
  target="_blank"
>
  <input type="hidden" name="embed" value="1" />
  <input type="email" name="email" required placeholder="you@example.com" />
  <button type="submit">Subscribe</button>
</form>
```

### Netlify Form with Honeypot and data-astro-reload

```html
<!-- Sources:
     https://docs.netlify.com/forms/setup/
     https://docs.netlify.com/manage/forms/spam-filters/
     https://docs.astro.build/en/guides/view-transitions/#data-astro-reload -->
<form
  name="contact"
  method="POST"
  action="/success/"
  data-netlify="true"
  netlify-honeypot="bot-field"
  data-astro-reload
>
  <input type="hidden" name="form-name" value="contact" />
  <p class="hidden" aria-hidden="true">
    <label>Don't fill: <input name="bot-field" tabindex="-1" /></label>
  </p>
  <!-- ... visible fields ... -->
</form>
```

### Typography Styling for Blog Post Content

```astro
<!-- Source: https://github.com/tailwindlabs/tailwindcss-typography -->
<!-- @plugin "@tailwindcss/typography" already configured in global.css -->
<div class="prose dark:prose-invert max-w-none">
  <Content />
</div>
```

### Client-Side Validation with astro:page-load

```javascript
// Source: https://docs.astro.build/en/guides/view-transitions/#astropage-load
// Must use astro:page-load, not DOMContentLoaded
document.addEventListener("astro:page-load", () => {
  const form = document.querySelector("form[name='contact']");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    const email = form.querySelector("input[type='email']");
    if (!email.validity.valid) {
      event.preventDefault();
      email.setCustomValidity("Please enter a valid email address.");
      email.reportValidity();
    }
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `await post.render()` method | `import { render } from "astro:content"` + `await render(post)` | Astro 5.0 (Dec 2024) | Method removed; standalone import is required |
| `post.slug` for URLs | `post.id` for URLs | Astro 5.0 content layer rewrite | `slug` is undefined unless explicitly in schema; use `id` |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` + `@plugin` | Tailwind v4 (Jan 2025) | Already configured in Phase 1 `global.css` |
| `darkMode: "class"` in config | `@custom-variant dark` in CSS | Tailwind v4 (Jan 2025) | Already configured in Phase 1 `global.css` |
| `<ViewTransitions />` | `<ClientRouter />` | Astro 5.0 (Dec 2024) | Already using correct import from Phase 2 |

**Deprecated/outdated:**
- `post.render()` method: Removed in Astro 5. All Astro 4 tutorials and blog posts showing this pattern are wrong for this project.
- `post.slug` property: No longer exists in Astro 5 content layer unless explicitly defined in the Zod schema. The schema in this project does not define it.
- `netlify` shorthand attribute (without `data-` prefix): Works but `data-netlify="true"` is the documented standard for HTML5 compliance.

---

## Open Questions

1. **Buttondown username**
   - What we know: The embed endpoint URL requires the Buttondown account username
   - What's unclear: The actual username for the Dawood Kamar newsletter account has not been confirmed
   - Recommendation: Hardcode a placeholder like `dawoodkamar` in `NewsletterSignup.astro` with a comment. The plan should include a user action item: "Confirm Buttondown username and update `NewsletterSignup.astro`". The form will function correctly once the username is correct; an incorrect username will show a Buttondown 404.

2. **Newsletter success state**
   - What we know: With `target="_blank"`, Buttondown opens its own thank-you page in a new tab. Without it, the user is redirected away from the site.
   - What's unclear: Whether the user prefers inline success state (more polished) or off-site redirect (simpler)
   - Recommendation: Use `target="_blank"` for Phase 3 (ships quickly, no state management). Inline feedback requires JavaScript state management — out of scope for Phase 3.

3. **`/success` page for contact form**
   - What we know: `src/pages/success.astro` must exist and use `BaseLayout`
   - What's unclear: How much content the success page should have
   - Recommendation: Minimal page — heading confirming message sent, link back to homepage. No dynamic data needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 | `npm run build` | ✓ | 22.22.2 at `/opt/homebrew/opt/node@22/bin/node` | Use PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build |
| Astro 5.17.0 | All Astro features | ✓ | 5.17.0 (pinned) | — |
| @tailwindcss/typography | `prose` classes for blog posts | ✓ | 0.5.19 | — |
| @plugin "@tailwindcss/typography" | Typography styles | ✓ | Already in `global.css` | — |
| Netlify Forms | Contact form handling | ✓ (at deploy) | N/A | Only functional after deploy to Netlify; local dev shows no form detection |
| Buttondown embed API | Newsletter subscriptions | ✓ (external) | N/A | Form renders locally; submissions only work with valid Buttondown username |

**Missing dependencies with no fallback:** None for code implementation. Netlify Forms requires a Netlify deploy for end-to-end testing.

**Missing dependencies with fallback:**
- Netlify Forms local testing: Run `npm run build` and deploy to Netlify for form detection. Local dev serves static files but Netlify's buildbot is not running — forms won't show in dashboard until deployed.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

No dedicated test framework. Validation is via build commands, `astro check`, and browser/deploy inspection.

| Property | Value |
|----------|-------|
| Framework | None (build verification + browser + Netlify deploy inspection) |
| Config file | N/A |
| Quick run command | `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build` |
| Full suite command | `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build && npx astro check` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLOG-01 | `/blog` renders all non-draft posts in reverse date order | build + browser | `npm run build && grep -l "focus-advantage\|ai-noise" dist/blog/index.html` | ❌ Wave 0: create `src/pages/blog/index.astro` |
| BLOG-02 | Post cards show title, description, date, reading time, category | browser manual | `npm run dev` → visit `/blog/` → inspect cards | ❌ Wave 0 |
| BLOG-03 | `/blog/[id]` pages generated for non-draft posts | build | `npm run build && ls dist/blog/` — expect `ai-noise/` and `focus-advantage/` but NOT `switzerland-ambition/` | ❌ Wave 0: create `src/pages/blog/[id].astro` |
| BLOG-04 | Markdown renders with typography styles | browser manual | `npm run dev` → visit a post → inspect headings and code blocks have prose styles | ❌ Wave 0 |
| BLOG-05 | Prev/next navigation links appear at post bottom | browser manual | Visit `/blog/ai-noise/` → prev/next links present | ❌ Wave 0: create `PostNavigation.astro` |
| BLOG-06 | Newsletter signup appears at end of each post | build + browser | `npm run build && grep "embed-subscribe" dist/blog/ai-noise/index.html` | ❌ Wave 0: create `NewsletterSignup.astro` |
| BLOG-07 | Category tags on post cards and post pages | browser manual | `npm run dev` → inspect category badge text | ❌ Wave 0 |
| NEWS-01 | NewsletterSignup form POSTs to Buttondown embed endpoint | build + browser | `npm run build && grep "embed-subscribe" dist/index.html` | ❌ Wave 0 |
| NEWS-02 | Email input has HTML5 validation | browser manual | Try submitting invalid email → browser shows validation message | ❌ Wave 0 |
| NEWS-03 | Submission feedback (new tab or redirect) | manual + deploy | Submit test email → Buttondown thank-you page opens | ❌ Wave 0 (requires valid username) |
| NEWS-04 | Component used in ≥3 locations | build | `npm run build && grep -r "embed-subscribe" dist/ | wc -l` — expect ≥3 | ❌ Wave 0 |
| CONTACT-01 | `/contact` page renders with mailto link | build + browser | `npm run build && ls dist/contact/` | ❌ Wave 0: create `src/pages/contact.astro` |
| CONTACT-02 | ContactForm has data-netlify, honeypot, correct fields | build inspect | `npm run build && grep "form-name" dist/contact/index.html` | ❌ Wave 0: create `ContactForm.astro` |
| CONTACT-03 | Submitting redirects to `/success` (Netlify deploy only) | deploy manual | Deploy to Netlify → submit form → confirm redirect to `/success` page | ❌ Wave 0: create `src/pages/success.astro` |
| CONTACT-04 | `data-astro-reload` present on form | build inspect | `npm run build && grep "data-astro-reload" dist/contact/index.html` | ❌ Wave 0 |
| CONTACT-05 | Client-side validation shows errors for invalid inputs | browser manual | `npm run dev` → submit empty form → inspect validation messages | ❌ Wave 0 |
| CONTACT-06 | Social links visible on contact page | build inspect | `npm run build && grep "youtube.com\|linkedin.com" dist/contact/index.html` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build` — confirms no compilation errors
- **Per wave merge:** `npm run build && npx astro check` — full TypeScript check
- **Phase gate:** All 5 success criteria verified: blog listing, post rendering, newsletter (deployed), contact form (deployed), draft exclusion — before `/gsd:verify-work`

### Wave 0 Gaps

All new files must be created before implementation tasks can be validated:

- [ ] `src/pages/blog/index.astro` — covers BLOG-01, BLOG-02, BLOG-07
- [ ] `src/pages/blog/[id].astro` — covers BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07
- [ ] `src/components/PostNavigation.astro` — covers BLOG-05
- [ ] `src/components/NewsletterSignup.astro` — covers NEWS-01, NEWS-02, NEWS-03, NEWS-04, BLOG-06
- [ ] `src/pages/contact.astro` — covers CONTACT-01, CONTACT-06
- [ ] `src/components/ContactForm.astro` — covers CONTACT-02, CONTACT-03, CONTACT-04, CONTACT-05
- [ ] `src/pages/success.astro` — covers CONTACT-03
- [ ] Update `src/pages/index.astro` to import `NewsletterSignup.astro` (replace disabled placeholder) — covers NEWS-04
- [ ] Update `src/components/Footer.astro` to import `NewsletterSignup.astro` — covers NEWS-04

*(No new test infrastructure required — build command covers automated checks; browser + Netlify deploy verification covers the rest)*

---

## Sources

### Primary (HIGH confidence)

- [Astro Content Collections — Generating Routes](https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content) — `getStaticPaths` with content collections, `render()` standalone import, `post.id` as route param
- [Astro View Transitions — data-astro-reload](https://docs.astro.build/en/guides/view-transitions/) — `data-astro-reload` attribute behavior on forms and links
- [Netlify Forms Setup](https://docs.netlify.com/forms/setup/) — `data-netlify="true"`, `form-name` hidden field, `action` redirect
- [Netlify Spam Filters](https://docs.netlify.com/manage/forms/spam-filters/) — `netlify-honeypot` attribute pattern, hidden field pattern
- [Buttondown Embed Subscribe Endpoint](https://buttondown.com/api/emails/embed-subscribe/) — embed endpoint URL, `embed=1` hidden field, POST method
- [tailwindcss-typography GitHub](https://github.com/tailwindlabs/tailwindcss-typography) — `prose dark:prose-invert` pattern, `max-w-none` override

### Secondary (MEDIUM confidence)

- [Netlify + Astro Forms Guide](https://www.netlify.com/blog/deploy-an-astro-site-with-forms-serverless-functions-and-redirects/) — official Netlify blog; confirms `form-name` hidden field requirement for static site generators
- [Astro Prev/Next Navigation Pattern](https://johndalesandro.com/blog/astro-adding-previous-and-next-post-navigation-links-to-blog/) — community pattern for adjacent post navigation via `getStaticPaths` props
- [Buttondown embed CORS/CSP docs](https://docs.buttondown.com/embed-form-cors-csp) — confirms embed endpoint accepts cross-origin POSTs; notes on referrer limitations

### Tertiary (LOW confidence)

- None — all patterns verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all verified in prior phases
- Architecture (blog pages): HIGH — verified against official Astro 5 docs for `getStaticPaths` + `render()` + `post.id`
- Architecture (Netlify Forms): HIGH — verified against official Netlify docs; `form-name` pitfall confirmed by official Netlify blog
- Architecture (Buttondown): HIGH — endpoint URL verified from Buttondown search results; embed pattern is standard and widely documented
- Pitfalls: HIGH — all pitfalls sourced from official docs or confirmed prior project decisions

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Astro 5.x stable; Netlify Forms API stable; Buttondown embed endpoint stable)
