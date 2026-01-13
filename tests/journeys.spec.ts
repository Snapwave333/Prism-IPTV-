import { test, expect } from '@playwright/test';

test.describe('Core User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));

    // Mock M3U fetch to ensure stable results
    await page.route('**/us.m3u', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: `#EXTM3U
#EXTINF:-1 tvg-id="test1" tvg-logo="https://example.com/logo1.png" group-title="Test Group",Test Channel 1
http://example.com/stream1.m3u8
#EXTINF:-1 tvg-id="test2" tvg-logo="https://example.com/logo2.png" group-title="Sports",Sports Channel
http://example.com/stream2.m3u8
#EXTINF:-1 tvg-id="religious1" tvg-logo="https://example.com/logo3.png" group-title="Religion",Gospel TV
http://example.com/stream3.m3u8`
      });
    });

    // Mock stream requests to avoid CORS/Network errors
    await page.route('**/stream*.m3u8', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/vnd.apple.mpegurl',
            body: '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-ENDLIST'
        });
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('verify auto-play and initial muted state', async ({ page }) => {
    // Wait for channels to load
    await expect(page.locator('text=Loading Channels...')).not.toBeVisible({ timeout: 10000 });
    
    // First channel should be active by default
    const firstChannel = page.locator('div[class*="channelItem"]').first();
    await expect(firstChannel).toBeVisible();
    await expect(firstChannel).toHaveClass(/active/);
    
    // Player should be muted - Button label should be "Unmute"
    await expect(page.getByLabel('Unmute')).toBeVisible();
  });

  test('verify religious content filtering', async ({ page }) => {
    // Wait for channels to load
    await expect(page.locator('text=Loading Channels...')).not.toBeVisible({ timeout: 10000 });

    // The mock has 3 channels, but one is "Religion" group and "Gospel TV" name.
    // It should be filtered out.
    const channels = page.locator('div[class*="channelItem"]');
    await expect(channels).toHaveCount(2);
    
    await expect(page.locator('text=Gospel TV')).not.toBeVisible();
    await expect(page.locator('text=Test Channel 1')).toBeVisible();
    await expect(page.locator('text=Sports Channel')).toBeVisible();
  });

  test('navigate through categories and click channel', async ({ page }) => {
    // Wait for channels to load
    await expect(page.locator('text=Loading Channels...')).not.toBeVisible({ timeout: 10000 });
    
    const secondChannel = page.locator('div[class*="channelItem"]').nth(1);
    await expect(secondChannel).toBeVisible();
    await secondChannel.click();
    
    // Check if the item becomes active
    await expect(secondChannel).toHaveClass(/active/);
  });

  test('toggle favorites', async ({ page }) => {
    // Wait for channels to load
    await expect(page.locator('text=Loading Channels...')).not.toBeVisible({ timeout: 10000 });
    
    const firstChannel = page.locator('div[class*="channelItem"]').first();
    const favBtn = firstChannel.locator('button[aria-label*="favorites"]');
    
    // Add to favorites
    await favBtn.click();
    
    // Navigate to Favorites view
    await page.click('aside >> text=Favorites');
    
    // Verify it appeared in Favorites
    const favItem = page.locator('div[class*="favoriteItem"]').first();
    await expect(favItem).toBeVisible();
    
    // Remove from favorites
    await page.click('aside >> text=Live TV'); // Go back
    await expect(page.locator('text=Loading Channels...')).not.toBeVisible();
    await favBtn.click();
    
    await page.click('aside >> text=Favorites');
    // Check for empty state
    await expect(page.locator('text=No favorites yet')).toBeVisible();
  });

  test('tv guide interaction', async ({ page }) => {
    await page.click('aside >> text=TV Guide');
    
    // Wait for guide to load
    await expect(page.locator('text=Loading Guide...')).not.toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('text=Live TV Guide')).toBeVisible();
    
    const firstProgram = page.locator('div[class*="programCard"]').first();
    await expect(firstProgram).toBeVisible();
  });

  test('settings and remote status', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    
    const serviceStatus = page.locator('text=Service Online');
    await expect(serviceStatus).toBeVisible({ timeout: 5000 });
  });
});
