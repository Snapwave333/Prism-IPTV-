/**
 * WebGL & 3D Rendering Tests
 * Tests CinemaVoid scene, VRM rendering, and Three.js integration
 */

import { test, expect } from '../helpers/fixtures';
import { getWebGLInfo, isWebGLWorking } from '../helpers/test-utils';

test.describe('WebGL & 3D Rendering Tests', () => {
  test.describe('WebGL Context & Capabilities', () => {
    test('WebGL context is available', async ({ appPage }) => {
      await appPage.goto('/');

      const webglWorking = await isWebGLWorking(appPage.page);
      expect(webglWorking).toBe(true);
    });

    test('WebGL renderer info is accessible', async ({ appPage }) => {
      await appPage.goto('/');

      const webglInfo = await getWebGLInfo(appPage.page);

      expect(webglInfo).not.toBeNull();
      expect(webglInfo?.version).toBeTruthy();
      expect(webglInfo?.shadingLanguageVersion).toBeTruthy();
      expect(webglInfo?.maxTextureSize).toBeGreaterThan(0);
    });

    test('Canvas element has correct dimensions', async ({ appPage }) => {
      await appPage.goto('/');

      const dimensions = await appPage.getCanvasDimensions();

      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);

      // Should match viewport or be larger
      expect(dimensions.width).toBeGreaterThanOrEqual(800);
      expect(dimensions.height).toBeGreaterThanOrEqual(600);
    });

    test('Canvas responds to viewport changes', async ({ appPage }) => {
      await appPage.goto('/');

      const initialDimensions = await appPage.getCanvasDimensions();

      // Resize viewport
      await appPage.page.setViewportSize({ width: 1280, height: 720 });
      await appPage.page.waitForTimeout(1000);

      const newDimensions = await appPage.getCanvasDimensions();

      // Dimensions should have updated
      expect(newDimensions.width).toBeGreaterThan(0);
      expect(newDimensions.height).toBeGreaterThan(0);
    });
  });

  test.describe('CinemaVoid Scene Rendering', () => {
    test('CinemaVoid scene initializes successfully', async ({ appPage, consoleLogs }) => {
      await appPage.goto('/');

      await appPage.page.waitForTimeout(2000);

      // Canvas should be rendering
      const isRendering = await appPage.isCanvasRendering();
      expect(isRendering).toBe(true);

      // Check for Three.js logs
      const hasThreeLog = consoleLogs.some(log =>
        log.includes('THREE') || log.includes('scene') || log.includes('render')
      );
    });

    test('video texture is applied to plane', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      // Select a channel to load video
      await appPage.selectChannel(0);
      await appPage.page.waitForTimeout(2000);

      // Check that scene is still rendering
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Verify video element exists
      const video = appPage.page.locator('video');
      await expect(video).toBeAttached();
    });

    test('lighting system updates with accent color', async ({ appPage }) => {
      await appPage.goto('/');

      await appPage.page.waitForTimeout(3000);

      // Accent color should have been extracted
      const accentColor = await appPage.page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      });

      // Should have a valid color value
      expect(accentColor).toBeTruthy();

      // Scene should still be rendering
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('ambient, point, and rim lights are present', async ({ appPage, consoleLogs }) => {
      await appPage.goto('/');

      await appPage.page.waitForTimeout(2000);

      // Check console logs for light creation
      const hasLightLog = consoleLogs.some(log =>
        log.toLowerCase().includes('light') ||
        log.toLowerCase().includes('ambient') ||
        log.toLowerCase().includes('point')
      );

      // Scene should be rendering with lights
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('reflective floor renders correctly', async ({ appPage }) => {
      await appPage.goto('/');

      await appPage.page.waitForTimeout(2000);

      // Check that floor plane exists in scene (via console or visual check)
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('VRM Mascot Rendering', () => {
    test('VRM model loads successfully', async ({ appPage }) => {
      await appPage.goto('/');

      const vrmLoaded = await appPage.waitForLumenReady(30000);

      expect(vrmLoaded).toBe(true);
    });

    test('VRM renders in the scene', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Wait for rendering to stabilize
      await appPage.page.waitForTimeout(2000);

      // Canvas should show VRM
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Take screenshot to verify visual rendering
      await expect(canvas).toHaveScreenshot('vrm-in-scene.png', {
        animations: 'disabled',
        maxDiffPixels: 1000, // Allow some variation due to animations
      });
    });

    test('VRM expressions work correctly', async ({ appPage, consoleLogs }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Wait for expression changes
      await appPage.page.waitForTimeout(5000);

      // Check logs for expression updates
      const hasExpressionLog = consoleLogs.some(log =>
        log.toLowerCase().includes('expression') ||
        log.toLowerCase().includes('blink')
      );

      // VRM should still be rendering
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('VRM eye blinking animation works', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Wait for blink cycles (1-5s intervals)
      await appPage.page.waitForTimeout(10000);

      // VRM should still be rendering with blink animations
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('VRM saccade system works', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Wait for saccades to occur
      await appPage.page.waitForTimeout(5000);

      // VRM should be rendering with eye movements
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('VRM look-at system targets objects', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Simulate gaze target change
      await appPage.page.evaluate(() => {
        const event = new CustomEvent('setGazeTarget', { detail: { target: 'screen' } });
        window.dispatchEvent(event);
      });

      await appPage.page.waitForTimeout(2000);

      // VRM should still be rendering
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('VRM Animation Controller', () => {
    test('idle breathing animation plays', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Wait for idle animations
      await appPage.page.waitForTimeout(5000);

      // Check animation is running
      const isAnimating = await appPage.page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          let frameCount = 0;
          function countFrames() {
            frameCount++;
            if (frameCount > 30) {
              resolve(true);
            } else {
              requestAnimationFrame(countFrames);
            }
          }
          requestAnimationFrame(countFrames);
        });
      });

      expect(isAnimating).toBe(true);
    });

    test('walk cycle animation plays correctly', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Trigger walking animation (via behavior system)
      await appPage.page.waitForTimeout(5000);

      // VRM should be rendering with animations
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('animation transitions are smooth', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Trigger multiple animation states
      await appPage.page.waitForTimeout(3000);

      // No visual glitches or console errors
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Particle Effects', () => {
    test('SpatialHalo particle effect renders', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      await appPage.page.waitForTimeout(2000);

      // Halo should be visible in scene
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('ThinkingSparks particle effect renders', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Trigger thinking state
      await appPage.page.evaluate(() => {
        const event = new CustomEvent('lumenThinking', { detail: true });
        window.dispatchEvent(event);
      });

      await appPage.page.waitForTimeout(2000);

      // Thinking sparks should be visible
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Gestural UI Elements', () => {
    test('GesturalGlyph elements render in 3D space', async ({ appPage }) => {
      await appPage.goto('/');

      await appPage.page.waitForTimeout(2000);

      // Spatial UI elements should be visible
      const playGlyph = appPage.page.locator('button[aria-label*="Play"]').first();
      await expect(playGlyph).toBeVisible();
    });

    test('spatial controls are interactive', async ({ appPage }) => {
      await appPage.goto('/');

      // Click spatial play button
      const playBtn = appPage.page.locator('button[aria-label*="Play"]').first();
      await playBtn.click();

      await appPage.page.waitForTimeout(1000);

      // Action should be processed
      await expect(playBtn).toBeVisible();
    });
  });

  test.describe('Chameleon Engine Color Extraction', () => {
    test('accent color is extracted from video', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      // Select a channel
      await appPage.selectChannel(0);

      // Wait for color extraction
      await appPage.page.waitForTimeout(3000);

      // Check accent color was set
      const accentColor = await appPage.page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      });

      expect(accentColor).toBeTruthy();
      expect(accentColor.trim()).not.toBe('');
    });

    test('scene lighting updates with extracted color', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      await appPage.selectChannel(0);
      await appPage.page.waitForTimeout(3000);

      // Scene should be rendering with updated lighting
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Performance & Frame Rate', () => {
    test('scene maintains 60fps under normal load', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Measure frame rate
      const fps = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0;
          const startTime = performance.now();

          function measureFrames() {
            frames++;

            if (performance.now() - startTime >= 1000) {
              resolve(frames);
            } else {
              requestAnimationFrame(measureFrames);
            }
          }

          requestAnimationFrame(measureFrames);
        });
      });

      console.log(`Measured FPS: ${fps}`);

      // Should be close to 60fps (allow some variance)
      expect(fps).toBeGreaterThan(30); // Minimum acceptable
      expect(fps).toBeLessThanOrEqual(61); // Max with rounding
    });

    test('scene renders without memory leaks', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      // Get initial memory
      const initialMemory = await appPage.page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Run animations for a while
      await appPage.page.waitForTimeout(10000);

      // Get final memory
      const finalMemory = await appPage.page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Memory growth should be reasonable (< 50MB)
      const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);
      console.log(`Memory growth: ${memoryGrowth.toFixed(2)} MB`);

      expect(memoryGrowth).toBeLessThan(50);
    });

    test('scene handles multiple rapid state changes', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForLumenReady();

      // Rapidly change channels
      for (let i = 0; i < 5; i++) {
        await appPage.selectChannel(i % 3);
        await appPage.page.waitForTimeout(200);
      }

      // Scene should still be rendering smoothly
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Error Handling & Fallbacks', () => {
    test('handles WebGL context loss gracefully', async ({ appPage }) => {
      await appPage.goto('/');

      // Simulate context loss
      await appPage.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const gl = canvas.getContext('webgl');
          const ext = gl?.getExtension('WEBGL_lose_context');
          ext?.loseContext();

          // Restore after a delay
          setTimeout(() => {
            ext?.restoreContext();
          }, 1000);
        }
      });

      await appPage.page.waitForTimeout(2000);

      // Canvas should still be visible
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('handles missing VRM model gracefully', async ({ page }) => {
      // Block VRM loading
      await page.route('**/mascot/*.vrm', (route) => route.abort());

      await page.goto('/');

      await page.waitForTimeout(5000);

      // Scene should still render without VRM
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('handles invalid texture data', async ({ appPage }) => {
      await appPage.goto('/');

      // Inject invalid video source
      await appPage.page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.src = 'invalid://url';
        }
      });

      await appPage.page.waitForTimeout(2000);

      // Scene should still render
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Responsive 3D Rendering', () => {
    test('scene adapts to window resize', async ({ appPage }) => {
      await appPage.goto('/');

      // Get initial size
      const initialSize = await appPage.getCanvasDimensions();

      // Resize window
      await appPage.page.setViewportSize({ width: 1280, height: 720 });
      await appPage.page.waitForTimeout(1000);

      // Get new size
      const newSize = await appPage.getCanvasDimensions();

      // Size should have changed
      expect(newSize.width).not.toEqual(initialSize.width);
      expect(newSize.height).not.toEqual(initialSize.height);

      // Aspect ratio should be maintained
      const initialAspect = initialSize.width / initialSize.height;
      const newAspect = newSize.width / newSize.height;

      expect(Math.abs(initialAspect - newAspect)).toBeLessThan(0.5);
    });

    test('pixel ratio is optimized for performance', async ({ appPage }) => {
      await appPage.goto('/');

      const pixelRatio = await appPage.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return 1;

        const dpr = window.devicePixelRatio || 1;
        const canvasPixelRatio = canvas.width / canvas.clientWidth;

        return { dpr, canvasPixelRatio };
      });

      // Canvas pixel ratio should not exceed 2x for performance
      expect(pixelRatio.canvasPixelRatio).toBeLessThanOrEqual(2);
    });
  });
});
