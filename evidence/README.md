# Evidence Directory

This folder stores screenshots and browser evidence collected by the OpenClaw browser agent crawler.

## Expected contents after a real crawl:

```
evidence/
├── screenshots/
│   ├── trail-shell-jacket_desktop.png
│   ├── trail-shell-jacket_mobile.png
│   ├── canvas-weekender_desktop.png
│   ├── canvas-weekender_mobile.png
│   ├── collection-bags_desktop.png
│   ├── shipping-policy_desktop.png
│   └── cart_mobile.png
```

## When running the demo:

This folder is empty. The dashboard uses placeholder icons to indicate where screenshots would appear in a real audit.

## When running a real collection:

The OpenClaw browser agent (via `openclaw-run.md`) saves screenshots here and references them in `audit.json`.
