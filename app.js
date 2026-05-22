/* ===== Agentic Commerce Readiness Desk — Enhanced App ===== */

const STORAGE_KEY = 'agentic_commerce_readiness_audit_v2';

// Default empty state
const emptyAudit = {
  meta: { project: '', url: '', platform: 'Shopify', generatedAt: '', collector: '', viewportDesktop: '1440x900', viewportMobile: '390x844' },
  crawlResults: { pages: [], checkoutHandoff: null },
  issues: [],
  runPlan: []
};

// Sample audit with full crawlResults
const sampleAudit = {
  meta: {
    project: 'Northline Supply Shopify audit',
    url: 'https://example-shop.test',
    platform: 'Shopify',
    generatedAt: '2026-05-22T08:00:00Z',
    collector: 'OpenClaw browser agent',
    viewportDesktop: '1440x900',
    viewportMobile: '390x844'
  },
  crawlResults: {
    pages: [
      {
        url: '/products/trail-shell-jacket',
        type: 'product', status: 200, viewport: 'desktop',
        screenshot: 'evidence/screenshots/trail-shell-jacket_desktop.png',
        mobileScreenshot: 'evidence/screenshots/trail-shell-jacket_mobile.png',
        canonical: 'https://example-shop.test/products/trail-shell-jacket',
        title: 'Trail Shell Jacket | Northline Supply',
        ogTitle: 'Trail Shell Jacket - Lightweight Outdoor Layer',
        ogImage: 'https://example-shop.test/cdn/trail-shell-jacket_1200x.jpg',
        ogType: 'product',
        jsonld: [
          { '@type': 'Product', name: 'Trail Shell Jacket', sku: 'NL-TSJ-001', brand: { '@type': 'Brand', name: 'Northline Supply' }, offers: { '@type': 'Offer', price: '189.00', priceCurrency: 'USD', availability: 'https://schema.org/InStock' }, description: 'Lightweight waterproof shell jacket for trail running and hiking.' }
        ],
        jsonldWarnings: ['Offer.price is static — does not update on variant change', 'Missing AggregateOffer for multi-variant product', 'No Review or aggregateRating schema'],
        domExcerpt: { variantSelector: 'select#variant-selector', addToCart: 'button[name="add"]', priceDisplay: '.product__price' },
        visibleText: ['Trail Shell Jacket', '$189.00', 'In Stock', 'Color: Forest Green, Night Black', 'Size: S, M, L, XL', 'Add to Cart']
      },
      {
        url: '/products/canvas-weekender',
        type: 'product', status: 200, viewport: 'desktop',
        screenshot: 'evidence/screenshots/canvas-weekender_desktop.png',
        mobileScreenshot: 'evidence/screenshots/canvas-weekender_mobile.png',
        canonical: 'https://example-shop.test/products/canvas-weekender',
        title: 'Canvas Weekender',
        ogTitle: 'Canvas Weekender',
        jsonld: [{ '@type': 'Product', name: 'Canvas Weekender', offers: { '@type': 'Offer', price: '145.00', priceCurrency: 'USD', availability: 'https://schema.org/InStock' } }],
        jsonldWarnings: ['Product name missing brand prefix', 'description field empty in JSON-LD', 'No dimensions, material, or capacity attributes'],
        domExcerpt: { addToCart: 'button[name="add"]', priceDisplay: '.product__price' },
        visibleText: ['Canvas Weekender', '$145.00', 'In Stock', 'Add to Cart']
      },
      {
        url: '/collections/bags',
        type: 'collection', status: 200, viewport: 'desktop',
        screenshot: 'evidence/screenshots/collection-bags_desktop.png',
        canonical: 'https://example-shop.test/collections/bags',
        title: 'Bags & Backpacks | Northline Supply',
        jsonld: [],
        jsonldWarnings: ['No ItemList schema on collection page', 'No BreadcrumbList schema'],
        domExcerpt: { productCards: '.product-card, .collection-product', productLinks: 'a[href*="/products/"]' },
        visibleText: ['Bags & Backpacks', '6 products', 'Canvas Weekender - $145.00', 'Trail Daypack - $89.00']
      },
      {
        url: '/policies/shipping-policy',
        type: 'policy', status: 200, viewport: 'desktop',
        screenshot: 'evidence/screenshots/shipping-policy_desktop.png',
        canonical: 'https://example-shop.test/policies/shipping-policy',
        title: 'Shipping Policy | Northline Supply',
        jsonld: [],
        jsonldWarnings: ['No FAQPage schema', 'Policy content is prose-only, no structured Q&A'],
        visibleText: ['Shipping Policy', 'Free shipping on orders over $75.', 'Standard shipping takes 5-7 business days.']
      },
      {
        url: '/cart',
        type: 'cart', status: 200, viewport: 'mobile',
        screenshot: 'evidence/screenshots/cart_mobile.png',
        canonical: 'https://example-shop.test/cart',
        title: 'Your Cart | Northline Supply',
        jsonld: [],
        domExcerpt: { discountField: 'input[name="discount"]', checkoutButton: 'button[name="checkout"]', quantityInput: 'input[name*="quantity"]' },
        visibleText: ['Your Cart', 'Trail Shell Jacket - $189.00', 'Subtotal: $189.00', 'Checkout']
      }
    ],
    checkoutHandoff: {
      success: true,
      cartUrl: '/cart',
      checkoutRedirectUrl: '/checkout/abc123',
      cartState: { items: 1, subtotal: '189.00', currency: 'USD' },
      discountApplied: false,
      discountCode: 'WELCOME10',
      discountResult: 'Code applied but discount not reflected in subtotal (possible theme bug)',
      warnings: ['Discount field below fold on mobile', 'No ARIA label on discount input']
    }
  },
  issues: [
    { id: 'ACR-001', severity: 'critical', category: 'checkout', page: '/products/trail-shell-jacket', signal: 'Variant selection changes price visually, but JSON-LD Offer keeps a stale single price.', title: 'Variant price and structured data disagree', businessImpact: 'Shopping agents may quote the wrong price or fail trust checks before sending buyers to checkout.', fix: 'Render per-variant Offer data or update JSON-LD on variant change; include priceCurrency, availability and sku.', effort: 'M', evidence: { screenshots: ['evidence/screenshots/trail-shell-jacket_desktop.png', 'evidence/screenshots/trail-shell-jacket_mobile.png'], jsonldSnippet: { '@type': 'Offer', price: '189.00', note: 'Static — does not change with variant switch ($189→$199)' }, domSelectors: ['.product__price', 'script[type="application/ld+json"]'] } },
    { id: 'ACR-002', severity: 'high', category: 'discoverability', page: '/collections/bags', signal: 'Collection page has product cards, but no ItemList or BreadcrumbList schema.', title: 'Collection page lacks machine-readable product list', businessImpact: 'AI shopping systems have less context for comparing the catalog and grouping products.', fix: 'Add BreadcrumbList and ItemList JSON-LD with product URLs, names, positions and image references.', effort: 'S', evidence: { screenshots: ['evidence/screenshots/collection-bags_desktop.png'], jsonldSnippet: null, domSelectors: ['.product-card', 'script[type="application/ld+json"]'] } },
    { id: 'ACR-003', severity: 'high', category: 'trust', page: '/policies/shipping-policy', signal: 'Shipping thresholds and timelines are visible in prose only; no concise FAQ blocks exist.', title: 'Shipping policy is hard for agents to summarize', businessImpact: 'Agents answering buyer questions may omit delivery windows or free-shipping thresholds.', fix: 'Add short FAQ sections for shipping cost, dispatch time, delivery regions, tracking.', effort: 'S', evidence: { screenshots: ['evidence/screenshots/shipping-policy_desktop.png'], jsonldSnippet: null, domSelectors: ['.policy-content'] } },
    { id: 'ACR-004', severity: 'medium', category: 'discoverability', page: '/products/canvas-weekender', signal: 'Product title omits brand and capacity; description misses dimensions and material details.', title: 'Product facts are underspecified', businessImpact: 'Comparison agents have fewer attributes for buyer matching.', fix: 'Rewrite title and first paragraph with brand, category, material, capacity, dimensions.', effort: 'S', evidence: { screenshots: ['evidence/screenshots/canvas-weekender_desktop.png'], jsonldSnippet: { '@type': 'Product', name: 'Canvas Weekender', note: 'Missing: brand, description, dimensions, material' }, domSelectors: ['.product__title', 'script[type="application/ld+json"]'] } },
    { id: 'ACR-005', severity: 'medium', category: 'checkout', page: '/cart', signal: 'Discount field is below the fold and not announced by a label in mobile viewport.', title: 'Mobile discount field is weakly exposed', businessImpact: 'Users and agents need extra navigation to discover promo code entry.', fix: 'Move discount input near order summary, add explicit label, preserve keyboard focus.', effort: 'M', evidence: { screenshots: ['evidence/screenshots/cart_mobile.png'], jsonldSnippet: null, domSelectors: ['input[name="discount"]', '#discount-code'] } },
    { id: 'ACR-006', severity: 'low', category: 'trust', page: '/pages/about', signal: 'No customer support response-time expectation is stated.', title: 'Support promise is missing', businessImpact: 'Agent recommendations have weaker trust signals for post-purchase questions.', fix: 'Add support hours, response window, contact method and order lookup link.', effort: 'S', evidence: { screenshots: [], jsonldSnippet: null, domSelectors: ['.about-content'] } }
  ],
  runPlan: [
    { step: 1, task: 'Open storefront in desktop (1440×900) and mobile (390×844). Capture homepage, collection, product, cart, checkout and policy pages.', pages: ['/', '/collections/bags', '/products/trail-shell-jacket', '/products/canvas-weekender', '/cart', '/pages/shipping-policy'], collect: ['screenshot', 'canonical', 'title', 'og:title', 'og:image'] },
    { step: 2, task: 'Extract visible product facts, JSON-LD, canonical URLs, Open Graph metadata, price, availability, variants and policy links.', pages: ['/products/trail-shell-jacket', '/products/canvas-weekender'], collect: ['jsonld', 'visibleText', 'domSelectors', 'ogTags'] },
    { step: 3, task: 'Compare DOM content with Product/Offer/Breadcrumb/FAQPage structured data. Flag missing or contradictory fields.', validate: ['Product.name ↔ og:title', 'Offer.price ↔ visible price', 'ItemList exists on collection', 'FAQPage exists on policy pages'] },
    { step: 4, task: 'Exercise add-to-cart, variant selection, cart quantity change, discount entry and checkout redirect. Do NOT enter payment credentials.', actions: ['select variant', 'click add-to-cart', 'change quantity', 'enter discount WELCOME10', 'click checkout → verify redirect URL'] },
    { step: 5, task: 'Export screenshots, issue evidence, remediation CSV and copy-paste OpenClaw/Codex implementation prompt.', deliverables: ['audit.json', 'client report .md', 'remediation .csv', 'OpenClaw task .txt'] }
  ]
};

