# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio/CV website for Dawood Kamar. No build step, no framework, no package manager — just vanilla HTML, CSS, and JavaScript deployed on Netlify.

## Structure

- `index.html` — single-page site with all sections (hero, about, projects, contact)
- `styles.css` — all styling, including dark mode via `.dark` class on `<html>`
- `scripts.js` — theme toggle (light/dark, persisted in `localStorage`), hamburger menu, and any other interactivity
- `cv/DawoodKamar-CV.pdf` — linked CV (served directly)
- `images/` — project screenshots and personal photo
- `netlify.toml` — sets Node.js 22 for Netlify's build environment

## Local Development

Open `index.html` directly in a browser — no server required. For live-reload, any static server works:

```bash
npx serve .
```

## Deployment

Deployed via Netlify. Pushing to `main` triggers an automatic deploy. There is no build command; Netlify serves the files as-is.

## Git Workflow

**IMPORTANT: Never push to `main`. Always stay on the `redesign` branch.** All work must be committed to `redesign`. Do not switch branches or create PRs to `main` unless explicitly instructed by the user.

## Dark Mode

Dark mode is toggled by adding/removing the `dark` class on `document.documentElement`. The preference is stored in `localStorage` under the key `theme`. CSS should use the `.dark` selector for dark variants.
