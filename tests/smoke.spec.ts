import { test, expect } from '@playwright/test';

test.describe('Prism IPTV Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should load the main page and display the 3D scene', async ({ page }) => {
    // Check for Prism Branding
    await expect(page.locator('text=PRISM')).toBeVisible();
    
    // Verify 3D Canvas is present (CinemaVoidScene)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should navigate to Live TV and select a channel', async ({ page }) => {
    await page.click('text=Live TV');
    
    // Wait for channel list
    const channelList = page.locator('div[class*="channelGrid"]');
    await expect(channelList).toBeVisible();

    // Select first channel
    const firstChannel = page.locator('div[class*="channelItem"]').first();
    await firstChannel.click();

    // Verify Active status
    await expect(firstChannel).toHaveClass(/active/);
  });

  test('should open TV Guide and show EPG data', async ({ page }) => {
    await page.click('text=TV Guide');
    
    // Check for Guide header
    await expect(page.locator('h1:has-text("TV Guide")')).toBeVisible();
    
    // Check for a program card
    const programCard = page.locator('div[class*="programCard"]').first();
    await expect(programCard).toBeVisible();
  });

  test('should connect to Remote Server', async ({ page }) => {
    await page.click('text=Settings');
    
    // Check for service status
    const status = page.locator('text=Service Online');
    await expect(status).toBeVisible({ timeout: 10000 });
  });
});
