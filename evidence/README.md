# Evidence Directory

This folder stores browser evidence collected by the Playwright collector.

Expected structure after a real crawl:

```text
evidence/
  screenshots/
    product-desktop.png
    product-mobile.png
    collection-desktop.png
    policy-desktop.png
    cart-mobile.png
```

Screenshot files are ignored by Git by default because they may contain client-specific storefront data.

Keep this README so the `evidence/` directory exists in the repository.
