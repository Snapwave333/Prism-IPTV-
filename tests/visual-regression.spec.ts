/**
 * Visual Regression Tests
 * Pixel-perfect UI comparisons and responsive design verification
 */

import { test, expect } from './helpers/fixtures';

test.describe('Visual Regression Tests', () => {
  test.describe('Desktop Layouts', () => {
    test('landing page renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Wait for 3D scene to stabilize
      await appPage.page.waitForTimeout(2000);

      // Take full page screenshot
      await expect(appPage.page).toHaveScreenshot('landing-page-desktop.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('sidebar navigation renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const sidebar = appPage.page.locator('aside');
      await expect(sidebar).toHaveScreenshot('sidebar-navigation.png');
    });

    test('live TV channel list renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const channelList = appPage.page.locator('div[class*="channelGrid"]').first();
      await expect(channelList).toHaveScreenshot('channel-list.png');
    });

    test('player controls render consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const controls = appPage.page.locator('div[class*="playerControls"]').first();
      await expect(controls).toHaveScreenshot('player-controls.png', {
        animations: 'disabled',
      });
    });

    test('TV Guide renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.navigateToTVGuide();
      await appPage.waitForNoLoadingSpinners();

      await expect(appPage.page).toHaveScreenshot('tv-guide-desktop.png', {
        fullPage: true,
      });
    });

    test('Settings page renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.navigateToSettings();

      await expect(appPage.page).toHaveScreenshot('settings-page-desktop.png', {
        fullPage: true,
      });
    });

    test('Favorites view renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.navigateToFavorites();

      await expect(appPage.page).toHaveScreenshot('favorites-page-desktop.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Responsive Design Verification', () => {
    const viewports = [
      { name: '1920x1080', width: 1920, height: 1080 },
      { name: '1366x768', width: 1366, height: 768 },
      { name: '1280x720', width: 1280, height: 720 },
    ];

    for (const viewport of viewports) {
      test(`landing page at ${viewport.name}`, async ({ appPage }) => {
        await appPage.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await appPage.gotoWithMocks('/');

        await appPage.page.waitForTimeout(2000);

        await expect(appPage.page).toHaveScreenshot(`landing-${viewport.name}.png`, {
          fullPage: false,
          animations: 'disabled',
        });
      });
    }

    test('mobile viewport renders correctly', async ({ appPage }) => {
      await appPage.page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
      await appPage.gotoWithMocks('/');

      await expect(appPage.page).toHaveScreenshot('landing-mobile-390x844.png', {
        fullPage: true,
      });
    });

    test('tablet viewport renders correctly', async ({ appPage }) => {
      await appPage.page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      await appPage.gotoWithMocks('/');

      await expect(appPage.page).toHaveScreenshot('landing-tablet-768x1024.png', {
        fullPage: true,
      });
    });
  });

  test.describe('UI State Variations', () => {
    test('active channel highlight renders correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      await appPage.selectChannel(0);

      const activeChannel = await appPage.getActiveChannel();
      await expect(activeChannel).toHaveScreenshot('active-channel-highlight.png');
    });

    test('hover states render correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const firstChannel = appPage.page.locator('div[class*="channelItem"]').first();
      await firstChannel.hover();

      await expect(firstChannel).toHaveScreenshot('channel-hover-state.png');
    });

    test('loading spinner renders consistently', async ({ page }) => {
      await page.goto('/');

      const spinner = page.locator('[class*="loadingSpinner"]').first();

      if (await spinner.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(spinner).toHaveScreenshot('loading-spinner.png');
      }
    });

    test('empty favorites state renders correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.navigateToFavorites();

      const emptyState = appPage.page.locator('text=No favorites yet').first();
      await expect(emptyState).toBeVisible();

      await expect(appPage.page).toHaveScreenshot('favorites-empty-state.png', {
        fullPage: true,
      });
    });

    test('volume slider renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const volumeControl = appPage.page.locator('div[class*="volumeControl"]').first();
      await expect(volumeControl).toHaveScreenshot('volume-slider.png');
    });
  });

  test.describe('Theme & Color Scheme', () => {
    test('dark mode renders correctly', async ({ appPage }) => {
      await appPage.page.emulateMedia({ colorScheme: 'dark' });
      await appPage.gotoWithMocks('/');

      await appPage.page.waitForTimeout(2000);

      await expect(appPage.page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
      });
    });

    test('chameleon color extraction updates UI', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Wait for color extraction to occur
      await appPage.page.waitForTimeout(3000);

      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toHaveScreenshot('canvas-with-accent-color.png', {
        animations: 'disabled',
      });
    });

    test('neon scrubber glow effect renders', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const scrubber = appPage.page.locator('div[class*="progressContainer"]').first();
      await expect(scrubber).toHaveScreenshot('neon-scrubber.png');
    });
  });

  test.describe('3D Scene Rendering', () => {
    test('CinemaVoid scene renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Wait for WebGL scene to render
      await appPage.page.waitForTimeout(3000);

      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toHaveScreenshot('cinema-void-scene.png', {
        animations: 'disabled',
      });
    });

    test('VRM mascot renders in scene', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Wait for VRM to load
      await appPage.waitForLumenReady();

      // Wait additional time for rendering to stabilize
      await appPage.page.waitForTimeout(2000);

      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toHaveScreenshot('vrm-mascot-rendered.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Modal & Overlay Components', () => {
    test('TV Guide program modal renders correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.navigateToTVGuide();
      await appPage.waitForNoLoadingSpinners();

      // Click first program to open modal
      const firstProgram = appPage.page.locator('div[class*="programCard"]').first();

      if (await firstProgram.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstProgram.click();

        // Wait for modal animation
        await appPage.page.waitForTimeout(500);

        const modal = appPage.page.locator('[role="dialog"]').first();
        await expect(modal).toHaveScreenshot('program-modal.png');
      }
    });

    test('toast notifications render correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Trigger a favorite action which should show a toast
      await appPage.waitForNoLoadingSpinners();
      await appPage.toggleFavorite(0);

      // Wait for toast to appear
      await appPage.page.waitForTimeout(500);

      const toast = appPage.page.locator('[class*="toast"]').first();

      if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(toast).toHaveScreenshot('toast-notification.png');
      }
    });
  });

  test.describe('Animation Consistency', () => {
    test('sidebar collapse animation renders consistently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Trigger collapse (if there's a collapse button)
      const collapseBtn = appPage.page.locator('button[aria-label*="collapse"]').first();

      if (await collapseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await collapseBtn.click();

        // Wait for animation to complete
        await appPage.page.waitForTimeout(500);

        await expect(appPage.page).toHaveScreenshot('sidebar-collapsed.png');
      }
    });

    test('channel transition animation completes', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      await appPage.selectChannel(0);
      await appPage.page.waitForTimeout(300);
      await appPage.selectChannel(1);

      // Wait for transition
      await appPage.page.waitForTimeout(500);

      const activeChannel = await appPage.getActiveChannel();
      await expect(activeChannel).toHaveScreenshot('channel-transition-complete.png');
    });
  });

  test.describe('Icon & Asset Rendering', () => {
    test('navigation icons render correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const navItems = appPage.page.locator('aside button[class*="navItem"]');
      const count = await navItems.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const navItem = navItems.nth(i);
        await expect(navItem).toHaveScreenshot(`nav-icon-${i}.png`);
      }
    });

    test('channel logos load and render', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const channelLogos = appPage.page.locator('div[class*="channelItem"] img').first();

      if (await channelLogos.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(channelLogos).toHaveScreenshot('channel-logo.png');
      }
    });
  });

  test.describe('Error State UI', () => {
    test('network error state renders correctly', async ({ page }) => {
      await page.route('**/api/epg', (route) => route.abort('failed'));

      await page.goto('/');
      await page.click('text=TV Guide');

      const errorMessage = page.locator('text=Error').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });

      await expect(page).toHaveScreenshot('network-error-state.png', {
        fullPage: true,
      });
    });
  });
});
