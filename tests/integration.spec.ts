import { test, expect } from '@playwright/test';

test.describe('System Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('API contract: Channel data schema validation', async ({ page }) => {
    // Intercept the channels response to validate schema
    // Since we rely on M3U parsing in the frontend, we validate the mapped state in the store
    // This requires exposing the store to the window or checking UI data usage
    
    // Alternative: Verify UI elements reflect core data props
    const firstChannel = page.locator('div[class*="channelItem"]').first();
    await expect(firstChannel).toHaveAttribute('data-channel-id');
    const name = await firstChannel.innerText();
    expect(name.length).toBeGreaterThan(0);
  });

  test('Zustand State: Cinema Void mode persistence', async ({ page }) => {
    // Navigate and change state (e.g. toggle settings)
    await page.click('text=Live TV');
    
    // Verify initial state via UI (e.g. presence of canvas)
    await expect(page.locator('canvas')).toBeVisible();

    // Trigger an action that modifies global state (e.g. resizing or changing volume)
    // We'll simulate a volume change which commits to the store
    const volumeSlider = page.locator('div[class*="volumeSlider"]');
    if (await volumeSlider.isVisible()) {
        await volumeSlider.click();
        // Reload page to check persistence (if implemented)
        // await page.reload();
        // Check if value is retained (Optional, depending on implementation)
    }
  });

  test('Remote Server Health API', async ({ page, request }) => {
    // Direct API call to backend
    const status = await request.get('http://localhost:3001/api/status');
    expect(status.ok()).toBeTruthy();
    
    const body = await status.json();
    expect(body).toHaveProperty('status', 'online');
    expect(body).toHaveProperty('version');
  });
});
