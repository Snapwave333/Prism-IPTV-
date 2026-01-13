import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('check page loads and capture errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('PAGE ERROR:', error.message);
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Take a screenshot
    await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true });

    // Get page HTML
    const html = await page.content();
    console.log('Page HTML length:', html.length);
    console.log('Page title:', await page.title());

    // Check what's actually rendered
    const bodyText = await page.locator('body').textContent();
    console.log('Body text content:', bodyText?.substring(0, 500));

    // Log all errors
    console.log('\n=== ERRORS ===');
    errors.forEach(err => console.log(err));

    console.log('\n=== WARNINGS ===');
    warnings.forEach(warn => console.log(warn));

    // The test passes if we got this far - we just want to see what's happening
    expect(html.length).toBeGreaterThan(0);
  });
});
