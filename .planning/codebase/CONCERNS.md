# CONCERNS.md

## Bugs

### CTA Button Logic Error (`scripts.js:84`)
```js
if ((window.location.hash = "#projects")) {  // assignment, not comparison
```
`=` instead of `===`. The condition is always truthy (assignment returns the assigned value). The button "works" by accident — both branches set `#projects`, but the logic is broken and would fail if the branches differed.

### Broken Image Paths for CodScope (`scripts.js:245`)
```js
<img src="images/CodScopehome1.png" ...>
<img src="images/CodScopeabout.png" ...>
<img src="images/CodScopecontact.png" ...>
```
These reference `CodScopehome1.png`, `CodScopeabout.png`, `CodScopecontact.png` but only `codscopehome.png` (lowercase) exists in `images/`. Netlify runs on Linux (case-sensitive filesystem) — these will 404 in production.

Similarly `images/sharp-ui.png` is referenced in the Sharp project block but does not exist in `images/`.

## Tech Debt

### Inline HTML in JavaScript (`scripts.js:117-260`)
Project detail content is built as HTML template literal strings inside a switch/case on CSS class names. This is fragile — adding a project requires editing JS, coupling content to presentation logic. Should be in HTML data attributes or separate content objects.

### Inline Style Manipulation
`projectDetail.style.display = "block"/"none"` used alongside CSS class toggling. Mixing approaches makes state harder to reason about. `projectDetail.remove()` on collapse means next expand recreates the DOM node.

### Stale File
`.DS_Store_backup` in repo root — macOS metadata artifact, should be deleted and added to `.gitignore`.

### Missing `.gitignore`
No `.gitignore` file. `.DS_Store` files could be committed accidentally.

## Security

### Exposed Email Address
Contact info in `index.html` is plain text — email address is scraped by bots. No obfuscation or mailto encoding.

### No CSP Headers
No Content Security Policy. Netlify serves with default headers. External font from `fonts.googleapis.com` loads without SRI (Subresource Integrity).

### No SRI on Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">
```
No `integrity` attribute. Low risk for fonts but best practice missing.

## Performance

### No Lazy Loading
All images load on page load. Project screenshots (inside expand sections) load even before the user opens them. Should use `loading="lazy"`.

### No Image Dimensions
`<img>` tags lack `width`/`height` attributes — causes layout shift (CLS) as images load.

### No Favicon
Missing `<link rel="icon">` — browser makes a 404 request on every load.

## SEO

### Missing Meta Tags
No `<meta name="description">`, no Open Graph tags (`og:title`, `og:image`), no Twitter Card tags. Social shares will have no preview.

### Missing Structured Data
No JSON-LD for Person schema — missed opportunity for search engine rich results.

## Maintainability

### All Content in One File
`index.html` contains all project descriptions, skills, and copy. Makes content updates require HTML editing rather than data changes.

### No Version Pinning for Fonts
Google Fonts URL has no version — font could change upstream.
