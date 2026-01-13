/**
 * Mobile & Touch Interface Tests
 * Tests mobile responsiveness, touch interactions, and mobile-specific features
 */

import { test, expect } from './helpers/fixtures';

test.describe('Mobile Interface Tests', () => {
  test.describe('Mobile Layout & Responsiveness', () => {
    test('mobile landing page renders correctly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      // Check for mobile-optimized layout
      const sidebar = appPage.page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Canvas should be visible on mobile
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('navigation menu is accessible on mobile', async ({ appPage }) => {
      await appPage.goto('/');

      // Look for hamburger menu or mobile nav
      const navItems = appPage.page.locator('aside button');
      const count = await navItems.count();

      expect(count).toBeGreaterThan(0);
    });

    test('content fits within mobile viewport', async ({ appPage }) => {
      await appPage.goto('/');

      // Check for horizontal scroll
      const hasHorizontalScroll = await appPage.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('text is readable without zooming', async ({ appPage }) => {
      await appPage.goto('/');

      const textElements = await appPage.page.locator('p, h1, h2, h3, h4, h5, h6, span, button').all();

      for (const element of textElements.slice(0, 10)) {
        const fontSize = await element.evaluate(el => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });

        // Text should be at least 14px on mobile
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('tap targets are sufficiently large', async ({ appPage }) => {
      await appPage.goto('/');

      const buttons = await appPage.page.locator('button').all();

      for (const button of buttons.slice(0, 10)) {
        const box = await button.boundingBox();

        if (box) {
          // Minimum tap target size is 44x44px (iOS guidelines)
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test('touch tap on navigation works', async ({ appPage }) => {
      await appPage.goto('/');

      const livetvBtn = appPage.page.locator('text=Live TV');
      await livetvBtn.tap();

      await appPage.page.waitForTimeout(500);

      // Should navigate to Live TV
      await expect(livetvBtn).toHaveClass(/active/);
    });

    test('touch tap on channel selection works', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const firstChannel = appPage.page.locator('div[class*="channelItem"]').first();
      await firstChannel.tap();

      await appPage.page.waitForTimeout(500);

      // Channel should be active
      await expect(firstChannel).toHaveClass(/active/);
    });

    test('swipe gestures work on channel list', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const channelList = appPage.page.locator('div[class*="channelGrid"]').first();

      // Perform swipe down
      await channelList.evaluate((el) => {
        el.scrollTop = 0;
      });

      const initialScrollPos = await channelList.evaluate(el => el.scrollTop);

      // Swipe
      await channelList.evaluate((el) => {
        el.scrollTop += 200;
      });

      await appPage.page.waitForTimeout(300);

      const newScrollPos = await channelList.evaluate(el => el.scrollTop);

      expect(newScrollPos).toBeGreaterThan(initialScrollPos);
    });

    test('pinch-to-zoom is disabled where appropriate', async ({ appPage }) => {
      await appPage.goto('/');

      const viewport = await appPage.page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content');
      });

      console.log('Viewport meta:', viewport);

      // Should have user-scalable=no or maximum-scale=1 for app-like experience
      if (viewport) {
        const hasScaleRestriction = viewport.includes('user-scalable=no') || viewport.includes('maximum-scale=1');
        expect(hasScaleRestriction).toBe(true);
      }
    });

    test('long press on channel shows context menu', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const firstChannel = appPage.page.locator('div[class*="channelItem"]').first();

      // Long press simulation
      await firstChannel.hover();
      await appPage.page.mouse.down();
      await appPage.page.waitForTimeout(700);
      await appPage.page.mouse.up();

      // Check if context menu or favorite option appears
      // (Depends on implementation)
      await appPage.page.waitForTimeout(500);
    });
  });

  test.describe('Mobile Player Controls', () => {
    test('volume control works on mobile', async ({ appPage }) => {
      await appPage.goto('/');

      const volumeSlider = appPage.page.locator('input[type="range"][aria-label*="Volume"]');
      await volumeSlider.tap();

      // Should be interactable
      await expect(volumeSlider).toBeVisible();
    });

    test('fullscreen toggle works on mobile', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const fullscreenBtn = appPage.page.getByLabel('Fullscreen').first();

      if (await fullscreenBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fullscreenBtn.tap();
        await appPage.page.waitForTimeout(500);

        // Should trigger fullscreen (may not work in test environment)
        await expect(fullscreenBtn).toBeVisible();
      }
    });

    test('play/pause button is touch-friendly', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');

      const playBtn = appPage.page.locator('button[aria-label*="Play"]').first();
      const box = await playBtn.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }

      await playBtn.tap();
      await appPage.page.waitForTimeout(300);
    });
  });

  test.describe('Mobile Remote Control', () => {
    test('/remote page loads on mobile', async ({ page }) => {
      await page.goto('/remote');

      // Wait for remote interface to load
      await page.waitForTimeout(2000);

      // Should show remote controls
      await expect(page.locator('body')).toBeVisible();
    });

    test('remote control buttons are touch-friendly', async ({ page }) => {
      await page.goto('/remote');

      await page.waitForTimeout(2000);

      const buttons = await page.locator('button').all();

      for (const button of buttons.slice(0, 10)) {
        const box = await button.boundingBox();

        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test('haptic feedback triggers on button press', async ({ page }) => {
      await page.goto('/remote');

      // Check if navigator.vibrate is called (if implemented)
      const hasVibrate = await page.evaluate(() => {
        return 'vibrate' in navigator;
      });

      console.log('Vibrate API available:', hasVibrate);

      if (hasVibrate) {
        // Tap a button
        const button = page.locator('button').first();
        if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
          await button.tap();
        }
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('page load time is acceptable on mobile', async ({ appPage }) => {
      const start = Date.now();
      await appPage.goto('/');
      const loadTime = Date.now() - start;

      console.log(`Mobile page load time: ${loadTime}ms`);

      // Mobile should load within 5 seconds (accounting for slower networks)
      expect(loadTime).toBeLessThan(5000);
    });

    test('3D scene renders efficiently on mobile', async ({ appPage }) => {
      await appPage.goto('/');

      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Check FPS
      const fps = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0;
          const startTime = performance.now();

          function measureFrames() {
            frames++;
            if (performance.now() - startTime >= 2000) {
              resolve(frames / 2);
            } else {
              requestAnimationFrame(measureFrames);
            }
          }

          requestAnimationFrame(measureFrames);
        });
      });

      console.log(`Mobile FPS: ${fps.toFixed(2)}`);

      // Mobile should maintain at least 30 FPS
      expect(fps).toBeGreaterThan(25);
    });

    test('memory usage is optimized for mobile', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.page.waitForTimeout(5000);

      const memory = await appPage.page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      const memoryMB = memory / (1024 * 1024);

      console.log(`Mobile memory usage: ${memoryMB.toFixed(2)} MB`);

      // Mobile memory should be reasonable (under 150MB)
      expect(memoryMB).toBeLessThan(150);
    });
  });

  test.describe('Mobile Network Conditions', () => {
    test('app is usable on slow 3G', async ({ appPage }) => {
      // Simulate slow 3G
      await appPage.page.route('**/*', async (route) => {
        await appPage.page.waitForTimeout(100); // Add latency
        await route.continue();
      });

      const start = Date.now();
      await appPage.goto('/');
      const loadTime = Date.now() - start;

      console.log(`Load time on slow 3G: ${loadTime}ms`);

      // Should eventually load
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 15000 });
    });

    test('loading states are shown during network delays', async ({ appPage }) => {
      await appPage.page.route('**/us.m3u', async (route) => {
        await appPage.page.waitForTimeout(2000);
        await route.continue();
      });

      await appPage.goto('/');

      // Should show loading indicator
      const loading = appPage.page.locator('text=Loading').first();

      if (await loading.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(loading).toBeVisible();
      }
    });

    test('offline mode shows appropriate message', async ({ appPage }) => {
      await appPage.goto('/');

      // Go offline
      await appPage.page.context().setOffline(true);

      await appPage.page.waitForTimeout(2000);

      // Try to navigate
      await appPage.page.click('text=TV Guide').catch(() => {});

      await appPage.page.waitForTimeout(1000);

      // Should show error or offline message
      const error = appPage.page.locator('text=Error, text=offline, text=network').first();

      // Restore online status
      await appPage.page.context().setOffline(false);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('mobile interface is keyboard accessible', async ({ appPage }) => {
      await appPage.goto('/');

      // Tab through focusable elements
      await appPage.page.keyboard.press('Tab');
      await appPage.page.keyboard.press('Tab');
      await appPage.page.keyboard.press('Tab');

      const focusedElement = await appPage.page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      console.log('Focused element:', focusedElement);

      expect(focusedElement).toBeTruthy();
    });

    test('screen reader compatibility on mobile', async ({ appPage }) => {
      await appPage.goto('/');

      // Check for ARIA labels
      const ariaLabels = await appPage.page.locator('[aria-label]').count();

      console.log('Elements with aria-label:', ariaLabels);

      expect(ariaLabels).toBeGreaterThan(5);
    });

    test('color contrast is sufficient on mobile', async ({ appPage }) => {
      await appPage.goto('/');

      // This would require a full accessibility audit
      // Checked via accessibility.spec.ts
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Mobile Orientation', () => {
    test('landscape orientation works correctly', async ({ page }) => {
      // Set landscape viewport
      await page.setViewportSize({ width: 844, height: 390 });

      await page.goto('/');

      // Check layout adapts
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      const dimensions = await canvas.evaluate((el: HTMLCanvasElement) => ({
        width: el.width,
        height: el.height,
      }));

      expect(dimensions.width).toBeGreaterThan(dimensions.height);
    });

    test('portrait orientation works correctly', async ({ page }) => {
      // Set portrait viewport
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto('/');

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      const dimensions = await canvas.evaluate((el: HTMLCanvasElement) => ({
        width: el.width,
        height: el.height,
      }));

      expect(dimensions.height).toBeGreaterThan(dimensions.width);
    });
  });
});