// ===== State =====
let audit = loadAudit();
let selectedIssueId = null;
let activeEvidenceTab = 'jsonld';
let hasData = audit.issues.length > 0;

// ===== DOM refs =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  storeUrl: $('#storeUrl'), storeType: $('#storeType'),
  loadSample: $('#loadSample'), clearLocal: $('#clearLocal'),
  auditFile: $('#auditFile'), emptyAuditFile: $('#emptyAuditFile'),
  exportReport: $('#exportReport'), exportFixCsv: $('#exportFixCsv'),
  exportPrompt: $('#exportPrompt'), exportAuditJson: $('#exportAuditJson'),
  severityFilter: $('#severityFilter'), auditStatus: $('#auditStatus'),
  overallScore: $('#overallScore'), discoverabilityScore: $('#discoverabilityScore'),
  checkoutScore: $('#checkoutScore'), trustScore: $('#trustScore'),
  overallLabel: $('#overallLabel'), issueList: $('#issueList'),
  detailTitle: $('#detailTitle'), detailSeverity: $('#detailSeverity'),
  detailPage: $('#detailPage'), detailSignal: $('#detailSignal'),
  detailImpact: $('#detailImpact'), detailFix: $('#detailFix'), detailEffort: $('#detailEffort'),
  runPlan: $('#runPlan'), promptDraft: $('#promptDraft'), copyPrompt: $('#copyPrompt'),
  jsonldViewer: $('#jsonldViewer'), screenshotGrid: $('#screenshotGrid'),
  domList: $('#domList'), noEvidence: $('#noEvidence'),
  checkoutSection: $('#checkoutSection'), checkoutStatusBadge: $('#checkoutStatusBadge'),
  checkoutCartUrl: $('#checkoutCartUrl'), checkoutRedirectUrl: $('#checkoutRedirectUrl'),
  checkoutItems: $('#checkoutItems'), checkoutSubtotal: $('#checkoutSubtotal'),
  checkoutDiscount: $('#checkoutDiscount'), checkoutDiscountResult: $('#checkoutDiscountResult'),
  checkoutWarnings: $('#checkoutWarnings'),
  pagesSection: $('#pagesSection'), pagesCount: $('#pagesCount'),
  pagesTableBody: $('#pagesTableBody'),
  crawlSummaryPanel: $('#crawlSummaryPanel'), crawlStats: $('#crawlStats'),
  emptyOverlay: $('#emptyOverlay')
};

