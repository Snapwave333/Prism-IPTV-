import { test, expect } from '@playwright/test';

test.describe('DOM Structure Debug', () => {
  test('analyze DOM structure and CSS', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait a bit for React to render
    await page.waitForTimeout(2000);

    // Check if sidebar exists
    const sidebar = page.locator('aside');
    const sidebarExists = await sidebar.count();
    console.log('Sidebar elements found:', sidebarExists);

    if (sidebarExists > 0) {
      const sidebarHTML = await sidebar.first().innerHTML();
      console.log('Sidebar HTML (first 500 chars):', sidebarHTML.substring(0, 500));

      // Check computed styles
      const sidebarStyles = await sidebar.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          zIndex: styles.zIndex,
          transform: styles.transform,
          width: styles.width,
          height: styles.height,
        };
      });
      console.log('Sidebar computed styles:', JSON.stringify(sidebarStyles, null, 2));
    }

    // Check for PRISM text
    const prismText = page.locator('text=PRISM');
    const prismCount = await prismText.count();
    console.log('PRISM text elements found:', prismCount);

    if (prismCount > 0) {
      const prismStyles = await prismText.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          color: styles.color,
          fontSize: styles.fontSize,
        };
      });
      console.log('PRISM text styles:', JSON.stringify(prismStyles, null, 2));
    }

    // Check canvas
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    console.log('Canvas elements found:', canvasCount);

    if (canvasCount > 0) {
      const canvasStyles = await canvas.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: styles.display,
          position: styles.position,
          zIndex: styles.zIndex,
          width: styles.width,
          height: styles.height,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        };
      });
      console.log('Canvas styles:', JSON.stringify(canvasStyles, null, 2));
    }

    // Get ALL text content
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('All visible text on page:', allText || '(NO TEXT FOUND)');

    // Get ALL elements
    const elementCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    console.log('Total DOM elements:', elementCount);

    // Check main layout
    const main = page.locator('main');
    const mainCount = await main.count();
    console.log('Main elements found:', mainCount);

    // Take screenshot
    await page.screenshot({ path: 'test-results/dom-debug.png', fullPage: true });

    expect(true).toBe(true); // Always pass, this is just for debugging
  });
});
