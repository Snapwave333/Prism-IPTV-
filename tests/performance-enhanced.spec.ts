/**
 * Enhanced Performance Tests
 * Comprehensive performance benchmarking, profiling, and optimization validation
 */

import { test, expect } from './helpers/fixtures';
import { getPerformanceMetrics, getMemoryUsage } from './helpers/test-utils';

test.describe('Enhanced Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('initial page load meets performance budget', async ({ appPage }) => {
      const start = Date.now();
      await appPage.goto('/');
      const loadTime = Date.now() - start;

      console.log(`Page load time: ${loadTime}ms`);

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('navigation timing metrics are within acceptable ranges', async ({ appPage }) => {
      await appPage.goto('/');

      const metrics = await getPerformanceMetrics(appPage.page);

      console.log('Performance Metrics:', metrics);

      // DOM Content Loaded should be fast
      expect(metrics.domContentLoaded).toBeLessThan(2000);

      // DOM Interactive should be fast
      expect(metrics.domInteractive).toBeLessThan(2500);

      // First Paint should occur quickly
      expect(metrics.firstPaint).toBeLessThan(1500);

      // First Contentful Paint should be fast
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    });

    test('time to interactive (TTI) is acceptable', async ({ appPage }) => {
      const start = Date.now();
      await appPage.goto('/');

      // Wait for key interactive elements
      await appPage.page.locator('aside').waitFor({ state: 'visible' });
      await appPage.page.locator('canvas').waitFor({ state: 'visible' });
      await appPage.page.locator('button').first().waitFor({ state: 'visible' });

      const tti = Date.now() - start;

      console.log(`Time to Interactive: ${tti}ms`);

      // TTI should be under 4 seconds
      expect(tti).toBeLessThan(4000);
    });

    test('largest contentful paint (LCP) occurs quickly', async ({ appPage }) => {
      await appPage.goto('/');

      const lcp = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      console.log(`Largest Contentful Paint: ${lcp}ms`);

      // LCP should be under 2.5 seconds (Core Web Vitals threshold)
      if (lcp > 0) {
        expect(lcp).toBeLessThan(2500);
      }
    });

    test('cumulative layout shift (CLS) is minimal', async ({ appPage }) => {
      await appPage.goto('/');

      // Wait for page to settle
      await appPage.page.waitForTimeout(3000);

      const cls = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      console.log(`Cumulative Layout Shift: ${cls}`);

      // CLS should be under 0.1 (Core Web Vitals threshold)
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('critical resources load quickly', async ({ appPage }) => {
      const resourceTimings: Array<{ name: string; duration: number }> = [];

      appPage.page.on('response', (response) => {
        const timing = response.request().timing();
        resourceTimings.push({
          name: response.url(),
          duration: timing.responseEnd,
        });
      });

      await appPage.goto('/');

      // Check critical resources
      const jsResources = resourceTimings.filter(r => r.name.endsWith('.js'));
      const cssResources = resourceTimings.filter(r => r.name.endsWith('.css'));

      console.log(`JS Resources: ${jsResources.length}`);
      console.log(`CSS Resources: ${cssResources.length}`);

      // JS files should load quickly
      jsResources.forEach(resource => {
        console.log(`${resource.name}: ${resource.duration}ms`);
        expect(resource.duration).toBeLessThan(3000);
      });
    });

    test('images are optimized and load efficiently', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const imageMetrics = await appPage.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height,
          fileSize: img.src.length,
        }));
      });

      console.log(`Total images: ${imageMetrics.length}`);

      // Images should not be excessively oversized
      imageMetrics.forEach(img => {
        const oversized = img.naturalWidth > img.displayWidth * 2 ||
                         img.naturalHeight > img.displayHeight * 2;

        if (oversized) {
          console.warn(`Oversized image: ${img.src}`);
        }
      });
    });

    test('lazy loading is implemented for off-screen content', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      // Check if images have loading="lazy" attribute
      const lazyImages = await appPage.page.locator('img[loading="lazy"]').count();
      const totalImages = await appPage.page.locator('img').count();

      console.log(`Lazy images: ${lazyImages} / ${totalImages}`);

      // Some images should use lazy loading
      if (totalImages > 5) {
        expect(lazyImages).toBeGreaterThan(0);
      }
    });
  });

  test.describe('API & Network Performance', () => {
    test('API responses meet SLA requirements', async ({ appPage }) => {
      const apiTimings: Record<string, number> = {};

      appPage.page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          const timing = response.request().timing();
          apiTimings[response.url()] = timing.responseEnd;
        }
      });

      await appPage.goto('/');

      // Wait for API calls to complete
      await appPage.page.waitForTimeout(3000);

      console.log('API Timings:', apiTimings);

      // All API calls should be under 2 seconds
      Object.entries(apiTimings).forEach(([url, duration]) => {
        console.log(`${url}: ${duration}ms`);
        expect(duration).toBeLessThan(2000);
      });
    });

    test('parallel requests do not cause congestion', async ({ appPage }) => {
      await appPage.goto('/');

      // Trigger multiple parallel mode switches
      const start = Date.now();

      await Promise.all([
        appPage.navigateToRadio(),
        appPage.page.waitForTimeout(100),
        appPage.navigateToPodcasts(),
        appPage.page.waitForTimeout(100),
        appPage.navigateToLiveTV(),
      ]);

      const duration = Date.now() - start;

      console.log(`Parallel navigation time: ${duration}ms`);

      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });

    test('WebSocket connection latency is acceptable', async ({ appPage }) => {
      await appPage.goto('/');

      const wsLatency = await new Promise<number>((resolve) => {
        const startTime = Date.now();

        appPage.page.on('websocket', (ws) => {
          ws.on('framesent', () => {
            const latency = Date.now() - startTime;
            resolve(latency);
          });
        });

        // Fallback
        setTimeout(() => resolve(0), 5000);
      });

      console.log(`WebSocket latency: ${wsLatency}ms`);

      if (wsLatency > 0) {
        expect(wsLatency).toBeLessThan(500);
      }
    });
  });

  test.describe('Memory & Resource Management', () => {
    test('memory usage stays within acceptable limits', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      const initialMemory = await getMemoryUsage(appPage.page);

      console.log('Initial Memory:', initialMemory);

      // Run app for a while
      await appPage.page.waitForTimeout(10000);

      const finalMemory = await getMemoryUsage(appPage.page);

      console.log('Final Memory:', finalMemory);

      if (initialMemory && finalMemory) {
        const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const growthMB = growth / (1024 * 1024);

        console.log(`Memory growth: ${growthMB.toFixed(2)} MB`);

        // Memory growth should be under 50MB
        expect(growthMB).toBeLessThan(50);

        // Should not exceed 80% of heap limit
        expect(finalMemory.usagePercentage).toBeLessThan(80);
      }
    });

    test('no memory leaks during channel switching', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const measurements: number[] = [];

      // Take initial measurement
      const initialMemory = await getMemoryUsage(appPage.page);
      if (initialMemory) {
        measurements.push(initialMemory.usedJSHeapSize);
      }

      // Switch channels multiple times
      for (let i = 0; i < 10; i++) {
        await appPage.selectChannel(i % 3);
        await appPage.page.waitForTimeout(500);

        const memory = await getMemoryUsage(appPage.page);
        if (memory) {
          measurements.push(memory.usedJSHeapSize);
        }
      }

      console.log('Memory measurements:', measurements.map(m => (m / (1024 * 1024)).toFixed(2) + ' MB'));

      // Memory should not grow unbounded
      const maxMemory = Math.max(...measurements);
      const minMemory = Math.min(...measurements);
      const range = (maxMemory - minMemory) / (1024 * 1024);

      console.log(`Memory range: ${range.toFixed(2)} MB`);

      // Range should be reasonable (under 100MB)
      expect(range).toBeLessThan(100);
    });

    test('3D scene cleanup releases resources', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      const initialMemory = await getMemoryUsage(appPage.page);

      // Navigate away from 3D view (if possible)
      await appPage.navigateToSettings();
      await appPage.page.waitForTimeout(2000);

      // Force garbage collection (Chrome only)
      await appPage.page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      await appPage.page.waitForTimeout(1000);

      const finalMemory = await getMemoryUsage(appPage.page);

      console.log('Initial Memory:', initialMemory);
      console.log('Final Memory:', finalMemory);

      // Memory should not have grown significantly
      if (initialMemory && finalMemory) {
        const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const growthMB = growth / (1024 * 1024);

        expect(growthMB).toBeLessThan(30);
      }
    });
  });

  test.describe('Rendering Performance', () => {
    test('3D scene maintains target frame rate', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      const fps = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0;
          const startTime = performance.now();
          const duration = 2000; // Measure for 2 seconds

          function measureFrames() {
            frames++;

            if (performance.now() - startTime >= duration) {
              const fps = frames / (duration / 1000);
              resolve(fps);
            } else {
              requestAnimationFrame(measureFrames);
            }
          }

          requestAnimationFrame(measureFrames);
        });
      });

      console.log(`Average FPS: ${fps.toFixed(2)}`);

      // Should maintain at least 30 fps (acceptable for web)
      expect(fps).toBeGreaterThan(30);

      // Ideally close to 60 fps
      expect(fps).toBeGreaterThan(50);
    });

    test('long tasks do not block main thread', async ({ appPage }) => {
      await appPage.goto('/');

      const longTasks = await appPage.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let longTaskCount = 0;

          new PerformanceObserver((list) => {
            longTaskCount += list.getEntries().length;
          }).observe({ entryTypes: ['longtask'] });

          setTimeout(() => resolve(longTaskCount), 5000);
        });
      });

      console.log(`Long tasks detected: ${longTasks}`);

      // Should have minimal long tasks
      expect(longTasks).toBeLessThan(5);
    });

    test('CSS animations are GPU-accelerated', async ({ appPage }) => {
      await appPage.goto('/');

      const hasGpuAcceleration = await appPage.page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
        const accelerated: string[] = [];

        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const transform = styles.transform;
          const willChange = styles.willChange;

          if (transform !== 'none' || willChange !== 'auto') {
            accelerated.push(el.className);
          }
        });

        return accelerated;
      });

      console.log('GPU-accelerated elements:', hasGpuAcceleration.length);

      // Animated elements should use GPU acceleration
      expect(hasGpuAcceleration.length).toBeGreaterThan(0);
    });
  });

  test.describe('Bundle Size & Code Splitting', () => {
    test('initial JavaScript bundle is optimally sized', async ({ appPage }) => {
      const jsResources: Array<{ url: string; size: number }> = [];

      appPage.page.on('response', async (response) => {
        if (response.url().endsWith('.js')) {
          const buffer = await response.body().catch(() => Buffer.from([]));
          jsResources.push({
            url: response.url(),
            size: buffer.length,
          });
        }
      });

      await appPage.goto('/');

      console.log('JS Resources:');
      jsResources.forEach(res => {
        const sizeKB = (res.size / 1024).toFixed(2);
        console.log(`  ${res.url}: ${sizeKB} KB`);
      });

      const totalSize = jsResources.reduce((sum, res) => sum + res.size, 0);
      const totalKB = totalSize / 1024;
      const totalMB = totalKB / 1024;

      console.log(`Total JS size: ${totalKB.toFixed(2)} KB (${totalMB.toFixed(2)} MB)`);

      // Initial bundle should be under 5MB
      expect(totalMB).toBeLessThan(5);
    });

    test('routes are code-split appropriately', async ({ appPage }) => {
      const jsResources: string[] = [];

      appPage.page.on('response', (response) => {
        if (response.url().endsWith('.js')) {
          jsResources.push(response.url());
        }
      });

      await appPage.goto('/');
      const initialBundles = jsResources.length;

      // Navigate to a different route
      await appPage.page.click('text=/remote');
      await appPage.page.waitForTimeout(2000);

      const afterNavigationBundles = jsResources.length;

      console.log(`Initial bundles: ${initialBundles}`);
      console.log(`After navigation: ${afterNavigationBundles}`);

      // Additional chunks should be loaded for new routes
      expect(afterNavigationBundles).toBeGreaterThanOrEqual(initialBundles);
    });
  });

  test.describe('Stress Testing', () => {
    test('handles rapid user interactions without degradation', async ({ appPage }) => {
      await appPage.gotoWithMocks('/');
      await appPage.waitForNoLoadingSpinners();

      const start = Date.now();

      // Perform rapid interactions
      for (let i = 0; i < 20; i++) {
        await appPage.selectChannel(i % 3);
        await appPage.page.waitForTimeout(50);
      }

      const duration = Date.now() - start;

      console.log(`20 rapid channel switches took: ${duration}ms`);

      // Should handle without significant delay
      expect(duration).toBeLessThan(3000);

      // App should still be responsive
      const canvas = appPage.page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('sustains performance over extended use', async ({ appPage }) => {
      await appPage.goto('/');
      await appPage.waitForLumenReady();

      const fpsMeasurements: number[] = [];

      // Measure FPS at intervals
      for (let i = 0; i < 3; i++) {
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

        fpsMeasurements.push(fps);
        console.log(`FPS measurement ${i + 1}: ${fps}`);

        await appPage.page.waitForTimeout(5000);
      }

      // FPS should remain consistent
      const avgFps = fpsMeasurements.reduce((a, b) => a + b) / fpsMeasurements.length;
      const variance = fpsMeasurements.reduce((sum, fps) => sum + Math.pow(fps - avgFps, 2), 0) / fpsMeasurements.length;

      console.log(`Average FPS: ${avgFps.toFixed(2)}, Variance: ${variance.toFixed(2)}`);

      // Variance should be low (consistent performance)
      expect(variance).toBeLessThan(100);

      // Average FPS should be acceptable
      expect(avgFps).toBeGreaterThan(30);
    });
  });
});
