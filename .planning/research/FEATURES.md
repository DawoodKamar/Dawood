# Feature Landscape: Astro Personal Blog

**Domain:** Static personal blog (Astro + Tailwind, deployed on Netlify, no SSR)
**Researched:** 2026-04-01
**Overall confidence:** HIGH — all patterns verified against official Astro docs and multiple implementation sources

---

## 1. Blog Features

### 1a. Reading Time Calculation

**Approach:** Remark plugin at build time (HIGH confidence — official Astro docs)

The official Astro recommendation is a remark plugin that runs during Markdown processing. This gives you a computed `minutesRead` value injected into frontmatter — no runtime cost.

**Dependencies:**
```bash
npm install reading-time mdast-util-to-string
```

**Plugin (`src/plugins/remark-reading-time.mjs`):**
```javascript
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // Returns a friendly string: "3 min read"
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
```

**`astro.config.mjs`:**
```javascript
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
```

**Accessing in Content Collections:**
```astro
---
const { remarkPluginFrontmatter } = await render(entry);
const minutesRead = remarkPluginFrontmatter.minutesRead;
---
<span>{minutesRead}</span>
```

**Note:** The `reading-time` library uses 200 wpm as its default. You do not need to implement the division yourself — the library handles it.

**Source:** https://docs.astro.build/en/recipes/reading-time/

---

### 1b. Auto-Generated Excerpt

**Approach:** Build-time utility function stripping Markdown from `post.body` (MEDIUM confidence — multiple community implementations, no single official pattern)

Two valid strategies exist:

**Option A — Recommended: `description` frontmatter field**
Define a required `description` field in your content collection schema. Authors write it manually. This is the approach used by the official Astro blog tutorial and keeps content quality high.

```typescript
// src/content/config.ts
import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().max(160), // Acts as excerpt and meta description
    pubDate: z.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});
```

**Option B — Auto-generate from body** (for when `description` is absent):
```javascript
// src/utils/excerpt.js
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export function createExcerpt(body, maxLength = 150) {
  const html = parser.render(body);
  const text = html
    .split('\n')
    .slice(0, 6)
    .join(' ')
    .replace(/<\/?[^>]+(>|$)/g, '') // strip HTML tags
    .trim();
  return text.substring(0, maxLength) + '...';
}
```

**Recommendation:** Use Option A. Manually written descriptions double as `<meta name="description">` tags for SEO, which auto-generated excerpts do not. Fall back to Option B only if `description` is not provided.

**Source:** https://www.paulie.dev/posts/2023/09/how-to-create-excerpts-with-astro/

---

### 1c. Previous / Next Post Navigation

**Approach:** Component using `getCollection` + `findIndex` (HIGH confidence — verified against multiple implementations)

Create `src/components/PostNavigation.astro`. The key insight: sort the collection identically in every place it is used, so indexes stay consistent.

```astro
---
import { getCollection } from 'astro:content';

// Must use the same sort order as your blog index page
const posts = (await getCollection('blog', ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
)).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const currentIndex = posts.findIndex(p => p.id === Astro.params.slug);

// Sorted descending by date: index+1 is older (previous), index-1 is newer (next)
const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined;
const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : undefined;
---

{(prevPost || nextPost) && (
  <nav aria-label="Post navigation">
    {prevPost && (
      <a href={`/blog/${prevPost.id}/`}>
        &larr; {prevPost.data.title}
      </a>
    )}
    {nextPost && (
      <a href={`/blog/${nextPost.id}/`}>
        {nextPost.data.title} &rarr;
      </a>
    )}
  </nav>
)}
```

**Pitfall:** "Previous" and "Next" are semantically relative to publication date, not array index. With descending date sort, the post at `currentIndex + 1` is the older post (previous chronologically). Make sure your UI labels match. Invert if you sort ascending.

**Source:** https://johndalesandro.com/blog/astro-adding-previous-and-next-post-navigation-links-to-blog/

---

### 1d. Draft Post Filtering in Production Builds

