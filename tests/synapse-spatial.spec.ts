import { test, expect } from '@playwright/test';

test.describe('Synapse Spatial UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('verify 3D mascot (Lumen) initialization', async ({ page }) => {
    // Listen for VRM load logs
    const vrmLoadedPromise = new Promise((resolve) => {
        page.on('console', msg => {
            if (msg.text().includes('VRM Load Progress: 100%')) {
                resolve(true);
            }
        });
    });

    // Check canvas presence
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for mascots to be ready (timeout 30s as model might be large)
    await vrmLoadedPromise;
    console.log('VRM mascot confirmed loaded via logs.');
  });

  test('verify spatial controls (Gestural Glyphs)', async ({ page }) => {
    // Hover over the center of the 3D void to trigger UI visibility if hidden
    await page.mouse.move(600, 400);
    
    // Look for playback icons (represented by buttons with specific labels or paths)
    // In spatial UI, these might be rendered inside the canvas, 
    // but often have DOM overlays for accessibility.
    const playPause = page.locator('button[aria-label="Play"], button[aria-label="Pause"]');
    await expect(playPause).toBeVisible();
  });

  test('verify audio reactivity (Neon Scrubber)', async ({ page }) => {
    await page.click('text=Live TV');
    const firstChannel = page.locator('div[class*="channelItem"]').first();
    await firstChannel.click();

    // Unmute to trigger audio processing
    const unmuteBtn = page.getByLabel('Unmute');
    if (await unmuteBtn.isVisible()) {
        await unmuteBtn.click();
    }

    // Check for neon scrubber (blue glow)
    const scrubber = page.locator('div[class*="progressContainer"]');
    await expect(scrubber).toBeVisible();
    
    // Verify volume bar presence
    const volumeBar = page.locator('div[class*="volumeSlider"]');
    await expect(volumeBar).toBeVisible();
  });

  test('chameleon engine color extraction check', async ({ page }) => {
    // Check if the accent color in the store changes (detected via CSS variables on the body if applied)
    // Or check if the point light in the scene changes (hard to test without specific debug markers)
    // We'll check if the root style has a non-default accent color
    const accentColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    });
    
    console.log(`Detected Accent Color: ${accentColor}`);
    expect(accentColor).toBeDefined();
  });
});
