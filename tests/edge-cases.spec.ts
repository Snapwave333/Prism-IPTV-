import { test, expect } from '@playwright/test';

test.describe('Edge Case Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('network failure - EPG loading error', async ({ page }) => {
    // Intercept and abort EPG request
    await page.route('**/api/epg', route => route.abort('failed'));
    
    await page.click('text=TV Guide');
    
    // Verify error UI
    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('concurrency - rapid category switching', async ({ page }) => {
    const categories = ['Sports', 'Radio', 'Podcasts', 'Live TV'];
    for (const cat of categories) {
      await page.click(`text=${cat}`);
    }
    // Verify we end up on the last selected category correctly
    await expect(page.locator('button[class*="navItemActive"]')).toContainText('Live TV');
  });

  test('boundary value - invalid playlist URL (if applicable)', async ({ page }) => {
    // This assumes there's a way to input a custom URL in Settings
    // Currently the URL is hardcoded in ChannelList.tsx, but let's assume future extensibility
    await page.click('text=Settings');
    // ... test settings form validation if implemented ...
  });
});
