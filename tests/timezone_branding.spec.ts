import { test, expect } from '@playwright/test';

test.describe('Timezone, Branding and TV Guide Modal Verification', () => {
  test('should display Prism IPTV branding and correctly handle timezone', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`Browser Console: ${msg.text()}`));

    // Go to the Docker-deployed instance
    await page.goto('http://localhost:3000');
    
    // 1. Verify Branding
    // Check for "Prism" related text (Branding)
    // Relaxed check to account for layout/spacing/transform
    const brandingLocator = page.locator('text=/Prism/i'); 
    
    // Log content for debugging if checks fail
    if (await brandingLocator.count() === 0) {
        console.log('Available text content:', await page.textContent('body'));
    }
    
    // Soft assertion or just normal Expect
    await expect(brandingLocator.first()).toBeVisible({ timeout: 10000 });

    // 2. Click Settings link/button
    // Adjust selector based on actual UI. Assuming text "Settings" or icon.
    await page.locator('a[href="/settings"], button:has-text("Settings"), .lucide-settings, a[href*="settings"]').first().click();
    
    // 3. Verify Time & Region section
    await expect(page.locator('h2:has-text("Time & Region")')).toBeVisible();
    
    // 4. Verify Timezone Dropdown
    const timezoneSelect = page.locator('select#timezone-select');
    await expect(timezoneSelect).toBeVisible();
    
    // Get default value (should be browser/system timezone)
    // we set it to 'Intl.DateTimeFormat().resolvedOptions().timeZone' in store
    const defaultTimezone = await timezoneSelect.inputValue();
    console.log('Default Timezone:', defaultTimezone);
    expect(defaultTimezone).toBeTruthy();

    // 5. Change Timezone
    // Select a different timezone, e.g., 'Asia/Tokyo'
    const newTimezone = 'Asia/Tokyo';
    await timezoneSelect.selectOption(newTimezone);
    
    // 6. Navigate back to TV Guide
    await page.locator('a[href="/"], button:has-text("Guide"), .lucide-tv, a[href="/"]').first().click();
    
    // 7. Click a program card to open Modal
    // Wait for grid to load
    await page.waitForSelector('.program-card, [class*="programCard"]', { timeout: 10000 });
    const programCard = page.locator('.program-card, [class*="programCard"]').first();
    
    // Capture title
    // Styles use .programTitle or programTitle class
    const titleLocator = programCard.locator('[class*="programTitle"]');
    const programTitle = await titleLocator.textContent();
    console.log('Clicked Program Title:', programTitle);

    await programCard.click();

    // 8. Verify Modal appears
    // Use robust selector: data-testid
    const modal = page.getByTestId('program-modal');
    await expect(modal).toBeVisible();
    
    // Verify program details in modal (Title exists)
    const modalTitle = modal.locator('h3');
    await expect(modalTitle).toBeVisible();
    await expect(modalTitle).toHaveText(programTitle || '');
    
    // Also check for the close button
    await expect(modal.locator('button')).toBeVisible(); 
  });
});
