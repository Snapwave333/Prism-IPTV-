import { test, expect } from '@playwright/test';

test.describe('Spatial Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('WebGL frame consistency (FPS check)', async ({ page }) => {
    // Inject a frame counter script
    const fps = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function loop() {
          frames++;
          const now = performance.now();
          if (now - start >= 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(loop);
          }
        }
        requestAnimationFrame(loop);
      });
    });

    console.log(`Measured FPS: ${fps}`);
    // In CI/Headless, FPS might be lower, so we set a lenient threshold but ensure it's not stalled (e.g. > 10)
    expect(fps).toBeGreaterThan(10);
  });

  test('Memory usage during 3D rendering', async ({ page }) => {
    // Check JS Heap size if available (requires specific browser flags usually, but we'll try standard API)
    const memory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize;
    });

    if (memory) {
        const mb = memory / 1024 / 1024;
        console.log(`Used JS Heap: ${mb.toFixed(2)} MB`);
        expect(mb).toBeLessThan(500); // Threshold: 500MB
    } else {
        console.log('Performance memory API not available in this browser context.');
        test.skip();
    }
  });

  test('Lumen component render cost', async ({ page }) => {
    const start = Date.now();
    
    // Force re-render of Lumen component by toggling a prop (if possible via devtools) 
    // or just measuring strict initial load of the mascot container
    await page.reload();
    await page.locator('canvas').waitFor({ state: 'visible' });
    
    const duration = Date.now() - start;
    console.log(`Scene Hydration Time: ${duration}ms`);
    expect(duration).toBeLessThan(5000);
  });
});
