import { test } from '@playwright/test';

test('debug page rendering', async ({ page }) => {
  console.log('=== Starting debug test ===');

  // Capture all console output
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

  console.log('Page loaded, waiting 5 seconds...');
  await page.waitForTimeout(5000);

  // Get the actual HTML
  const html = await page.content();
  console.log('=== HTML LENGTH ===', html.length);
  console.log('=== FIRST 1000 CHARS ===');
  console.log(html.substring(0, 1000));

  // Check what's in the body
  const bodyText = await page.locator('body').textContent();
  console.log('=== BODY TEXT ===');
  console.log(bodyText);

  // Check for specific elements
  console.log('=== ELEMENT CHECK ===');
  console.log('Canvas exists:', await page.locator('canvas').count());
  console.log('Aside (sidebar) exists:', await page.locator('aside').count());
  console.log('PRISM text exists:', await page.locator('text=PRISM').count());
  console.log('Any text with "Live":', await page.locator('text=/Live/i').count());

  // Take screenshot
  await page.screenshot({ path: 'test-results/simple-debug.png', fullPage: true });
  console.log('Screenshot saved');
});
