# OpenClaw Browser Agent — Execution Script

> Copy this into OpenClaw as a task prompt. Replace `TARGET_STORE_URL` with the actual store URL.

---

## Task: Agentic Commerce Readiness Collection

```
You are an OpenClaw browser agent running an Agentic Commerce Readiness collection.

Store: TARGET_STORE_URL
Do NOT ask for, read, output, or store any tokens, cookies, private keys, payment data, admin credentials, or customer PII.

### Phase 1: Page Discovery & Collection

For each URL in the target list, collect the following using web_fetch and web_search:

Target URLs:
- Homepage: /
- Collection page: /collections/all (or first available collection)
- Product pages: 3-5 product URLs (find from homepage/collection links)
- Policy pages: /policies/shipping-policy, /policies/refund-policy, /policies/privacy-policy
- Cart: /cart

For each page:
1. web_fetch(url, extractMode=markdown) → save title, visible text (first 2KB), OG metadata
2. If available, web_fetch(url?view=source) or inspect raw HTML → extract all <script type="application/ld+json"> blocks
3. Parse each JSON-LD block; classify by @type (Product, Offer, BreadcrumbList, ItemList, FAQPage, Organization, WebSite)
4. Record: canonical URL, og:title, og:image, og:type, og:description

### Phase 2: JSON-LD Validation

Run these checks and record issues:

PRODUCT pages:
- [ ] Has @type=Product in JSON-LD? (critical if missing)
- [ ] Product.name is non-empty and matches page title?
- [ ] Product.offers exists and has @type=Offer? (critical if missing)
- [ ] Offer.price matches visible price on page?
- [ ] Offer.priceCurrency is present?
- [ ] Offer.availability is present? (InStock/OutOfStock/PreOrder)
- [ ] Product.brand exists?
- [ ] Product.description is >50 chars and non-trivial?
- [ ] Product.image or og:image exists?
- [ ] Product.sku or Product.gtin exists?

COLLECTION pages:
- [ ] Has ItemList JSON-LD? (high if missing)
- [ ] Has BreadcrumbList JSON-LD? (medium if missing)
- [ ] ItemList.itemListElement contains product URLs and names?

POLICY pages:
- [ ] Has FAQPage JSON-LD? (high if missing)
- [ ] Key policy facts extractable from visible text? (shipping cost, timeline, regions)

HOMEPAGE:
- [ ] Has WebSite or Organization JSON-LD?
- [ ] Has SearchAction in WebSite schema?

### Phase 3: Checkout Handoff Verification

Using browser navigation (if interactive mode available) or by tracing link chains:

1. Navigate to a product page with variants
2. Note the default variant price
3. If variant selector exists, note variant options
4. Trace the "Add to Cart" button/form action
5. Navigate to /cart and verify:
   - Cart shows correct product name, variant, quantity, price
   - Discount code input exists and is visible
   - Checkout button/link exists
6. If possible, click checkout button and capture redirect URL
   - DO NOT enter any payment information
   - Only verify the redirect target URL

Record:
```json
{
  "success": true/false,
  "cartUrl": "/cart",
  "checkoutRedirectUrl": "captured redirect URL or 'not reached'",
  "cartState": { "items": N, "subtotal": "price", "currency": "USD" },
  "discountApplied": false,
  "discountCode": "",
  "discountResult": "",
  "warnings": ["list any issues found"]
}
```

### Phase 4: Generate Issues

For each gap found in Phase 2 or 3, produce an issue record:

```json
{
  "id": "ACR-XXX (sequential)",
  "severity": "critical|high|medium|low",
  "category": "discoverability|checkout|trust|content|mobile",
  "page": "relative URL",
  "signal": "What was observed that indicates a problem",
  "title": "Short human-readable title",
  "businessImpact": "Why this matters for AI shopping agents",
  "fix": "Concrete, actionable fix instruction",
  "effort": "S|M|L",
  "evidence": {
    "screenshots": ["screenshot paths"],
    "jsonldSnippet": { "relevant JSON-LD excerpt or null": "..." },
    "domSelectors": ["relevant CSS selectors"]
  }
}
```

### Phase 5: Generate Run Plan

Based on findings, produce a 5-step run plan:

```json
[
  { "step": 1, "task": "Capture all target pages in desktop+mobile viewports", "pages": [...], "collect": [...] },
  { "step": 2, "task": "Extract JSON-LD, OG metadata, visible text per page", "pages": [...], "collect": [...] },
  { "step": 3, "task": "Validate JSON-LD against schema rules, flag gaps", "validate": [...] },
  { "step": 4, "task": "Exercise add-to-cart, variant, discount, checkout redirect", "actions": [...] },
  { "step": 5, "task": "Export audit.json, client report, remediation CSV, prompt", "deliverables": [...] }
]
```

### Phase 6: Assemble audit.json

Combine all findings into a single `audit.json` file matching this structure:

```json
{
  "meta": { ... },
  "crawlResults": { "pages": [...], "checkoutHandoff": {...} },
  "issues": [...],
  "runPlan": [...]
}
```

Use the `audit.json` in this project as a template. The dashboard at `index.html` will render it directly.

### Phase 7: Deliverables

Output the following files to the workspace:

1. `audit.json` — Complete audit data file
2. `agentic-commerce-readiness-report.md` — Client-facing Markdown report with scores, evidence summary, and fix recommendations
3. `agentic-commerce-remediation.csv` — CSV with columns: id, severity, category, page, title, businessImpact, fix, effort
4. `openclaw-agentic-commerce-task.txt` — Copy-paste prompt for OpenClaw/Codex to implement fixes

### Boundary (ABSOLUTE)

- ❌ NEVER request, store, or output Shopify Admin API tokens, payment gateway credentials, or private keys
- ❌ NEVER submit payment information or complete a purchase
- ❌ NEVER access admin panels or authenticated pages without explicit permission
- ❌ NEVER store customer PII (names, addresses, emails, phone numbers)
- ✅ ONLY access publicly available storefront pages
- ✅ ONLY test cart/checkout up to the payment step (verify redirect, do not submit)
- ✅ Mark all findings with evidence (URL, selector, screenshot note)
```

---

## Usage

1. Copy the entire code block above
2. Replace `TARGET_STORE_URL` with the actual store URL
3. Paste into an OpenClaw session (webchat, CLI, or cron/agent task)
4. OpenClaw browser agent will execute each phase and produce the deliverables
5. Drop the resulting `audit.json` into the dashboard (`index.html`) to visualize

## Prerequisites

- OpenClaw with `web_fetch` and `web_search` tools enabled
- No API tokens or credentials required
- Internet access for fetching store pages
