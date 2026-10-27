# StoneBrook Carpentry Website

Website for Brilliant Impact. Static HTML/CSS/JS, published with GitHub Pages.

## Pages

| URL | Source |
|---|---|
| `/` | `index.html` (hand-written; shared blocks injected by the build) |
| `/projects/` and `/projects/<category>/` | generated |
| `/free-estimate/` | generated |
| `/privacy-policy/`, `/terms/` | generated (draft placeholders, noindex) |
| `/404.html` | generated |
| `/projects.html` | generated redirect for old links |

## Editing

Shared content lives in one place:

- `data/projects.json`: project categories, photos, captions, page titles and descriptions
- `partials/estimate.html`: the estimate section (homepage and `/free-estimate/`)
- `partials/sprite.html`: pencil-mark SVG symbols
- `tools/build.py`: header, footer, phone bar, gallery and page templates

After changing any of those, rebuild:

```bash
python3 tools/build.py
```

The build rewrites the generated pages and refreshes the blocks in `index.html` between
`<!-- BUILD:name -->` markers. Edit the rest of `index.html` directly.

Scripts: `main.js` (homepage), `page.js` (inner pages), `nav.js` (Our Work dropdown,
every page), `estimate.js` (estimate form), `projects.js` (gallery lightbox).

Before launch on the real domain, update `SITE` and `BASE_PATH` in `tools/build.py` and rebuild.
See `docs/LAUNCH-CHECKLIST.md`.
