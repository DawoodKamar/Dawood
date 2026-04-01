# STRUCTURE.md

## Directory Layout

```
/
├── index.html              # Single-page app — all sections
├── styles.css              # All styles (global, component, responsive, dark mode)
├── scripts.js              # All JS (theme, menu, scroll, project expand, contact)
├── netlify.toml            # Netlify config (Node 22)
├── CLAUDE.md               # Claude Code instructions
├── .DS_Store_backup        # Stale macOS artifact (should be deleted)
├── images/
│   ├── dawoodimg2.png      # Hero photo
│   ├── form.png            # DK Services project screenshot
│   ├── submissions.png     # DK Services project screenshot
│   ├── pdfexample.png      # DK Services project screenshot
│   ├── google-map.png      # Sharp project screenshot
│   ├── stripe-payment.png  # Sharp project screenshot
│   └── codscopehome.png    # CodScope project screenshot (lowercase)
└── cv/
    └── DawoodKamar-CV.pdf  # CV download link
```

## Key Locations

- All page content: `index.html`
- Dark mode CSS: `styles.css` — `.dark` selector variants throughout
- Theme toggle logic: `scripts.js:1-26`
- Mobile menu logic: `scripts.js:33-62`
- Scroll nav animation: `scripts.js:64-79`
- Project expansion (with inline HTML): `scripts.js:92-268`
- Contact modal: `scripts.js:281-313`

## Naming Conventions

- CSS classes: kebab-case (`.cta-button`, `.side-menu`, `.nav-links`)
- JS functions: camelCase (`expandProject`, `handleToggleClick`, `showCard`, `closeMenu`)
- Images: lowercase with hyphens (`google-map.png`, `stripe-payment.png`)
- IDs: camelCase (`themeToggle`, `contactCard`, `closeBtn`)

## Notable Files

- `.DS_Store_backup` — stale macOS metadata backup, serves no purpose
- `netlify.toml` — only sets Node version; no build command or publish dir needed
