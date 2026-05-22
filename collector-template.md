# Collector Bridge — From Zero to audit.json

This document explains how to upgrade the static demo into a **real crawler** using OpenClaw browser agent + Codex.

## Architecture

```
┌─────────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│  OpenClaw Browser   │ ───▶ │  collector.js output   │ ───▶ │  Agentic Commerce   │
│  Agent (fetch +     │      │  audit.json            │      │  Readiness Desk     │
│  screenshot + click) │      │  (data contract)       │      │  (index.html)       │
└─────────────────────┘      └──────────────────────┘      └─────────────────────┘
```

The dashboard (`index.html`) consumes `audit.json`. Your job is to build a collector that produces this file.

## Phase 1: URL Discovery (OpenClaw Browser Agent)

OpenClaw browser agent opens the store and collects:

```text
For each page in target URL list:
  1. Navigate to page URL
  2. Wait for load (network idle)
  3. Collect:
     - Screenshot: full-page desktop (1440×900) and mobile (390×844)
     - DOM: document.title, canonical link, meta[og:*], all <script type="application/ld+json">
     - Visible text: innerText of main content area (truncated to 2KB)
     - DOM selectors: querySelector for cart button, variant selector, price display, discount input
```

### OpenClaw Browser Agent Commands

```text
For each URL:
  web_fetch(url) → extract markdown, look for JSON-LD script tags
  web_fetch(url?view=source) → extract raw HTML, parse JSON-LD
  
  If product page:
    Click variant selector (e.g., select[name="id"], .variant-selector)
    Check if JSON-LD Offer.price updates after variant change
    Screenshot after variant change
    
  If cart page:
    Enter test discount code (do NOT submit payment)
    Check if discount appears in subtotal
    Click checkout button → verify redirect URL (do NOT enter payment)
    Screenshot cart with discount applied
```

## Phase 2: JSON-LD Validation

Parse extracted JSON-LD and check against rules:

| Check | Rule | Severity if missing |
|-------|------|---------------------|
| Product page has @type=Product | `jsonld.some(j => j['@type'] === 'Product')` | critical |
| Product has offers | `Product.offers['@type'] === 'Offer'` | critical |
| Offer has price + currency | `Offer.price && Offer.priceCurrency` | high |
| Offer has availability | `Offer.availability` | medium |
| Product has brand | `Product.brand || Product.brand?.name` | low |
| Product has description | `Product.description && Product.description.length > 50` | medium |
| Product has image | `Product.image` (or og:image) | low |
| Collection has ItemList | `jsonld.some(j => j['@type'] === 'ItemList')` | high |
| Collection has BreadcrumbList | `jsonld.some(j => j['@type'] === 'BreadcrumbList')` | medium |
| Policy page has FAQPage | `jsonld.some(j => j['@type'] === 'FAQPage')` | high |
| JSON-LD price matches DOM price | `Offer.price === visiblePrice` | critical |

## Phase 3: Checkout Handoff Verification

OpenClaw browser agent exercises the purchase path up to (but not including) payment:

```text
1. Navigate to product page
2. Select first available variant (click variant button/option)
3. Click "Add to Cart" button
4. Navigate to cart page
5. Verify item appears with correct variant, quantity, price
6. Enter discount code "TEST" in discount field
7. Click apply → verify success/failure message
8. Change quantity to 2 → verify subtotal updates
9. Click "Checkout" button
10. Verify redirect to checkout URL (do NOT enter any payment info)
11. Record: cartUrl, checkoutRedirectUrl, cartState, discountApplied, discountResult
```

## Phase 4: Generate audit.json

Map all findings into the `audit.json` format. See the file in this project for the exact schema.

### audit.json Schema (minimal)

```json
{
  "meta": {
    "project": "string",
    "url": "string (store URL)",
    "platform": "Shopify | Shopify Hydrogen | WooCommerce | Custom",
    "generatedAt": "ISO-8601 timestamp",
    "collector": "OpenClaw browser agent",
    "viewportDesktop": "1440x900",
    "viewportMobile": "390x844"
  },
  "crawlResults": {
    "pages": [{
      "url": "string", "type": "product|collection|policy|cart|home",
      "status": 200, "viewport": "desktop|mobile",
      "screenshot": "evidence/screenshots/...", "mobileScreenshot": "...",
      "canonical": "string", "title": "string",
      "ogTitle": "string", "ogImage": "string", "ogType": "string",
      "jsonld": [{ ... }], "jsonldWarnings": ["..."],
      "domExcerpt": { "key": "selector" },
      "visibleText": ["..."]
    }],
    "checkoutHandoff": {
      "success": true, "cartUrl": "string", "checkoutRedirectUrl": "string",
      "cartState": { "items": 1, "subtotal": "string", "currency": "string" },
      "discountApplied": false, "discountCode": "string", "discountResult": "string",
      "warnings": ["..."]
    }
  },
  "issues": [{
    "id": "ACR-XXX", "severity": "critical|high|medium|low",
    "category": "discoverability|checkout|trust|content|mobile",
    "page": "string", "signal": "string", "title": "string",
    "businessImpact": "string", "fix": "string", "effort": "S|M|L",
    "evidence": {
      "screenshots": ["..."], "jsonldSnippet": {...}, "domSelectors": ["..."]
    }
  }],
  "runPlan": [{
    "step": 1, "task": "string",
    "pages": ["..."], "collect": ["..."], "actions": ["..."]
  }]
}
```

## Phase 5: Load into Dashboard

1. Open `index.html` in browser
2. Click "上传 audit.json" or drag the file onto the page
3. Dashboard renders scores, issues, evidence, checkout handoff, pages table, run plan, and implementation prompt

## Codex Tasks

Codex can help with:

1. **Schema patch generation**: Given extracted JSON-LD vs what's missing, generate Liquid/theme files that add the correct structured data
2. **Product template fixes**: Rewrite product title/description templates to include brand, material, dimensions
3. **Policy FAQ blocks**: Convert prose policies into FAQPage JSON-LD + HTML
4. **Cart/checkout accessibility**: Fix discount field placement, labels, keyboard focus

## Boundary (DO NOT CROSS)

- ❌ No Shopify Admin API tokens
- ❌ No payment data or payment submission
- ❌ No customer PII
- ❌ No credential storage
- ✅ Public storefront pages only
- ✅ Cart interaction without payment
- ✅ Checkout redirect verification (URL check only)

## Example: Complete collector flow

```text
OpenClaw browser agent command sequence:

1. web_fetch(https://shop.example.com/products/jacket, extractMode=markdown)
   → Save title, visible text, OG tags
   
2. web_fetch(https://shop.example.com/products/jacket?view=source)
   → Extract all <script type="application/ld+json"> blocks
   → Parse each as JSON
   → Validate against Product/Offer schema rules

3. Navigate to product page in browser viewport
   → Click first variant option
   → Screenshot
   → Check if JSON-LD Offer.price matches visible price
   
4. Click "Add to Cart"
   → Navigate to /cart
   → Screenshot
   → Enter discount code
   → Click checkout button
   → Capture redirect URL (do not enter payment)
   
5. Repeat for each target URL

6. Compile all findings → audit.json
7. Drop audit.json into dashboard → verify rendering
```

## File Relationships

```
collector-template.md  ← YOU ARE HERE (how to build the crawler)
openclaw-run.md        ← OpenClaw agent execution script (what to paste into OpenClaw)
audit.json             ← Sample data file (what the crawler produces)
index.html             ← Dashboard (what consumes audit.json)
```
