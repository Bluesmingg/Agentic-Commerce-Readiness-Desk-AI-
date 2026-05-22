# Acceptance Checklist - Agentic Commerce Readiness Desk

## Dashboard QA

- [ ] `index.html` can load through the local dev server without console errors.
- [ ] The sample audit loads successfully.
- [ ] `?audit=generated` loads `audit.generated.json` when present.
- [ ] Desktop layout works above 1080px.
- [ ] Tablet layout works from 640px to 1080px.
- [ ] Mobile layout works below 640px.
- [ ] Overall score and category scores render.
- [ ] Issue list renders and can be filtered by severity.
- [ ] Issue detail panel shows page, signal, impact, fix, and effort.
- [ ] JSON-LD evidence tab renders.
- [ ] Screenshot evidence tab renders evidence references.
- [ ] DOM selector evidence tab renders.
- [ ] Checkout handoff panel renders cart URL, redirect URL, item count, subtotal, discount, and warnings.
- [ ] Crawled pages table renders URL, type, status, JSON-LD count, screenshots, and warnings.
- [ ] OpenClaw run plan renders.
- [ ] Implementation prompt renders.
- [ ] Markdown report export works.
- [ ] CSV backlog export works.
- [ ] OpenClaw task export works.
- [ ] Audit JSON export works.
- [ ] Local storage clear resets the dashboard to empty state.
- [ ] The tool does not request tokens, cookies, admin credentials, payment data, or customer PII.

## Collector QA

- [ ] `npm install` succeeds.
- [ ] `npx playwright install chromium` succeeds.
- [ ] `node --check collector-playwright.js` passes.
- [ ] Collector can run against at least one public storefront.
- [ ] Collector writes valid JSON to `audit.generated.json`.
- [ ] Generated audit includes `meta`, `crawlResults`, `issues`, and `runPlan`.
- [ ] Screenshots are written under `evidence/screenshots/`.
- [ ] Product, collection, policy, cart, and checkout handoff pages are represented where available.
- [ ] Checkout testing stops before payment entry or payment submission.
- [ ] A human reviewer has checked severity, impact, and remediation text before client delivery.

## Client Delivery QA

- [ ] Report lists store URL, checked URLs, date, platform, and scope.
- [ ] Each finding includes severity, page, signal, business impact, fix, and effort.
- [ ] Evidence includes screenshots, JSON-LD excerpts, DOM selectors, or browser actions.
- [ ] Recommendations can be translated into frontend tasks.
- [ ] Boundaries are explicit: no ranking guarantee, no payment submission, no legal/compliance replacement.
- [ ] Generated client evidence is not committed to the public repository.

## Repository QA

- [ ] README is readable on GitHub.
- [ ] `.gitignore` excludes `node_modules/`, generated audits, screenshots, and logs.
- [ ] No real client data, private token, cookie, or credential is committed.
- [ ] Sample data is clearly marked as sample/demo data.
- [ ] `package.json` scripts are accurate.
- [ ] Documentation explains how to run the dashboard and collector.