// ===== Persistence =====
function loadAudit() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate basic structure
      if (parsed.meta && Array.isArray(parsed.issues)) return parsed;
    }
  } catch (e) { /* ignore corrupt data */ }
  return structuredClone(emptyAudit);
}

function saveAudit() { localStorage.setItem(STORAGE_KEY, JSON.stringify(audit)); }

async function loadAuditFromUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('audit');
  if (!source) return false;

  const allowList = {
    generated: 'audit.generated.json',
    sample: 'audit.json'
  };
  const fileName = allowList[source] || source;
  if (!/^[a-zA-Z0-9._-]+\.json$/.test(fileName)) {
    alert('Invalid audit query parameter.');
    return false;
  }

  try {
    const response = await fetch(fileName, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.meta || !Array.isArray(data.issues)) {
      throw new Error('Expected { meta, issues, crawlResults?, runPlan? }');
    }
    audit = data;
    selectedIssueId = audit.issues[0]?.id || null;
    hasData = true;
    saveAudit();
    render();
    return true;
  } catch (error) {
    alert(`Failed to load ${fileName}: ${error.message}`);
    return false;
  }
}

// ===== Scoring =====
function severityWeight(sev) {
  return { critical: 14, high: 9, medium: 5, low: 2 }[sev] || 1;
}

