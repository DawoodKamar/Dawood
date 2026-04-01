---
phase: 03
slug: pages-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (build verification + browser + Netlify deploy inspection) |
| **Config file** | N/A |
| **Quick run command** | `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build` |
| **Full suite command** | `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build && PATH="/opt/homebrew/opt/node@22/bin:$PATH" npx astro check` |
| **Estimated runtime** | ~5 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx astro check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | BLOG-01, BLOG-03 | build | `npm run build && ls dist/blog/` | ❌ Wave 0 | ⬜ pending |
| 03-01-02 | 01 | 1 | BLOG-02, BLOG-04, BLOG-05, BLOG-06, BLOG-07 | build + browser | `npm run build && grep "embed-subscribe" dist/blog/ai-noise/index.html` | ❌ Wave 0 | ⬜ pending |
| 03-01-03 | 01 | 1 | NEWS-01, NEWS-04 | build | `npm run build && grep -r "embed-subscribe" dist/ \| wc -l` | ❌ Wave 0 | ⬜ pending |
| 03-02-01 | 02 | 2 | CONTACT-01, CONTACT-02, CONTACT-03 | build | `npm run build && ls dist/contact/ && ls dist/success/` | ❌ Wave 0 | ⬜ pending |
| 03-02-02 | 02 | 2 | CONTACT-04, CONTACT-05, CONTACT-06 | build + browser | `npm run build && grep "data-netlify" dist/contact/index.html` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/blog/index.astro` — blog listing page stub
- [ ] `src/pages/blog/[id].astro` — dynamic post route stub
- [ ] `src/components/PostNavigation.astro` — prev/next nav stub
- [ ] `src/components/NewsletterSignup.astro` — Buttondown embed form stub
- [ ] `src/pages/contact.astro` — contact page stub
- [ ] `src/pages/success.astro` — form success page stub
- [ ] `src/components/ContactForm.astro` — Netlify Forms wrapper stub

*All stubs created as part of plan execution — no separate Wave 0 setup phase needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Post cards show title, description, date, reading time, category | BLOG-02 | Visual layout check | `npm run dev` → visit `/blog/` → inspect each card |
| Markdown renders with typography styles | BLOG-04 | Visual rendering check | `npm run dev` → visit a post → inspect headings/code blocks have prose styles |
| Prev/next navigation links appear at post bottom | BLOG-05 | Navigation UX check | Visit `/blog/ai-noise/` → verify prev/next links present and correct |
| Category tags on post cards and post pages | BLOG-07 | Visual check | `npm run dev` → inspect category badge text on listing and post pages |
| Email input has HTML5 validation | NEWS-02 | Browser behavior | Try submitting invalid email → browser shows validation message |
| Newsletter submission opens Buttondown thank-you | NEWS-03 | Requires live deploy + valid Buttondown username | Submit test email → confirm redirect/new tab |
| Netlify Forms detected after first deploy | CONTACT-02 | Requires Netlify deploy | Push to remote → check Netlify dashboard Forms section |
| Form redirects to /success after submission | CONTACT-03 | Requires live deploy | Submit contact form → confirm redirect to /success |
| Client-side validation shows inline errors | CONTACT-05 | Browser behavior | Submit empty form → verify inline error messages appear |
| Honeypot field present and hidden | CONTACT-06 | Build inspection | `npm run build && grep "bot-field\|honeypot" dist/contact/index.html` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