**Approach:** `import.meta.env.PROD` guard on `getCollection` (HIGH confidence — official docs pattern)

**Schema (add to `src/content/config.ts`):**
```typescript
draft: z.boolean().optional(),
```

**Frontmatter in post file:**
```yaml
---
draft: true
---
```

**Filter in every `getCollection` call:**
```typescript
const posts = await getCollection('blog', ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true
);
```

**Critical caveat:** This filter only removes drafts from lists, index pages, and RSS. The draft post's own URL (`/blog/my-draft-post/`) is still generated and publicly accessible during a production build unless you also gate it in `getStaticPaths`:

```typescript
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );
  return posts.map(post => ({ params: { slug: post.id }, props: post }));
}
```

Apply the same filter to: the blog index, the RSS feed, the sitemap, and any tag/category listing pages.

**Source:** https://scottwillsey.com/creating-drafts-in-astro/

---

## 2. Newsletter Integration

**Recommendation: Buttondown embed form** (HIGH confidence)

For a fully static Netlify site with no SSR, Buttondown's HTML embed is the simplest zero-backend approach. Buttondown processes the form POST on their servers — you need no Netlify Functions or Astro Actions.

**HTML Form (drop into any `.astro` component):**
```html
<form
  action="https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME"
  method="POST"
  target="popupwindow"
  onsubmit="window.open('https://buttondown.com/YOUR_USERNAME', 'popupwindow')"
>
  <input type="email" name="email" placeholder="you@example.com" required />
  <!-- Optional: capture first name -->
  <input type="text" name="metadata__first-name" placeholder="First name" />
  <button type="submit">Subscribe</button>
</form>
```

**Tags on subscribe (optional):**
```html
<input type="hidden" name="tag" value="blog-reader" />
```

**CORS note:** Buttondown handles cross-origin submissions. The `target="popupwindow"` pattern opens a confirmation page on Buttondown's domain, which avoids any CORS issue on the static site. No Netlify Functions required.

**Fallback: Mailchimp embed**
Mailchimp also provides a copy-pasteable HTML embed form under Audience > Signup Forms > Embedded Forms. Same zero-backend approach. Buttondown is preferred for personal blogs because it is simpler, has a generous free tier (no subscriber cap until paid features), and is developer-friendly.

**What to avoid:** Astro Actions (`defineAction` in `src/actions/`) require a server runtime and do not work on a static Netlify deployment without the `@astrojs/netlify` adapter. Do not use Actions for this.

**Sources:**
- https://docs.buttondown.com/building-your-subscriber-base
- https://buttondown.com/blog/netlify

---

## 3. RSS Feed

**Approach:** `@astrojs/rss` with a `src/pages/rss.xml.js` endpoint (HIGH confidence — official Astro docs)

**Install:**
```bash
npm install @astrojs/rss
```

**`astro.config.mjs` — required:**
```javascript
export default defineConfig({
  site: 'https://yourdomain.com', // Required for absolute URLs in feed
});
```

**`src/pages/rss.xml.js`:**
```javascript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );

  // Sort newest first
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Your Blog Title',
    description: 'A short description',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      // Optional: include full HTML content
      content: sanitizeHtml(parser.render(post.body ?? ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    customData: '<language>en-us</language>',
  });
}
```

**Additional install for full-content RSS:**
```bash
npm install sanitize-html markdown-it
```

**Result:** Generates `/rss.xml` at build time. Works on Netlify static hosting with no adapter. The `site` value in `astro.config.mjs` is required — without it, item links will be relative and invalid for feed readers.

**Source:** https://docs.astro.build/en/recipes/rss/

---

## 4. Sitemap

**Approach:** `@astrojs/sitemap` integration (HIGH confidence — official Astro docs)

**Install:**
```bash
npx astro add sitemap
# Or manually:
npm install @astrojs/sitemap
```

**`astro.config.mjs`:**
```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com', // Required
  integrations: [sitemap()],
});
```

**Output:** Generates `sitemap-index.xml` and `sitemap-0.xml` in the build output automatically. No additional configuration needed for a simple blog.

