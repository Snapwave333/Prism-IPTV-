import { test } from '@playwright/test';

test.describe('React Mount Debug', () => {
  test('check React mounting and errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const logs: string[] = [];

    // Capture all console output
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for potential React mount
    await page.waitForTimeout(3000);

    // Check if React root exists
    const rootElement = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { exists: false };

      return {
        exists: true,
        innerHTML: root.innerHTML.substring(0, 1000),
        children: root.children.length,
        childNodes: root.childNodes.length,
      };
    });

    console.log('\n=== ROOT ELEMENT ===');
    console.log(JSON.stringify(rootElement, null, 2));

    // Check if React is loaded
    const reactLoaded = await page.evaluate(() => {
      return {
        React: typeof window.React !== 'undefined',
        ReactDOM: typeof window.ReactDOM !== 'undefined',
      };
    });

    console.log('\n=== REACT LOADED ===');
    console.log(JSON.stringify(reactLoaded, null, 2));

    // Print all logs
    console.log('\n=== ALL CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));

    console.log('\n=== ERRORS ===');
    errors.forEach(err => console.error(err));

    console.log('\n=== WARNINGS ===');
    warnings.forEach(warn => console.warn(warn));
  });
});
