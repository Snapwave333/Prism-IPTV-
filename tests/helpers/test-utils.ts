/**
 * Comprehensive Test Utilities
 * Shared helpers for Playwright E2E tests
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Mock M3U playlist data for testing
 */
export const MOCK_M3U_PLAYLIST = `#EXTM3U
#EXTINF:-1 tvg-id="test1" tvg-logo="https://example.com/logo1.png" group-title="News",Test Channel 1
http://example.com/stream1.m3u8
#EXTINF:-1 tvg-id="test2" tvg-logo="https://example.com/logo2.png" group-title="Sports",Sports Channel
http://example.com/stream2.m3u8
#EXTINF:-1 tvg-id="test3" tvg-logo="https://example.com/logo3.png" group-title="Entertainment",Entertainment Channel
http://example.com/stream3.m3u8
#EXTINF:-1 tvg-id="test4" tvg-logo="https://example.com/logo4.png" group-title="Movies",Movie Channel
http://example.com/stream4.m3u8`;

/**
 * Mock HLS stream response
 */
export const MOCK_HLS_STREAM = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
segment0.ts
#EXTINF:10.0,
segment1.ts
#EXT-X-ENDLIST`;

/**
 * Mock EPG (Electronic Program Guide) data
 */
export const MOCK_EPG_DATA = {
  channels: [
    {
      id: 'test1',
      name: 'Test Channel 1',
      programs: [
        {
          id: 'prog1',
          title: 'Morning News',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
          description: 'Latest news and updates',
          category: 'News'
        }
      ]
    }
  ]
};

/**
 * Mock radio station data
 */
export const MOCK_RADIO_STATIONS = [
  {
    stationuuid: 'radio1',
    name: 'Test Radio Station',
    url: 'http://example.com/radio1.mp3',
    favicon: 'https://example.com/radio1.png',
    country: 'USA',
    language: 'english',
    tags: 'pop,music'
  }
];

/**
 * Setup common route mocks for testing
 */
export async function setupMocks(page: Page) {
  // Mock M3U playlist
  await page.route('**/us.m3u', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: MOCK_M3U_PLAYLIST,
    });
  });

  // Mock music category playlist
  await page.route('**/music.m3u', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: MOCK_M3U_PLAYLIST,
    });
  });

  // Mock HLS streams
  await page.route('**/stream*.m3u8', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.apple.mpegurl',
      body: MOCK_HLS_STREAM,
    });
  });

  // Mock HLS segments
  await page.route('**/segment*.ts', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'video/MP2T',
      body: Buffer.from([]),
    });
  });

  // Mock EPG data
  await page.route('**/api/epg', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_EPG_DATA),
    });
  });

  // Mock radio station API
  await page.route('**/radio-browser.info/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RADIO_STATIONS),
    });
  });

  // Mock iTunes podcast API
  await page.route('**/itunes.apple.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });
}

/**
 * Wait for app to be fully loaded and interactive
 */
export async function waitForAppReady(page: Page) {
  // Wait for React to hydrate
  await page.waitForLoadState('networkidle');

  // Wait for 3D canvas to be present
  await expect(page.locator('canvas')).toBeVisible();

  // Wait for sidebar to be interactive
  await expect(page.locator('aside')).toBeVisible();

  // Wait for any loading spinners to disappear
  await page.locator('text=Loading').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

/**
 * Wait for channels to load in channel list
 */
export async function waitForChannelsLoaded(page: Page) {
  await page.locator('text=Loading Channels...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await expect(page.locator('div[class*="channelItem"]').first()).toBeVisible({ timeout: 15000 });
}

/**
 * Wait for VRM mascot (Lumen) to load
 */
export async function waitForVRMLoaded(page: Page, timeout = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), timeout);

    page.on('console', (msg) => {
      if (msg.text().includes('VRM Load Progress: 100%') || msg.text().includes('VRM loaded')) {
        clearTimeout(timeoutId);
        resolve(true);
      }
    });
  });
}