**Excluding draft pages from the sitemap:**

Since draft pages still generate URLs during a production build (see section 1d pitfall), use the `filter` option to exclude them by URL pattern — or better, use a URL convention like `/blog/drafts/` that you can filter:

```javascript
sitemap({
  filter: (page) => !page.includes('/drafts/'),
})
```

Alternatively, if you have structured slug naming, use:
```javascript
sitemap({
  serialize(item) {
    // Exclude any page you know is a draft by URL
    if (item.url.endsWith('/draft-post/')) return undefined;
    item.changefreq = 'weekly';
    item.priority = 0.7;
    return item;
  },
})
```

**Note:** Google ignores `changefreq` and `priority` values in sitemaps. Setting them is harmless but has no SEO effect.

**Current version:** 3.7.1

**Source:** https://docs.astro.build/en/guides/integrations-guide/sitemap/

---

## 5. Category / Tag Filtering

Two complementary strategies exist. Use both together.

### 5a. Static Tag Pages via `getStaticPaths` (Recommended for SEO)

Creates a dedicated page at `/tags/[tag]` for each unique tag. Each page is statically pre-rendered and indexable by search engines.

**`src/pages/tags/[tag].astro`:**
```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );

  // Get all unique tags across all posts
  const uniqueTags = [...new Set(allPosts.flatMap(post => post.data.tags ?? []))];

  return uniqueTags.map(tag => ({
    params: { tag },
    props: {
      posts: allPosts
        .filter(post => (post.data.tags ?? []).includes(tag))
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()),
    },
  }));
}

const { tag } = Astro.params;
const { posts } = Astro.props;
---

<h1>Posts tagged: {tag}</h1>
<ul>
  {posts.map(post => (
    <li><a href={`/blog/${post.id}/`}>{post.data.title}</a></li>
  ))}
</ul>
```

**Source:** https://docs.astro.build/en/tutorial/5-astro-api/2/

---

### 5b. Client-Side Filtering on the Blog Index (No page reload)

For the main `/blog` listing page, you can add client-side filter buttons using vanilla JavaScript. No Astro Islands, no framework needed.

**Pattern:**

1. Embed post tags as CSS classes on each card during static render.
2. Embed unique tags as `data-` attributes on filter buttons.
3. A `<script>` tag handles visibility toggling.

```astro
---
// In blog index page
const posts = await getCollection('blog', /* draft filter */);
const allTags = [...new Set(posts.flatMap(p => p.data.tags ?? []))];
---

<!-- Filter buttons -->
<div id="tag-filters">
  <button data-tag="all" class="active">All</button>
  {allTags.map(tag => (
    <button data-tag={tag}>{tag}</button>
  ))}
</div>

<!-- Post cards — embed tags as data attribute -->
<ul id="post-list">
  {posts.map(post => (
    <li data-tags={(post.data.tags ?? []).join(',')}>
      <a href={`/blog/${post.id}/`}>{post.data.title}</a>
    </li>
  ))}
</ul>

<script>
  const buttons = document.querySelectorAll('#tag-filters button');
  const cards = document.querySelectorAll('#post-list li');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.tag;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const tags = card.dataset.tags?.split(',') ?? [];
        card.style.display =
          selected === 'all' || tags.includes(selected) ? '' : 'none';
      });
    });
  });
</script>
```

**Tradeoffs:**

| Approach | SEO | Build time | UX |
|----------|-----|------------|----|
| Static tag pages (`getStaticPaths`) | Indexable per tag | Longer on large sites | Full page load per tag |
| Client-side JS filter | Not indexable per tag | Fast | Instant, no reload |

Use both: static tag pages for SEO and deep linking, client-side filter on the blog index for smooth UX.

**Source:** https://digital-expanse.com/tutorials/astro-blog-filters/

---

## Table Stakes

