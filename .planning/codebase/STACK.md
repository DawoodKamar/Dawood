# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- HTML5 - Single-page site markup (`index.html`)
- CSS3 - All styling, dark mode, responsive layout (`styles.css`)
- JavaScript (ES6+) - Interactivity, theme toggle, menu behavior (`scripts.js`)

**Secondary:**
- None

## Runtime

**Environment:**
- Browser — no server-side runtime; static files served directly
- Node.js 22 — declared in `netlify.toml` for Netlify's build environment only (no actual build step uses it)

**Package Manager:**
- None — no `package.json`, no lockfile, no dependencies to install

## Frameworks

**Core:**
- None — pure vanilla HTML, CSS, and JavaScript; no frontend framework

**Testing:**
- None — no test framework present

**Build/Dev:**
- None — no build pipeline; files are served as-is
- `npx serve .` — suggested for local live-reload (not a project dependency)

## Key Dependencies

**Critical:**
- Google Fonts CDN — `https://fonts.googleapis.com` — loads `Courgette` and `Yellowtail` typefaces at runtime via `<link>` tags in `index.html`

**Infrastructure:**
- None — no npm packages, no bundler, no transpiler

## Configuration

**Environment:**
- No environment variables required; no `.env` files present
- No runtime configuration files beyond `netlify.toml`

**Build:**
- `netlify.toml` — sets `NODE_VERSION = "22"` under `[build.environment]`; no build command defined

## Platform Requirements

**Development:**
- Any modern web browser to open `index.html` directly
- Optional: `npx serve .` for live-reload (requires Node.js ad-hoc, not installed as a project dependency)

**Production:**
- Netlify — static hosting; pushing to `main` triggers automatic deploy with no build command

---

*Stack analysis: 2026-04-01*