function scoreForCategory(categories) {
  const penalty = audit.issues
    .filter(i => categories.includes(i.category))
    .reduce((sum, i) => sum + severityWeight(i.severity), 0);
  return Math.max(0, Math.round(100 - penalty));
}

function scoreLabel(score) {
  if (!hasData) return 'No data';
  if (score >= 86) return 'Ready to monitor';
  if (score >= 72) return 'Fix shortlist';
  if (score >= 55) return 'Sprint needed';
  return 'High risk';
}

function renderScores() {
  if (!hasData) {
    els.overallScore.textContent = '-'; els.discoverabilityScore.textContent = '-';
    els.checkoutScore.textContent = '-'; els.trustScore.textContent = '-';
    els.overallLabel.textContent = 'No data';
    return;
  }
  const penalty = audit.issues.reduce((sum, i) => sum + severityWeight(i.severity), 0);
  const overall = Math.max(0, Math.round(100 - penalty));
  els.overallScore.textContent = overall;
  els.discoverabilityScore.textContent = scoreForCategory(['discoverability', 'content']);
  els.checkoutScore.textContent = scoreForCategory(['checkout', 'mobile']);
  els.trustScore.textContent = scoreForCategory(['trust']);
  els.overallLabel.textContent = scoreLabel(overall);
}

// ===== Issues =====
function renderIssues() {
  if (!hasData) {
    els.issueList.innerHTML = '<p class="empty-state">Load sample data or an audit.json file.</p>';
    return;
  }
  const filter = els.severityFilter.value;
  const issues = audit.issues.filter(i => filter === 'all' || i.severity === filter);
  els.issueList.innerHTML = '';
  if (!issues.length) {
    els.issueList.innerHTML = '<p class="empty-state">No issues match this filter.</p>';
    return;
  }
  issues.forEach(issue => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'issue-button';
    btn.setAttribute('aria-current', String(issue.id === selectedIssueId));
    btn.innerHTML = `<div class="issue-meta"><span class="severity ${issue.severity}">${esc(issue.severity)}</span><span>${esc(issue.category)}</span><span>${esc(issue.effort)}</span></div><strong>${esc(issue.title)}</strong><span>${esc(issue.page)}</span>`;
    btn.addEventListener('click', () => { selectedIssueId = issue.id; render(); });
    els.issueList.appendChild(btn);
  });
}