/**
 * Capture console messages for debugging
 */
export function captureConsoleLogs(page: Page, filter?: (msg: string) => boolean) {
  const logs: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (!filter || filter(text)) {
      logs.push(text);
    }
  });

  return logs;
}

/**
 * Capture network errors
 */
export function captureNetworkErrors(page: Page) {
  const errors: Array<{ url: string; error: string }> = [];

  page.on('requestfailed', (request) => {
    errors.push({
      url: request.url(),
      error: request.failure()?.errorText || 'Unknown error',
    });
  });

  return errors;
}

/**
 * Get WebGL context information
 */
export async function getWebGLInfo(page: Page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    };
  });
}

/**
 * Check if WebGL is working
 */
export async function isWebGLWorking(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return gl !== null;
  });
}

/**
 * Get player state from Zustand store
 */
export async function getPlayerState(page: Page) {
  return await page.evaluate(() => {
    // Access Zustand store from window (requires dev tools)
    return (window as any).__PLAYER_STATE__ || null;
  });
}

/**
 * Trigger keyboard shortcut
 */
export async function pressShortcut(page: Page, key: string, modifiers?: string[]) {
  const mod = modifiers?.join('+') || '';
  const fullKey = mod ? `${mod}+${key}` : key;
  await page.keyboard.press(fullKey);
}

/**
 * Wait for WebSocket connection
 */
export async function waitForWebSocketConnection(page: Page, timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), timeout);

    page.on('websocket', (ws) => {
      clearTimeout(timeoutId);
      resolve(true);
    });
  });
}

/**
 * Mock WebSocket messages
 */
export async function mockWebSocketMessage(page: Page, message: any) {
  await page.evaluate((msg) => {
    const event = new MessageEvent('message', {
      data: JSON.stringify(msg),
    });
    window.dispatchEvent(event);
  }, message);
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintData = performance.getEntriesByType('paint');

    return {
      // Navigation timing
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,

      // Paint timing
      firstPaint: paintData.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintData.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,

      // Resource timing
      totalDuration: perfData.duration,
      transferSize: (perfData as any).transferSize || 0,
      encodedBodySize: (perfData as any).encodedBodySize || 0,
      decodedBodySize: (perfData as any).decodedBodySize || 0,
    };
  });
}

/**
 * Get memory usage (Chrome only)
 */
export async function getMemoryUsage(page: Page) {
  return await page.evaluate(() => {
    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  });
}

/**
 * Wait for animation frame
 */
export async function waitForAnimationFrame(page: Page, frames = 1) {
  await page.evaluate((count) => {
    return new Promise((resolve) => {
      let remaining = count;
      function tick() {
        if (--remaining <= 0) {
          resolve(undefined);
        } else {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
    });
  }, frames);
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(locator: Locator): Promise<boolean> {
  return await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/**
 * Wait for specific console message
 */
export async function waitForConsoleMessage(
  page: Page,
  matcher: string | RegExp,
  timeout = 10000
): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), timeout);

    page.on('console', (msg) => {
      const text = msg.text();
      const matches = typeof matcher === 'string'
        ? text.includes(matcher)
        : matcher.test(text);

      if (matches) {
        clearTimeout(timeoutId);
        resolve(true);
      }
    });
  });
}

/**
 * Test data generators
 */
export const generators = {
  randomEmail: () => `test.${Date.now()}@example.com`,
  randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  randomNumber: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Assert that an element has specific CSS property value
   */
  async toHaveCSSProperty(locator: Locator, property: string, value: string) {
    const actualValue = await locator.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
    expect(actualValue).toBe(value);
  },

  /**
   * Assert that page has no console errors
   */
  async toHaveNoConsoleErrors(page: Page, excludePatterns: RegExp[] = []) {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        const excluded = excludePatterns.some(pattern => pattern.test(text));
        if (!excluded) {
          errors.push(text);
        }
      }
    });

    // Wait a bit for any errors to appear
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  },
};