Features users expect in a personal blog. Missing = blog feels unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Reading time | Standard in dev blogs since ~2018 | Low | One remark plugin, 2 npm deps |
| Post excerpt / description | Required for index cards and SEO meta | Low | Prefer manual `description` frontmatter |
| RSS feed | Expected by readers using feed readers | Low | `@astrojs/rss`, ~20 lines |
| Sitemap | Required for Google Search Console | Low | `@astrojs/sitemap`, zero config |
| Draft filtering | Required to avoid publishing WIP | Low | One filter in `getCollection` |
| Prev/next navigation | Keeps readers on site | Low | `findIndex` on sorted collection |

## Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tag filtering (client-side) | Better browsing UX | Low | Vanilla JS, no framework needed |
| Tag pages (static) | SEO for topic clusters | Low | `getStaticPaths` pattern |
| Full content in RSS | Readers who use feed readers stay subscribed | Medium | Requires `sanitize-html` + `markdown-it` |
| Newsletter (Buttondown) | Grows audience | Low | Drop-in HTML form |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Astro Actions for newsletter | Requires SSR adapter on Netlify | Use Buttondown embed form (client POST to Buttondown's API) |
| Framework component for tag filter | Over-engineered for simple show/hide | Vanilla JS `<script>` in `.astro` file |
| Server-side tag filtering | Requires SSR | Pre-generate tag pages with `getStaticPaths` |
| Comments system (e.g. Disqus) | Adds third-party tracking, slows page | Use GitHub Discussions embed or omit entirely |

---

## Feature Dependencies

```
Draft filtering → RSS feed (drafts must also be filtered in RSS)
Draft filtering → Sitemap (drafts must also be excluded from sitemap)
Draft filtering → Tag pages (drafts must also be excluded from tag getStaticPaths)
Reading time → Remark plugin (requires remarkPlugins config in astro.config.mjs)
Excerpt → description frontmatter OR body processing (choose one strategy consistently)
Tag filtering client-side → Tag pages static (both use same tag data from schema)
RSS/Sitemap → site value in astro.config.mjs (both fail without it)
Prev/next navigation → Consistent sort order (must match blog index sort)
```

---

## MVP Recommendation

Prioritize in this order:

1. **Draft filtering** — Do this first. Every other feature must respect it.
2. **RSS feed** — Low effort, high value for discoverability.
3. **Sitemap** — Zero config once `site` is set. Required for search.
4. **Reading time** — One remark plugin, commonly expected.
5. **Excerpt / description** — Add `description` to schema from day one.
6. **Prev/next navigation** — Simple component, keeps readers engaged.
7. **Static tag pages** — Build these before client-side filter.
8. **Client-side tag filter** — Add after tag pages exist.
9. **Newsletter** — Buttondown embed, can be added at any phase.

Defer: Full-content RSS (sanitize-html adds complexity; summary-only RSS ships faster and is sufficient).

---

## Sources

- [Astro Reading Time Recipe](https://docs.astro.build/en/recipes/reading-time/) — HIGH confidence
- [Astro RSS Guide](https://docs.astro.build/en/recipes/rss/) — HIGH confidence
- [Astro Sitemap Integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — HIGH confidence
- [Astro Generate Tag Pages Tutorial](https://docs.astro.build/en/tutorial/5-astro-api/2/) — HIGH confidence
- [Creating Drafts in Astro 5](https://scottwillsey.com/creating-drafts-in-astro/) — HIGH confidence
- [Prev/Next Navigation](https://johndalesandro.com/blog/astro-adding-previous-and-next-post-navigation-links-to-blog/) — MEDIUM confidence
- [Excerpt Generation Pattern](https://www.paulie.dev/posts/2023/09/how-to-create-excerpts-with-astro/) — MEDIUM confidence
- [Client-Side Blog Filters](https://digital-expanse.com/tutorials/astro-blog-filters/) — MEDIUM confidence
- [Buttondown Subscriber Base Docs](https://docs.buttondown.com/building-your-subscriber-base) — HIGH confidence
- [Buttondown + Netlify](https://buttondown.com/blog/netlify) — MEDIUM confidence