// ===== Detail =====
function renderDetail() {
  const issue = audit.issues.find(i => i.id === selectedIssueId);
  if (!issue) {
    els.detailTitle.textContent = 'Select an issue';
    els.detailSeverity.textContent = '-'; els.detailSeverity.className = 'mini-badge';
    els.detailPage.textContent = '-'; els.detailSignal.textContent = '-';
    els.detailImpact.textContent = '-'; els.detailFix.textContent = '-'; els.detailEffort.textContent = '-';
    clearEvidence();
    return;
  }
  els.detailTitle.textContent = issue.title;
  els.detailSeverity.textContent = issue.severity;
  els.detailSeverity.className = `mini-badge severity ${issue.severity}`;
  els.detailPage.textContent = issue.page;
  els.detailSignal.textContent = issue.signal;
  els.detailImpact.textContent = issue.businessImpact;
  els.detailFix.textContent = issue.fix;
  els.detailEffort.textContent = issue.effort;
  renderEvidence(issue);
}

// ===== Evidence Tabs =====
function clearEvidence() {
  els.jsonldViewer.hidden = true; els.screenshotGrid.hidden = true;
  els.domList.hidden = true; els.noEvidence.hidden = true;
  els.jsonldViewer.innerHTML = ''; els.screenshotGrid.innerHTML = ''; els.domList.innerHTML = '';
}

function renderEvidence(issue) {
  const ev = issue.evidence || {};
  const hasJsonld = ev.jsonldSnippet && Object.keys(ev.jsonldSnippet).length > 0;
  const hasScreenshots = ev.screenshots && ev.screenshots.length > 0;
  const hasDom = ev.domSelectors && ev.domSelectors.length > 0;
  const anyEvidence = hasJsonld || hasScreenshots || hasDom;

  // JSON-LD
  if (hasJsonld) {
    els.jsonldViewer.hidden = false;
    els.jsonldViewer.innerHTML = highlightJson(JSON.stringify(ev.jsonldSnippet, null, 2));
  } else {
    els.jsonldViewer.hidden = true;
    els.jsonldViewer.innerHTML = '';
  }

  // Screenshots
  if (hasScreenshots) {
    els.screenshotGrid.hidden = false;
    els.screenshotGrid.innerHTML = ev.screenshots.map(s => {
      const label = s.includes('mobile') ? '📱 Mobile' : '🖥️ Desktop';
      return `<div class="screenshot-placeholder"><span class="icon">${label.includes('Mobile') ? '📱' : '🖥️'}</span><span class="label">${label}</span><span>${esc(s)}</span></div>`;
    }).join('');
  } else {
    els.screenshotGrid.hidden = true;
    els.screenshotGrid.innerHTML = '';
  }

  // DOM selectors
  if (hasDom) {
    els.domList.hidden = false;
    els.domList.innerHTML = ev.domSelectors.map(s => `<div class="dom-item"><code>${esc(s)}</code></div>`).join('');
  } else {
    els.domList.hidden = true;
    els.domList.innerHTML = '';
  }

  // No evidence state
  els.noEvidence.hidden = anyEvidence;

  // Show active tab
  switchTab(activeEvidenceTab);
}

function switchTab(tab) {
  activeEvidenceTab = tab;
  $$('.evidence-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  els.jsonldViewer.hidden = tab !== 'jsonld';
  els.screenshotGrid.hidden = tab !== 'screenshots';
  els.domList.hidden = tab !== 'dom';
  // Only show no-evidence if the active tab has no content
  if (tab === 'jsonld') els.noEvidence.hidden = !els.jsonldViewer.innerHTML;
  else if (tab === 'screenshots') els.noEvidence.hidden = !els.screenshotGrid.innerHTML;
  else els.noEvidence.hidden = !els.domList.innerHTML;
}

// ===== JSON Syntax Highlight =====
function highlightJson(json) {
  return json.replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) { cls = 'key'; return `<span class="key">${match.slice(0, -1)}</span>:`; }
      cls = 'string';
    } else if (/true|false/.test(match)) cls = 'boolean';
    else if (/null/.test(match)) cls = 'null';
    return `<span class="${cls}">${match}</span>`;
  });
}

