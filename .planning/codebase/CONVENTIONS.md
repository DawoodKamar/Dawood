# CONVENTIONS.md

## Code Style

**HTML:**
- Semantic elements: `<header>`, `<section>`, `<nav>`, `<figure>`, `<figcaption>`
- Indentation: 2 spaces
- No template engine — all content hardcoded

**CSS:**
- Section comments with `/* _---...--- section name ---...--- */` pattern
- Custom properties defined on `*` selector (unusual — scoped to all elements): `--_bgdark`, `--_bgdarktext`, `--_bglight`
- Dark mode via `html.dark` class — all dark variants are `.dark .selector` rules
- No CSS variables for all colors — some hardcoded (`#007bff`, `#0056b3`, `#ededed`)
- Media queries inline within sections (not consolidated)

**JavaScript:**
- Section comments with `// _---...--- section name ---...---` pattern
- ES6+: arrow functions, `const`/`let`, template literals, `forEach`
- No modules, no imports, no bundling
- DOM queries at top-level (runs on load, assumes elements exist)
- Inline HTML strings in JS switch/case for project details (brittle pattern)

## Dark Mode Pattern

```css
/* Light default */
html { background-color: var(--_bglight); }

/* Dark override */
html.dark { background-color: var(--_bgdark); color: var(--_bgdarktext); }
.dark .component { ... }
```

## Responsive Pattern

Mobile-first breakpoints:
- `max-width: 640px` — hero stacks vertically
- `max-width: 768px` — project cards stack
- `min-width: 790px` — desktop nav visible, hamburger hidden
- `max-width: 800px` — contact card full-width
- `max-width: 1000px` — project image resize

## State Management

- Theme: `localStorage.getItem("theme")` / `localStorage.setItem("theme", ...)`
- UI state: CSS class toggling (`.dark`, `.expanded`, `.expanded-project`, `.visible`)
- Modal state: `element.style.display = "block"/"none"`

## Error Handling

None. DOM queries assume elements exist. No try/catch, no null checks.
