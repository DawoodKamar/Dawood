# ARCHITECTURE.md

## Pattern

Single-page static website. No framework, no build step, no server-side rendering. Pure HTML/CSS/JS served directly by Netlify as static files.

## Entry Point

`index.html` — single file containing all sections: header, hero, about (skills), projects, contact modal.

## Layers

```
Browser
  └── index.html          (structure + content)
  └── styles.css          (all styling + dark mode + responsive)
  └── scripts.js          (all interactivity)
  └── images/             (static assets)
  └── cv/DawoodKamar-CV.pdf
```

No routing layer. Navigation is anchor-based (`#projects`, `/`). No state management beyond `localStorage` for theme preference.

## Data Flow

1. Page loads → `scripts.js` reads `localStorage.theme` → applies `.dark` class to `<html>`
2. User scrolls → scroll event shows/hides sticky nav
3. User clicks "More Info" → `expandProject()` dynamically builds and injects HTML into DOM
4. User clicks "Contact" → modal shown via `display: block`

## Key Abstractions

- **Dark mode**: `html.dark` CSS class toggle + `localStorage` persistence
- **Project expansion**: `expandProject()` function builds HTML strings per project (switch/case on CSS class name)
- **Contact modal**: `#contactCard` div shown/hidden via inline style

## No Abstractions

- No components, no modules, no imports
- No state management library
- No templating engine
- No API calls

## Deployment

Netlify reads `netlify.toml` (sets Node 22 for build environment). No build command. Files served as-is from repo root.
