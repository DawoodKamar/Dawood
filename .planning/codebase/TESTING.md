# TESTING.md

## Framework

None. Zero test infrastructure.

## Coverage

- Unit tests: 0
- Integration tests: 0
- E2E tests: 0
- Visual regression tests: 0

## Testing Approach

Manual browser testing only. No automated tests exist or are configured.

## CI/CD

Netlify auto-deploys on push to `main`. No test step in the pipeline. No lint, no format check, no type check.

## What Should Be Tested (if tests were added)

- Theme toggle: persists to `localStorage`, applies `.dark` class
- Mobile menu: opens/closes, closes on outside click
- Scroll nav: shows/hides at 50px scroll threshold
- Project expansion: correct HTML injected per project class
- Contact modal: opens/closes via multiple triggers
- CTA button: scrolls to `#projects`

## Notes

This is a static portfolio site. The value of automated tests is low relative to the codebase size. Manual verification on deploy is the current practice.
