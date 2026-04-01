---
phase: 2
slug: layout-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Browser manual + Astro build checks |
| **Config file** | none — no test framework for this static site |
| **Quick run command** | `npx astro build 2>&1 | tail -5` |
| **Full suite command** | `npx astro build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx astro build 2>&1 | tail -5`
- **After every plan wave:** Run `npx astro build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | NAV-01 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | NAV-02 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | NAV-03 | manual | see Manual-Only | — | ⬜ pending |
| 02-01-04 | 01 | 1 | NAV-04 | manual | see Manual-Only | — | ⬜ pending |
| 02-01-05 | 01 | 1 | NAV-05 | manual | see Manual-Only | — | ⬜ pending |
| 02-01-06 | 01 | 1 | NAV-06 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-01-07 | 01 | 1 | NAV-07 | manual | see Manual-Only | — | ⬜ pending |
| 02-02-01 | 02 | 2 | HOME-01 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | HOME-02 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | HOME-03 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | HOME-04 | build | `npx astro build` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 2 | HOME-05 | manual | see Manual-Only | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No test framework to install — this is a static Astro site with no automated test runner
- Existing `npx astro build` serves as the automated verification signal for all file-creation tasks

*Existing infrastructure covers all phase requirements that admit automated checking.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| View transition crossfade (no full-page reload) | NAV-03 | Requires browser Network tab observation | Open devtools → Network → navigate between pages → confirm no document requests appear |
| Dark mode persists across navigations | NAV-04 | Requires browser state + visual check | Enable dark mode → navigate away → confirm no FOUC and dark mode stays active |
| Dark mode persists across refreshes | NAV-04 | Requires browser refresh | Enable dark mode → refresh → confirm dark mode still active |
| Hamburger menu works after navigation | NAV-05 | Requires multi-page interaction | Navigate to any page → open hamburger menu → confirm it opens/closes |
| Active nav link highlighted | NAV-07 | Requires visual inspection per page | Visit each page → confirm current page nav link has active style |
| Newsletter form visible | HOME-05 | Requires visual check | Load homepage → confirm newsletter section renders with form inputs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