// ===== Checkout Handoff =====
function renderCheckout() {
  const ho = audit.crawlResults && audit.crawlResults.checkoutHandoff;
  if (!ho) {
    els.checkoutSection.hidden = true;
    return;
  }
  els.checkoutSection.hidden = false;
  els.checkoutStatusBadge.textContent = ho.success ? '✅ Passed' : '❌ Failed';
  els.checkoutStatusBadge.className = `mini-badge ${ho.success ? 'success-badge' : 'fail-badge'}`;
  els.checkoutCartUrl.textContent = ho.cartUrl || '-';
  els.checkoutRedirectUrl.textContent = ho.checkoutRedirectUrl || '-';
  els.checkoutItems.textContent = ho.cartState ? ho.cartState.items : '-';
  els.checkoutSubtotal.textContent = ho.cartState ? `${ho.cartState.subtotal} ${ho.cartState.currency || ''}` : '-';
  els.checkoutDiscount.innerHTML = ho.discountApplied
    ? `<span class="success">Yes (${esc(ho.discountCode || '')})</span>`
    : `<span class="fail">No</span>`;
  els.checkoutDiscountResult.textContent = ho.discountResult || '-';

  if (ho.warnings && ho.warnings.length > 0) {
    els.checkoutWarnings.innerHTML = ho.warnings.map(w => `<div class="checkout-warning">⚠ ${esc(w)}</div>`).join('');
    els.checkoutWarnings.hidden = false;
  } else {
    els.checkoutWarnings.hidden = true;
  }
}

// ===== Pages Table =====
function renderPagesTable() {
  const pages = audit.crawlResults && audit.crawlResults.pages;
  if (!pages || pages.length === 0) {
    els.pagesSection.hidden = true;
    return;
  }
  els.pagesSection.hidden = false;
  els.pagesCount.textContent = `${pages.length} pages`;

  els.pagesTableBody.innerHTML = pages.map(p => {
    const jsonldCount = p.jsonld ? p.jsonld.filter(j => j['@type']).length : 0;
    const warnings = p.jsonldWarnings || [];
    const hasDesktop = p.screenshot ? '✅' : '—';
    const hasMobile = p.mobileScreenshot ? '✅' : '—';
    const warningHtml = warnings.length > 0
      ? warnings.map(w => `<span class="warning-dot" title="${esc(w)}"></span>`).join('')
      : '—';
    return `<tr>
      <td class="url-cell" title="${esc(p.url)}">${esc(p.url)}</td>
      <td><span class="type-badge ${esc(p.type)}">${esc(p.type)}</span></td>
      <td><span class="status-ok">${p.status}</span></td>
      <td>${jsonldCount > 0 ? jsonldCount + ' types' : '—'}</td>
      <td>${hasDesktop} ${hasMobile !== '—' ? hasMobile : ''}</td>
      <td>${warningHtml}</td>
    </tr>`;
  }).join('');
}

// ===== Crawl Summary =====
function renderCrawlSummary() {
  const pages = audit.crawlResults && audit.crawlResults.pages;
  if (!pages || pages.length === 0) {
    els.crawlSummaryPanel.hidden = true;
    return;
  }
  els.crawlSummaryPanel.hidden = false;
  const totalPages = pages.length;
  const pageTypes = {};
  pages.forEach(p => { pageTypes[p.type] = (pageTypes[p.type] || 0) + 1; });
  const jsonldPages = pages.filter(p => p.jsonld && p.jsonld.some(j => j['@type'])).length;
  const warningPages = pages.filter(p => p.jsonldWarnings && p.jsonldWarnings.length > 0).length;

  els.crawlStats.innerHTML = `
    <div class="crawl-stat">Pages: <strong>${totalPages}</strong></div>
    <div class="crawl-stat">With JSON-LD: <strong>${jsonldPages}</strong></div>
    <div class="crawl-stat">With warnings: <strong>${warningPages}</strong></div>
    <div class="crawl-stat">Types: <strong>${Object.keys(pageTypes).join(', ')}</strong></div>
  `;
}

// ===== Run Plan =====
function renderRunPlan() {
  if (!hasData || !audit.runPlan || audit.runPlan.length === 0) {
    els.runPlan.innerHTML = '<li class="empty-state">Load data to generate a run plan.</li>';
    return;
  }
  els.runPlan.innerHTML = audit.runPlan.map(item => {
    let text = item.task || item;
    return `<li>${esc(text)}</li>`;
  }).join('');
}

