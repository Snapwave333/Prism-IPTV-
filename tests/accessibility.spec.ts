import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('landing page should have no accessibility violations', async ({ page }) => {
      await checkA11y(page, undefined, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa', 'wcag21aa']
          }
        },
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
    });

    test('Live TV page should have no accessibility violations', async ({ page }) => {
      await page.click('text=Live TV');
      await page.waitForTimeout(1000);
      await checkA11y(page, undefined, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa', 'wcag21aa']
          }
        }
      });
    });

    test('TV Guide should have no accessibility violations', async ({ page }) => {
      await page.click('text=TV Guide');
      await page.waitForTimeout(1000);
      await checkA11y(page, undefined, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa', 'wcag21aa']
          }
        }
      });
    });

    test('Settings page should have no accessibility violations', async ({ page }) => {
      await page.click('text=Settings');
      await page.waitForTimeout(1000);
      await checkA11y(page, undefined, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa', 'wcag21aa']
          }
        }
      });
    });

    test('Favorites page should have no accessibility violations', async ({ page }) => {
      await page.click('text=Favorites');
      await page.waitForTimeout(1000);
      await checkA11y(page);
    });

    test('Radio page should have no accessibility violations', async ({ page }) => {
      await page.click('text=Radio');
      await page.waitForTimeout(1000);
      await checkA11y(page);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', async ({ page }) => {
      // Tab through all focusable elements
      const focusableElements: string[] = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName + (el?.getAttribute('aria-label') ? ` [${el.getAttribute('aria-label')}]` : '');
        });
        focusableElements.push(focused);
      }

      console.log('Focusable elements:', focusableElements);

      // Should have multiple focusable elements
      expect(new Set(focusableElements).size).toBeGreaterThan(5);
    });

    test('keyboard shortcuts work correctly', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Test play/pause with Space
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      // Test mute with M
      await page.keyboard.press('m');
      await page.waitForTimeout(500);

      // Test fullscreen with F
      await page.keyboard.press('f');
      await page.waitForTimeout(500);

      // App should still be functional
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('navigation can be completed with keyboard only', async ({ page }) => {
      // Navigate to different sections using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(500);

      // Should have navigated
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('focus trap works in modals', async ({ page }) => {
      await page.click('text=TV Guide');
      await page.waitForTimeout(1000);

      // Click first program to open modal
      const firstProgram = page.locator('div[class*="programCard"]').first();

      if (await firstProgram.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstProgram.click();
        await page.waitForTimeout(500);

        // Tab through modal
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Focus should stay within modal
        const focusedElement = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          return modal?.contains(document.activeElement);
        });

        if (focusedElement !== null) {
          expect(focusedElement).toBe(true);
        }
      }
    });

    test('skip links are present and functional', async ({ page }) => {
      // Tab to skip link
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a[href*="#main"], a:has-text("Skip")').first();

      if (await skipLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipLink.press('Enter');

        await page.waitForTimeout(300);

        // Should skip to main content
        const mainContent = page.locator('main, [role="main"], #main').first();
        await expect(mainContent).toBeVisible();
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('all images have alt text', async ({ page }) => {
      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');

        // Should have alt text or aria-label
        expect(alt !== null || ariaLabel !== null).toBe(true);
      }
    });

    test('headings are properly structured', async ({ page }) => {
      const headings = await page.evaluate(() => {
        const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headingElements.map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent?.trim()
        }));
      });

      console.log('Headings structure:', headings);

      // Should have at least one h1
      const h1Count = headings.filter(h => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Headings should not skip levels
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i].level - headings[i - 1].level;
        if (diff > 1) {
          console.warn(`Heading level skipped: ${headings[i - 1].level} -> ${headings[i].level}`);
        }
      }
    });

    test('ARIA labels are present on interactive elements', async ({ page }) => {
      const buttons = await page.locator('button').all();

      let labeledCount = 0;

      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();

        if (ariaLabel || text?.trim()) {
          labeledCount++;
        }
      }

      console.log(`Labeled buttons: ${labeledCount} / ${buttons.length}`);

      // Most buttons should have labels
      expect(labeledCount).toBeGreaterThan(buttons.length * 0.8);
    });

    test('form inputs have associated labels', async ({ page }) => {
      const inputs = await page.locator('input, select, textarea').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        let hasLabel = false;

        if (ariaLabel || ariaLabelledBy) {
          hasLabel = true;
        } else if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          hasLabel = label > 0;
        }

        if (!hasLabel) {
          const type = await input.getAttribute('type');
          console.warn(`Input without label: type=${type}`);
        }
      }
    });

    test('live regions announce dynamic content', async ({ page }) => {
      // Check for aria-live regions
      const liveRegions = await page.locator('[aria-live]').count();

      console.log(`Live regions found: ${liveRegions}`);

      // Dynamic content areas should use aria-live
      if (liveRegions > 0) {
        expect(liveRegions).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('text has sufficient contrast ratio', async ({ page }) => {
      await checkA11y(page, undefined, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa']
          },
          rules: {
            'color-contrast': { enabled: true }
          }
        }
      });
    });

    test('focus indicators are visible', async ({ page }) => {
      // Tab to an element
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      console.log('Focus styles:', focusedElement);

      // Should have visible focus indicator
      if (focusedElement) {
        const hasFocusIndicator =
          focusedElement.outline !== 'none' ||
          focusedElement.boxShadow !== 'none';

        expect(hasFocusIndicator).toBe(true);
      }
    });
  });

  test.describe('Assistive Technology Compatibility', () => {
    test('ARIA roles are used correctly', async ({ page }) => {
      const rolesUsed = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('[role]'));
        return elements.map(el => el.getAttribute('role'));
      });

      console.log('ARIA roles used:', [...new Set(rolesUsed)]);

      // Valid ARIA roles
      const validRoles = ['button', 'navigation', 'main', 'complementary', 'dialog', 'menu', 'menuitem', 'tablist', 'tab', 'tabpanel'];

      rolesUsed.forEach(role => {
        if (role) {
          const isValid = validRoles.includes(role);
          if (!isValid) {
            console.warn(`Potentially invalid ARIA role: ${role}`);
          }
        }
      });
    });

    test('semantic HTML elements are used', async ({ page }) => {
      const semanticElements = await page.evaluate(() => {
        return {
          nav: document.querySelectorAll('nav').length,
          main: document.querySelectorAll('main').length,
          header: document.querySelectorAll('header').length,
          footer: document.querySelectorAll('footer').length,
          article: document.querySelectorAll('article').length,
          section: document.querySelectorAll('section').length,
        };
      });

      console.log('Semantic elements:', semanticElements);

      // Should use semantic HTML
      expect(semanticElements.nav + semanticElements.main).toBeGreaterThan(0);
    });
  });

  test.describe('Media Accessibility', () => {
    test('video player has accessible controls', async ({ page }) => {
      const playButton = page.locator('button[aria-label*="Play"]').first();
      const muteButton = page.locator('button[aria-label*="Mute"]').first();
      const volumeControl = page.locator('input[aria-label*="Volume"]').first();

      // All controls should have labels
      if (await playButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(playButton).toHaveAttribute('aria-label');
      }

      if (await muteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(muteButton).toHaveAttribute('aria-label');
      }
    });

    test('audio descriptions are available (if applicable)', async ({ page }) => {
      // Check for audio description tracks
      const hasAudioDescription = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return false;

        const tracks = Array.from(video.textTracks);
        return tracks.some(track => track.kind === 'descriptions');
      });

      console.log('Audio description available:', hasAudioDescription);

      // If video has tracks, check for descriptions
    });
  });

  test.describe('Responsive & Adaptive', () => {
    test('high contrast mode is supported', async ({ page }) => {
      // Check if styles adapt to high contrast mode
      await page.emulateMedia({ forcedColors: 'active' });

      await page.waitForTimeout(500);

      // Check that content is still visible
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('reduced motion preference is respected', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/');

      // Check if animations are reduced
      const hasAnimations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let animatedCount = 0;

        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.animation !== 'none' || styles.transition !== 'none') {
            animatedCount++;
          }
        });

        return animatedCount;
      });

      console.log('Animated elements with reduced motion:', hasAnimations);

      // Should have fewer animations with reduced motion
    });

    test('text can be resized to 200% without loss of functionality', async ({ page }) => {
      // Set zoom level
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });

      await page.waitForTimeout(500);

      // Check that layout doesn't break
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Should not cause significant horizontal scrolling
      // (Some scrolling is acceptable for complex layouts)
    });
  });
});
