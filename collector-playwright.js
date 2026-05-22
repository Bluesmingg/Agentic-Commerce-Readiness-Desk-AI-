#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function parseArgs(argv) {
  const args = {
    url: '',
    urls: '',
    out: 'audit.generated.json',
    maxProducts: 6,
    headless: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--url') {
      args.url = next || '';
      i += 1;
    } else if (arg === '--urls') {
      args.urls = next || '';
      i += 1;
    } else if (arg === '--out') {
      args.out = next || args.out;
      i += 1;
    } else if (arg === '--max-products') {
      args.maxProducts = Math.max(1, Number.parseInt(next || '6', 10) || 6);
      i += 1;
    } else if (arg === '--no-headless') {
      args.headless = false;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Agentic Commerce Playwright collector

Usage:
  node collector-playwright.js --url https://store.example
  node collector-playwright.js --url https://store.example --out audit.generated.json
  node collector-playwright.js --urls urls.txt --max-products 8 --no-headless

Options:
  --url <url>            Storefront base URL.
  --urls <file>          Newline-delimited URL list. Overrides discovery.
  --out <file>           Output audit JSON path. Default: audit.generated.json.
  --max-products <n>     Maximum product URLs to discover. Default: 6.
  --no-headless          Show browser while collecting.
`);
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (error) {
    console.error('Playwright is not installed. Run `npm install` in this project, then retry.');
    console.error('No token, cookie, admin password, or payment data is required.');
    process.exit(1);
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function sameOrigin(base, candidate) {
  try {
    return new URL(base).origin === new URL(candidate).origin;
  } catch {
    return false;
  }
}

function slugForUrl(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90)
    .toLowerCase() || 'page';
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readUrlsFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text
    .split(/\r?\n/)
    .map((line) => normalizeUrl(line.trim()))
    .filter(Boolean);
}

async function collectPage(page, url, pageType, screenshotsDir) {
  const result = {
    url,
    type: pageType,
    status: 0,
    viewport: 'desktop',
    screenshot: '',
    mobileScreenshot: '',
    canonical: '',
    title: '',
    ogTitle: '',
    ogImage: '',
    jsonLd: [],
    visibleTextSample: '',
    domSelectors: {},
    warnings: [],
  };

  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  result.status = response ? response.status() : 0;
  await page.waitForTimeout(1000);

  const desktopShot = path.join(screenshotsDir, `${slugForUrl(url)}-desktop.png`);
  await page.screenshot({ path: desktopShot, fullPage: true });
  result.screenshot = path.relative(process.cwd(), desktopShot).replace(/\\/g, '/');

  Object.assign(result, await extractPageFacts(page));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const mobileShot = path.join(screenshotsDir, `${slugForUrl(url)}-mobile.png`);
  await page.screenshot({ path: mobileShot, fullPage: true });
  result.mobileScreenshot = path.relative(process.cwd(), mobileShot).replace(/\\/g, '/');

  if (!result.jsonLd.length) {
    result.warnings.push('No JSON-LD script found.');
  }
  if (pageType === 'product' && !hasJsonLdType(result.jsonLd, 'Product')) {
    result.warnings.push('Product page does not expose Product JSON-LD.');
  }
  if (!result.canonical) {
    result.warnings.push('Missing canonical link.');
  }

  return result;
}

async function extractPageFacts(page) {
  return page.evaluate(() => {
    const getAttr = (selector, attr) => document.querySelector(selector)?.getAttribute(attr) || '';
    const getMeta = (property) =>
      document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ||
      document.querySelector(`meta[name="${property}"]`)?.getAttribute('content') ||
      '';

    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((node) => {
        const raw = node.textContent || '';
        try {
          return JSON.parse(raw);
        } catch {
          return { parseError: true, raw: raw.slice(0, 1200) };
        }
      });

    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const selectors = {
      addToCartButtons: Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'))
        .map((el) => (el.innerText || el.value || el.getAttribute('aria-label') || '').trim())
        .filter((label) => /add|cart|bag|buy|checkout/i.test(label))
        .slice(0, 12),
      forms: Array.from(document.querySelectorAll('form'))
        .map((form) => ({
          action: form.getAttribute('action') || '',
          method: form.getAttribute('method') || 'get',
          inputs: form.querySelectorAll('input, select, textarea').length,
        }))
        .slice(0, 12),
      links: Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') || '')
        .filter((href) => /cart|checkout|shipping|return|refund|faq|products|collections/i.test(href))
        .slice(0, 24),
    };

    return {
      canonical: getAttr('link[rel="canonical"]', 'href'),
      title: document.title || '',
      ogTitle: getMeta('og:title'),
      ogImage: getMeta('og:image'),
      jsonLd,
      visibleTextSample: text.slice(0, 2500),
      domSelectors: selectors,
    };
  });
}

function hasJsonLdType(jsonLd, type) {
  const wanted = String(type).toLowerCase();
  const stack = [...jsonLd];
  while (stack.length) {
    const value = stack.pop();
    if (!value || typeof value !== 'object') continue;
    const currentType = value['@type'];
    if (typeof currentType === 'string' && currentType.toLowerCase() === wanted) return true;
    if (Array.isArray(currentType) && currentType.map((item) => String(item).toLowerCase()).includes(wanted)) return true;
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) stack.push(...child);
      else if (child && typeof child === 'object') stack.push(child);
    }
  }
  return false;
}

async function discoverUrls(page, baseUrl, maxProducts) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]'), (a) => a.href));
  const origin = new URL(baseUrl).origin;
  const sameSite = [...new Set(links.map(normalizeBrowserUrl).filter(Boolean))]
    .filter((href) => new URL(href).origin === origin);

  const productUrls = sameSite.filter((href) => /\/products?\//i.test(new URL(href).pathname)).slice(0, maxProducts);
  const collectionUrls = sameSite.filter((href) => /\/collections?\//i.test(new URL(href).pathname)).slice(0, 2);
  const policyUrls = sameSite.filter((href) => /shipping|return|refund|privacy|terms|faq|help/i.test(href)).slice(0, 4);
  const cartUrl = new URL('/cart', baseUrl).toString().replace(/\/$/, '');

  return [...new Set([baseUrl, ...collectionUrls, ...productUrls, ...policyUrls, cartUrl])];

  function normalizeBrowserUrl(value) {
    try {
      const url = new URL(value);
      url.hash = '';
      return url.toString().replace(/\/$/, '');
    } catch {
      return '';
    }
  }
}

function guessPageType(url, baseUrl) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname === '/' || normalizeUrl(url) === normalizeUrl(baseUrl)) return 'home';
  if (pathname.includes('/products/')) return 'product';
  if (pathname.includes('/collections/')) return 'collection';
  if (pathname.includes('/cart')) return 'cart';
  if (/shipping|return|refund|privacy|terms|faq|help|polic/.test(pathname)) return 'policy';
  return 'page';
}

async function collectCheckoutHandoff(page, baseUrl, productUrl) {
  const result = {
    tested: false,
    productUrl: productUrl || '',
    addToCartWorked: false,
    cartUrl: new URL('/cart', baseUrl).toString(),
    cartReached: false,
    checkoutUrl: '',
    checkoutReached: false,
    paymentSubmitted: false,
    warnings: [],
  };

  if (!productUrl) {
    result.warnings.push('No product URL found for checkout handoff.');
    return result;
  }

  result.tested = true;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  const clicked = await clickFirstMatching(page, [
    'button[name="add"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'button:has-text("Add to cart")',
    'button:has-text("Add To Cart")',
    'button:has-text("Add to bag")',
    'button:has-text("Buy")',
  ]);

  result.addToCartWorked = clicked;
  if (!clicked) {
    result.warnings.push('No add-to-cart button could be clicked safely.');
  }

  await page.waitForTimeout(1500);
  await page.goto(result.cartUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  result.cartReached = true;
  await page.waitForTimeout(1000);

  const checkoutClicked = await clickFirstMatching(page, [
    'button[name="checkout"]',
    'input[name="checkout"]',
    'a[href*="/checkout"]',
    'button:has-text("Checkout")',
    'button:has-text("Check out")',
  ]);

  if (!checkoutClicked) {
    result.warnings.push('No checkout handoff control was found on cart page.');
    return result;
  }

  await page.waitForTimeout(2500);
  result.checkoutUrl = page.url();
  result.checkoutReached = /checkout/i.test(result.checkoutUrl);
  result.paymentSubmitted = false;
  if (!result.checkoutReached) {
    result.warnings.push('Checkout control clicked, but URL did not include checkout.');
  }

  return result;
}

async function clickFirstMatching(page, selectors) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0 && (await locator.isVisible({ timeout: 1000 }))) {
        await locator.click({ timeout: 3000 });
        return true;
      }
    } catch {
      // Try next candidate.
    }
  }
  return false;
}

function buildIssues(pages, checkoutHandoff) {
  const issues = [];
  let index = 1;
  const addIssue = (severity, category, page, title, signal, businessImpact, fix, effort = 'S') => {
    issues.push({
      id: `ACR-${String(index).padStart(3, '0')}`,
      severity,
      category,
      page,
      signal,
      title,
      businessImpact,
      fix,
      effort,
    });
    index += 1;
  };

  for (const page of pages) {
    if (!page.jsonLd?.length) {
      addIssue('high', 'discoverability', page.url, 'Missing JSON-LD structured data', 'No application/ld+json script found.', 'Shopping agents have less reliable machine-readable product or policy context.', 'Add schema.org JSON-LD for the page type.');
    }
    if (page.type === 'product' && !hasJsonLdType(page.jsonLd || [], 'Product')) {
      addIssue('critical', 'discoverability', page.url, 'Product page lacks Product schema', 'Product JSON-LD was not detected.', 'AI shopping systems may fail to extract product facts, price, and availability.', 'Render Product and Offer JSON-LD with sku, price, currency, availability, image, and URL.');
    }
    if (page.warnings?.length) {
      addIssue('medium', 'content', page.url, 'Collector warnings found', page.warnings.join(' '), 'The page has missing or weak machine-readable signals.', 'Review warnings and repair the page template.', 'M');
    }
  }

  if (checkoutHandoff.tested && !checkoutHandoff.checkoutReached) {
    addIssue('high', 'checkout', checkoutHandoff.cartUrl, 'Checkout handoff could not be verified', checkoutHandoff.warnings.join(' '), 'Buyers and agents may fail to move cleanly from cart to checkout.', 'Fix cart checkout controls and verify redirect behavior.', 'M');
  }

  return issues;
}

async function main() {
  const args = parseArgs(process.argv);
  const baseUrl = normalizeUrl(args.url);
  if (!baseUrl && !args.urls) {
    printHelp();
    process.exit(1);
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: args.headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  const screenshotsDir = path.resolve('evidence', 'screenshots');
  ensureDir(screenshotsDir);

  try {
    const urls = args.urls ? readUrlsFile(args.urls) : await discoverUrls(page, baseUrl, args.maxProducts);
    const scopedUrls = urls.filter((url) => !baseUrl || sameOrigin(baseUrl, url));
    const crawlResults = [];

    for (const url of scopedUrls) {
      const type = guessPageType(url, baseUrl || url);
      console.log(`Collecting ${type}: ${url}`);
      try {
        crawlResults.push(await collectPage(page, url, type, screenshotsDir));
      } catch (error) {
        crawlResults.push({
          url,
          type,
          status: 0,
          jsonLd: [],
          warnings: [`Collection failed: ${error.message}`],
        });
      }
    }

    const productUrl = crawlResults.find((item) => item.type === 'product')?.url || '';
    const checkoutHandoff = await collectCheckoutHandoff(page, baseUrl || scopedUrls[0], productUrl);
    const issues = buildIssues(crawlResults, checkoutHandoff);
    const audit = {
      $schema: './audit-schema.json',
      meta: {
        project: 'Agentic Commerce Readiness collection',
        url: baseUrl || scopedUrls[0],
        platform: 'Shopify',
        generatedAt: new Date().toISOString(),
        collector: 'collector-playwright.js',
        viewportDesktop: '1440x900',
        viewportMobile: '390x844',
      },
      crawlResults: {
        pages: crawlResults,
        checkoutHandoff,
      },
      runPlan: [
        { step: 1, task: 'Collect desktop and mobile screenshots for discovered storefront pages.' },
        { step: 2, task: 'Extract JSON-LD, canonical, Open Graph, title, visible text, and DOM selector signals.' },
        { step: 3, task: 'Attempt add-to-cart, cart page, and checkout handoff without submitting payment.' },
      ],
      issues,
    };

    fs.writeFileSync(args.out, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${args.out}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
