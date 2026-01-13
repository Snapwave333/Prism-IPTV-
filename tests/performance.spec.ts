import { test, expect } from '@playwright/test';

test.describe('Performance Validation', () => {
  test('page load metrics', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;
    
    console.log(`Main Page Load Time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Threshold
    
    // Performance APIs
    const [performanceTiming] = await page.evaluate(() => {
      const [timing] = performance.getEntriesByType('navigation');
      return [timing.toJSON()];
    });
    
    console.log('Performance Navigation Timing:', performanceTiming);
    expect(performanceTiming.duration).toBeLessThan(5000);
  });

  test('API response times - EPG', async ({ page }) => {
    await page.goto('/');

    const [response] = await Promise.all([
      page.waitForResponse('**/api/epg'),
      page.click('text=TV Guide'),
    ]);

    const timing = response.request().timing();
    const totalTime = timing.responseEnd;
    
    console.log(`EPG API Response Time: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(2000); // 95th percentile under 2s requirement
  });

  test('Time to Interactive (TTI) check', async ({ page }) => {
    await page.goto('/');
    // Check if key interactive elements are ready quickly
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    const firstNavItem = page.locator('button[class*="navItem"]').first();
    await expect(firstNavItem).toBeEnabled();
  });
});
