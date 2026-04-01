# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Fonts:**
- Google Fonts — loads `Courgette` and `Yellowtail` font families at page load
  - SDK/Client: CDN `<link>` tags in `index.html` (lines 7-12)
  - Auth: None required (public CDN)

**No other external APIs are used by this site directly.** Projects described in the portfolio content reference third-party integrations (Stripe, Google Maps) in separate codebases, not in this site.

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only — images served from `images/`, CV PDF served from `cv/DawoodKamar-CV.pdf`

**Caching:**
- None — no service worker, no cache headers configured

## Authentication & Identity

**Auth Provider:**
- None — the portfolio site has no login, no sessions, no protected routes

**Browser Storage:**
- `localStorage` — used exclusively for persisting dark/light theme preference under the key `theme` (`scripts.js`, lines 3-18)

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- None — no analytics, no logging service integrated

## CI/CD & Deployment

**Hosting:**
- Netlify — static site hosting; auto-deploys on push to `main`
- Config: `netlify.toml`

**CI Pipeline:**
- None — no GitHub Actions or other CI configured

## Environment Configuration

**Required env vars:**
- None — the site requires no environment variables at runtime or build time

**Secrets location:**
- Not applicable — no secrets used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None — contact information is displayed as static text (email: `dawood.kamar@hotmail.com`); no form submission or email API is wired up

## Social / External Links

The site links out to these external profiles (static `<a>` tags only, no API calls):
- LinkedIn: `https://www.linkedin.com/in/dawood-kamar/`
- Twitter: `https://twitter.com/Dawoodkamar`
- GitHub: `https://github.com/DawoodKamar`

---

*Integration audit: 2026-04-01*