// ===== Prompt =====
function buildPrompt() {
  if (!hasData) return '';
  const topIssues = audit.issues
    .slice().sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
    .slice(0, 5)
    .map(i => `- ${i.id} [${i.severity}] ${i.page}: ${i.title}. Fix: ${i.fix}`)
    .join('\n');

  const pagesList = (audit.crawlResults?.pages || [])
    .map(p => `  - ${p.url} (${p.type}, status ${p.status})`)
    .join('\n');

  let planSteps = '';
  if (audit.runPlan && audit.runPlan.length > 0) {
    planSteps = audit.runPlan.map((item, idx) => {
      let lines = [`${idx + 1}. ${item.task || item}`];
      if (item.pages) lines.push(`   Pages: ${item.pages.join(', ')}`);
      if (item.collect) lines.push(`   Collect: ${item.collect.join(', ')}`);
      if (item.validate) lines.push(`   Validate: ${item.validate.join(', ')}`);
      if (item.actions) lines.push(`   Actions: ${item.actions.join(', ')}`);
      return lines.join('\n');
    }).join('\n');
  }

  return `Use OpenClaw browser + Codex to run an Agentic Commerce Readiness Sprint.

Store URL: ${audit.meta.url}
Platform: ${audit.meta.platform}
Do not ask for, print, or store tokens, cookies, private keys, payment data, or admin credentials.

Goal:
Verify whether this storefront can be reliably understood by AI shopping/search agents and whether the purchase path is stable enough for referral traffic.

Pages to crawl:
${pagesList || '  (add pages via audit.json)'}

Browser tasks:
${planSteps || '  (generate from audit.json runPlan)'}

Priority fixes to implement or write exact developer tasks for:
${topIssues || '  (no issues found)'}

Deliverables:
- Client-readable Markdown report with scores, evidence, and prioritized fixes.
- CSV remediation backlog with severity, page, owner, effort, and acceptance criteria.
- If code is accessible, a minimal patch for schema, product content, policy FAQ, and checkout/cart issues.
- audit.json file compatible with the Agentic Commerce Readiness Desk dashboard.

Acceptance:
- No external API token required.
- No checkout payment submission.
- Evidence is concrete: URL, viewport, selector or screenshot note, and expected behavior.
- Final summary lists files changed, tests run, and residual risks.`;
}

function renderPrompt() {
  els.promptDraft.value = buildPrompt();
}

// ===== Meta =====
function renderMeta() {
  els.storeUrl.value = audit.meta.url || '';
  els.storeType.value = audit.meta.platform || 'Shopify';
  if (hasData) {
    els.auditStatus.textContent = `${audit.issues.length} issues · ${(audit.crawlResults?.pages || []).length} pages crawled`;
  } else {
    els.auditStatus.textContent = 'No data loaded';
  }
}

// ===== Empty Overlay =====
function updateOverlay() {
  if (hasData) {
    els.emptyOverlay.classList.remove('visible');
  }
}

// ===== Full Render =====
function render() {
  hasData = audit.issues.length > 0 || (audit.crawlResults?.pages?.length > 0);
  if (!hasData) {
    selectedIssueId = null;
    els.emptyOverlay.classList.add('visible');
    renderMeta(); renderScores(); renderIssues(); renderDetail();
    renderCheckout(); renderPagesTable(); renderCrawlSummary();
    renderRunPlan(); renderPrompt();
    return;
  }
  els.emptyOverlay.classList.remove('visible');
  if (!selectedIssueId && audit.issues.length > 0) selectedIssueId = audit.issues[0].id;
  renderMeta(); renderScores(); renderIssues(); renderDetail();
  renderCheckout(); renderPagesTable(); renderCrawlSummary();
  renderRunPlan(); renderPrompt();
}

// ===== Helpers =====
function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

