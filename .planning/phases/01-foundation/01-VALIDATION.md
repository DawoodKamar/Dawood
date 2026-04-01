---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (build verification only) |
| **Config file** | N/A |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx astro check` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx astro check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SETUP-01,SETUP-04,SETUP-06 | build smoke | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 1-01-02 | 01 | 1 | SETUP-02,SETUP-03 | build + inspect | `npm run build && grep -v "@astrojs/tailwind" package.json` | ❌ Wave 0 | ⬜ pending |
| 1-02-01 | 02 | 2 | CONTENT-01,CONTENT-02 | type check | `npx astro sync` | ❌ Wave 0 | ⬜ pending |
| 1-02-02 | 02 | 2 | CONTENT-04 | build smoke | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 1-02-03 | 02 | 2 | CONTENT-05 | manual inspect | `npx astro dev` → visit `/test-reading-time` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All test infrastructure requires the Astro project to exist first. Created in Plan 01-01:

- [ ] `package.json` with `"build": "astro build"` script — covers SETUP-01, SETUP-02, SETUP-03, SETUP-06
- [ ] `astro.config.mjs` — covers SETUP-06
- [ ] `netlify.toml` updated with `[build]` section — covers SETUP-04
- [ ] `src/content.config.ts` — covers CONTENT-01, CONTENT-02

Created in Plan 01-02:

- [ ] 3 `.md` files in `src/content/blog/` — covers CONTENT-04
- [ ] `src/pages/test-reading-time.astro` (throwaway) — covers CONTENT-05

*All Wave 0 items must be created before automated verification is possible.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Draft post absent from production | CONTENT-03 | `import.meta.env.PROD` is `false` locally | Deploy to Netlify and verify draft post URL returns 404, OR write throwaway page calling `getCollection` with PROD flag |
| `minutesRead` non-null on render | CONTENT-05 | Remark plugin only runs during server/build | Run `npx astro dev` → visit `/test-reading-time` → confirm reading time displayed |
| Netlify deploy succeeds | SETUP-04 | Requires Netlify CI | Push to `redesign` branch and confirm Netlify build log shows green |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
