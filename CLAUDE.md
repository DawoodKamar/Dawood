# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog for Dawood Kamar, built with Astro 5, Tailwind CSS v4, and deployed on Netlify as a static site.

## Commands

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

- **Astro 5** static site (`output: "static"` in `astro.config.mjs`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (configured in `src/styles/global.css` with `@import "tailwindcss"`)
- **Content Collections** for blog posts: Markdown files in `src/content/blog/`, schema in `src/content.config.ts`
- **View Transitions** via Astro's `<ClientRouter />` in `BaseLayout.astro`

## Key Patterns

**Blog post schema** (`src/content.config.ts`): Posts require `title`, `description`, `date`, and `category` (one of: "AI & Work", "Focus & Discipline", "Culture & Place", "Clarity & Communication"). Posts with `draft: true` are excluded from production builds but visible in dev.

**Dark mode**: Class-based (`.dark` on `<html>`), persisted in `localStorage` under key `theme`. The inline script in `BaseLayout.astro` applies it before paint and handles view transitions via `astro:before-swap`. Tailwind dark variant is configured as `@custom-variant dark (&:where(.dark, .dark *))` in `global.css`.

**Reading time**: Custom remark plugin (`src/plugins/remark-reading-time.mjs`) injects `minutesRead` into frontmatter, accessed via `remarkPluginFrontmatter` after `render()`.

**Site constants**: `SITE_URL` and `SITE_TITLE` live in `src/config.ts`.

## Deployment

Netlify builds with `npm run build`, publishes `dist/`. Node 22 is set in `netlify.toml`.

## Git Workflow

**IMPORTANT: Never push to `main`. Always stay on the `redesign` branch.** All work must be committed to `redesign`. Do not switch branches or create PRs to `main` unless explicitly instructed by the user.
