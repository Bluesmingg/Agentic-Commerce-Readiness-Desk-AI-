# Agentic Commerce Readiness Desk

A local audit workspace and Playwright collector for checking whether Shopify and DTC storefronts are readable, comparable, and verifiable by AI shopping agents.

The project focuses on storefront signals that matter when buyers use ChatGPT, Gemini, Google AI Mode, Perplexity, or other shopping agents to discover and compare products:

- Product, Offer, ItemList, Breadcrumb, and FAQ structured data
- Visible product facts, price, availability, variants, and SKU consistency
- Shipping, returns, warranty, FAQ, and support policy readability
- Cart, discount, mobile purchase path, and checkout handoff behavior
- Evidence-backed remediation tasks for frontend teams and AI coding agents

It does not require Shopify Admin access, private tokens, customer data, or payment credentials.

## What It Includes

| Capability | Purpose |
| --- | --- |
| Bilingual static dashboard | Review readiness scores, findings, evidence, crawled pages, and checkout status in Chinese or English |
| `audit.json` contract | Shared data format consumed by the dashboard and produced by collectors |
| Playwright collector | Crawl public storefront pages and generate `audit.generated.json` |
| Evidence capture | Save desktop and mobile screenshots under `evidence/screenshots/` |
| Report export | Export a client-facing Markdown report |
| CSV export | Export a prioritized remediation backlog |
| Prompt export | Generate OpenClaw/Codex task prompts for implementation work |

## Service Positioning

This is best packaged as a service-led audit or implementation sprint, not as a ranking guarantee.

Suggested offers:

| Offer | Scope | Suggested price |
| --- | --- | --- |
| Starter Audit | 5-8 URLs, report, CSV backlog, evidence review | USD 300-800 |
| Readiness Sprint | 15-40 URLs plus lightweight frontend/schema fixes | USD 1,500-4,000 |
| Monitoring | Monthly recrawl, change report, new issue list | USD 300-1,200/month |

## Quick Start

Install dependencies:

```powershell
npm install
npx playwright install chromium
```

Run the demo dashboard with the sample audit:

```powershell
node dev-server.js 8099
```

Open:

```text
http://127.0.0.1:8099/
```

Run a real public storefront crawl:

```powershell
npm run collect -- --url https://www.deathwishcoffee.com --out audit.generated.json --max-products 2
```

Run the full local service workflow for one storefront:

```powershell
npm run audit:store -- --url https://bigbarker.com --max-products 2
```

This creates a local ignored client folder under `clients/` with:

- `audit.generated.json`
- `client-report.md`
- `remediation.csv`
- `openclaw-task.txt`
- `RUN_RECORD.md`

It also copies the latest audit to the dashboard input file, so the run can be opened at:

```text
http://127.0.0.1:8099/?audit=generated
```

Load the generated audit into the dashboard:

```text
http://127.0.0.1:8099/?audit=generated
```

If automatic URL discovery misses important pages, provide an explicit URL list:

```powershell
npm run collect -- --urls urls.txt --out audit.generated.json
```

## Collector Behavior

The collector:

- Opens a public storefront URL without logging in.
- Discovers homepage, collection, product, policy, and cart pages.
- Captures desktop and mobile screenshots.
- Extracts JSON-LD, canonical URL, Open Graph metadata, page title, visible text excerpts, and basic DOM selectors.
- Attempts add-to-cart, drawer/cart review, and checkout handoff.
- Does not enter payment details or submit payment.
- Writes a dashboard-compatible audit file.

## Smoke Test

The collector has been smoke-tested against:

```text
https://www.deathwishcoffee.com
https://bigbarker.com
```

Result:

- Output: `audit.generated.json`
- Death Wish Coffee: pages collected: 7; screenshots generated: 14; issues generated: 1
- Big Barker: pages collected: 9; checkout handoff verified from the post-add-to-cart drawer

Generated client evidence is intentionally excluded from Git by default.

## Repository Files

| File | Description |
| --- | --- |
| `index.html` | Dashboard shell |
| `styles.css` | Dashboard styles |
| `app.js` | Dashboard state, scoring, rendering, imports, and exports |
| `collector-playwright.js` | Public storefront crawler and audit generator |
| `scripts/run-store-audit.js` | One-command local workflow runner for client audit records |
| `audit.json` | Sample audit data for demo usage |
| `audit-schema.json` | Audit data contract |
| `dev-server.js` | Lightweight local static server |
| `openclaw-run.md` | OpenClaw execution notes |
| `collector-template.md` | Collector design notes and upgrade path |
| `SELLING.md` | Service positioning, pricing, and outreach notes |
| `CLIENT_INTAKE.md` | Client intake form |
| `ACCEPTANCE_CHECKLIST.md` | Delivery and QA checklist |
| `sample-deliverables/` | Example client-facing report |
| `evidence/` | Screenshot evidence folder placeholder |

## Data Flow

```text
Public storefront
  -> Playwright collector
  -> audit.generated.json
  -> dashboard
  -> report / CSV / implementation prompt
```

## Privacy And Safety

- No Shopify Admin token is needed for the default audit flow.
- No payment data is requested.
- No customer PII is required.
- Checkout testing stops at handoff verification.
- `audit.generated.json`, screenshots, logs, and `node_modules/` are ignored by Git.
- Per-client generated audit folders under `clients/` are ignored by Git.
- The audit does not guarantee AI search rankings, impressions, or order volume.

## Known Limitations

- Shopify themes and app-injected carts vary widely; some stores may need custom selectors.
- SPA, Hydrogen, or dynamic navigation sites may need explicit `--urls` input.
- The screenshot panel currently works as evidence references, not a full image gallery.
- A human reviewer should still validate severity, business impact, and remediation priority before client delivery.