// ===== Export Functions =====
function buildMarkdownReport() {
  const overall = els.overallScore.textContent;
  const rows = audit.issues.map(i =>
    `| ${i.id} | ${i.severity} | ${i.category} | ${i.page} | ${i.title} | ${i.effort} |`
  ).join('\n');

  let pagesSection = '';
  if (audit.crawlResults?.pages?.length > 0) {
    pagesSection = '\n## Crawled Pages\n\n| URL | Type | Status | JSON-LD Types | Screenshots | Warnings |\n| --- | --- | --- | --- | --- | --- |\n' +
      audit.crawlResults.pages.map(p => {
        const jsonldCount = p.jsonld ? p.jsonld.filter(j => j['@type']).length : 0;
        const warnings = (p.jsonldWarnings || []).join('; ') || '—';
        const screenshots = [p.screenshot, p.mobileScreenshot].filter(Boolean).join(', ') || '—';
        return `| ${p.url} | ${p.type} | ${p.status} | ${jsonldCount} | ${screenshots} | ${warnings} |`;
      }).join('\n');
  }

  return `# Agentic Commerce Readiness Report

Store: ${audit.meta.url}
Platform: ${audit.meta.platform}
Overall score: ${overall}

## Summary

This audit checks whether product, policy, collection, cart and checkout surfaces are clear enough for AI shopping/search agents and stable enough for human buyers.

## Issue backlog

| ID | Severity | Category | Page | Issue | Effort |
| --- | --- | --- | --- | --- | --- |
${rows}
${pagesSection}
## OpenClaw browser evidence

${(audit.runPlan || []).map((item, idx) => `${idx + 1}. ${item.task || item}`).join('\n')}

## Boundary

No tokens, private admin credentials or payment data are required for this audit. This report does not guarantee search rankings, impressions or order volume.`;
}

function buildCsv() {
  const header = ['id', 'severity', 'category', 'page', 'title', 'businessImpact', 'fix', 'effort'];
  const rows = audit.issues.map(i => header.map(k => `"${String(i[k] || '').replace(/"/g, '""')}"`).join(','));
  return [header.join(','), ...rows].join('\n');
}

// ===== Event Bindings =====
els.loadSample.addEventListener('click', () => {
  audit = structuredClone(sampleAudit);
  selectedIssueId = audit.issues[0]?.id || null;
  hasData = true;
  saveAudit();
  render();
});

els.clearLocal.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  audit = structuredClone(emptyAudit);
  selectedIssueId = null;
  hasData = false;
  render();
});

function handleAuditFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.meta && Array.isArray(data.issues)) {
        audit = data;
        selectedIssueId = audit.issues[0]?.id || null;
        hasData = true;
        saveAudit();
        render();
      } else {
        alert('Invalid audit.json format. Expected { meta, issues, crawlResults?, runPlan? }');
      }
    } catch (err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

els.auditFile.addEventListener('change', () => handleAuditFile(els.auditFile.files[0]));
els.emptyAuditFile.addEventListener('change', () => {
  handleAuditFile(els.emptyAuditFile.files[0]);
  els.emptyAuditFile.value = '';
});

els.storeUrl.addEventListener('change', () => {
  audit.meta.url = els.storeUrl.value.trim() || '';
  saveAudit();
  renderPrompt();
});
els.storeType.addEventListener('change', () => {
  audit.meta.platform = els.storeType.value;
  saveAudit();
  renderPrompt();
});
els.severityFilter.addEventListener('change', renderIssues);

// Evidence tabs
$$('.evidence-tabs button').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Exports
els.exportReport.addEventListener('click', () => downloadFile('agentic-commerce-readiness-report.md', buildMarkdownReport(), 'text/markdown'));
els.exportFixCsv.addEventListener('click', () => downloadFile('agentic-commerce-remediation.csv', buildCsv(), 'text/csv'));
els.exportPrompt.addEventListener('click', () => downloadFile('openclaw-agentic-commerce-task.txt', buildPrompt(), 'text/plain'));
els.exportAuditJson.addEventListener('click', () => downloadFile('audit.json', JSON.stringify(audit, null, 2), 'application/json'));

// Copy prompt
els.copyPrompt.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(buildPrompt());
    els.copyPrompt.textContent = '✅ Copied!';
    setTimeout(() => { els.copyPrompt.textContent = '📋 Copy'; }, 2000);
  } catch {
    els.promptDraft.select();
    document.execCommand('copy');
    els.copyPrompt.textContent = '✅ Copied!';
    setTimeout(() => { els.copyPrompt.textContent = '📋 Copy'; }, 2000);
  }
});

// Empty overlay button
$('#emptyLoadSample').addEventListener('click', () => {
  audit = structuredClone(sampleAudit);
  selectedIssueId = audit.issues[0]?.id;
  hasData = true;
  saveAudit();
  render();
});

// ===== Init =====
if (hasData) {
  selectedIssueId = audit.issues[0]?.id || null;
  updateOverlay();
}
render();
loadAuditFromUrlParam();
