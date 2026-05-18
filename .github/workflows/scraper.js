// ============================================================
// SURUS SHARK BOT — Platform Scraper
// Runs via GitHub Actions every 30 min
// Uses Playwright to search each platform and extract listings
// ============================================================

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Industrial keywords to search for on each platform
const SEARCH_QUERIES = [
  'kuka robot',
  'cnc machining center',
  'injection molding',
  'industrial press',
  'packaging line',
  'laser cutting',
  'welding robot',
  'filling line',
  'solar panel line',
  'metal stamping'
];

// Platform configurations
const PLATFORMS = [
  {
    id: 'surplex',
    name: 'Surplex',
    url: 'https://www.surplex.com/en/search',
    search: async (page, query) => {
      await page.goto('https://www.surplex.com/en', { waitUntil: 'networkidle', timeout: 30000 });
      // Try to find search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill(query);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
      }
      return extractGeneric(page);
    }
  },
  {
    id: 'troostwijk',
    name: 'Troostwijk',
    url: 'https://www.troostwijk.nl/en',
    search: async (page, query) => {
      await page.goto('https://www.troostwijk.nl/en', { waitUntil: 'networkidle', timeout: 30000 });
      // Open search drawer
      const searchBtn = page.locator('[aria-label*="search" i], [aria-label*="zoek" i], button:has(svg)').first();
      if (await searchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchBtn.click();
        await page.waitForTimeout(1000);
      }
      const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="Search"]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill(query);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
      }
      return extractGeneric(page);
    }
  },
  {
    id: 'netbid',
    name: 'NetBid',
    url: 'https://www.netbid.com/en/auctions',
    search: async (page, query) => {
      await page.goto('https://www.netbid.com/en/auctions', { waitUntil: 'networkidle', timeout: 30000 });
      return extractGeneric(page);
    }
  },
  {
    id: 'goindustry',
    name: 'GoIndustry',
    url: 'https://www.goindustry.com/en/auctions',
    search: async (page, query) => {
      await page.goto('https://www.goindustry.com/en/auctions', { waitUntil: 'networkidle', timeout: 30000 });
      return extractGeneric(page);
    }
  },
  {
    id: 'industrial_auctions',
    name: 'Industrial Auctions',
    url: 'https://www.industrial-auctions.com/en/auctions',
    search: async (page, query) => {
      await page.goto('https://www.industrial-auctions.com/en/auctions', { waitUntil: 'networkidle', timeout: 30000 });
      return extractGeneric(page);
    }
  }
];

// ── Generic extraction ──
async function extractGeneric(page) {
  try {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract structured data from the page
    const items = await page.evaluate(() => {
      const results = [];

      // Find all potential listing elements
      const selectors = [
        'article', '[class*="card"]', '[class*="listing"]', '[class*="item"]',
        '[class*="result"]', '[class*="product"]', '[class*="lot"]',
        'a[href*="/lot/"]', 'a[href*="/auction/"]', 'a[href*="/item/"]'
      ];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          // Get all text content
          const text = el.textContent?.trim() || '';
          if (text.length < 20) return;

          // Find title (usually in heading or link)
          const heading = el.querySelector('h1,h2,h3,h4,h5');
          const link = el.querySelector('a');
          const img = el.querySelector('img');
          const title = (heading?.textContent || link?.textContent || text.split('\n')[0] || '').trim();

          if (title.length < 10 || title.length > 200) return;

          // Price detection
          let price = null;
          let currency = 'EUR';
          const priceMatch = text.match(/(?:€|EUR)\s*([\d.,]+)|([\d.,]+)\s*(?:€|EUR)/);
          if (priceMatch) {
            price = (priceMatch[1] || priceMatch[2]).replace(/,/g, '');
          } else {
            const usdMatch = text.match(/\$\s*([\d.,]+)|([\d.,]+)\s*USD/);
            if (usdMatch) { price = (usdMatch[1] || usdMatch[2]).replace(/,/g, ''); currency = 'USD'; }
          }

          // Location detection
          let country = null;
          const countries = ['Spain','Germany','Netherlands','France','Italy','Poland','UK','Belgium','Austria','Sweden','Romania','Hungary','Czech','Turkey','Portugal','USA'];
          for (const c of countries) {
            if (text.includes(c)) { country = c; break; }
          }

          results.push({
            title,
            url: el.closest('a')?.href || link?.href || null,
            price: price ? parseFloat(price) : null,
            currency,
            country,
            image: img?.src || null
          });
        });
      });

      return results.slice(0, 50);
    });

    return items;
  } catch (e) {
    return [];
  }
}

// ── Main ──
async function main() {
  console.log(`[SHARK BOT] Starting scrape at ${new Date().toISOString()}`);

  const browser = await chromium.launch({ headless: true });
  const allResults = {};

  for (const platform of PLATFORMS) {
    console.log(`[${platform.id}] Scraping...`);
    const platformResults = [];

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        locale: 'en-US'
      });
      const page = await context.newPage();

      // Search 3 queries per platform
      for (const query of SEARCH_QUERIES.slice(0, 3)) {
        try {
          const items = await platform.search(page, query);
          platformResults.push(...items);
          console.log(`  Query "${query}": ${items.length} results`);
        } catch (e) {
          console.log(`  Query "${query}" failed: ${e.message}`);
        }
      }

      await context.close();
    } catch (e) {
      console.log(`[${platform.id}] Platform failed: ${e.message}`);
    }

    // Deduplicate
    const seen = new Set();
    allResults[platform.id] = platformResults.filter(r => {
      const key = r.title?.substring(0, 60);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`[${platform.id}] Total unique: ${allResults[platform.id].length}`);
  }

  await browser.close();

  // Save results
  const output = {
    scrapedAt: new Date().toISOString(),
    platforms: PLATFORMS.length,
    totalItems: Object.values(allResults).reduce((s, r) => s + r.length, 0),
    results: allResults
  };

  const outputPath = path.join(__dirname, '..', '..', 'public', 'dashboard', 'scraped-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`[SHARK BOT] Done. ${output.totalItems} items saved to ${outputPath}`);
}

main().catch(console.error);
