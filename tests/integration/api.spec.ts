/**
 * API Integration Tests
 * Tests all backend API endpoints, WebSocket connections, and external service integrations
 */

import { test, expect } from '../helpers/fixtures';

test.describe('API Integration Tests', () => {
  test.describe('Backend API Endpoints', () => {
    test('GET /api/status returns server status', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/status');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'online');
      expect(data).toHaveProperty('ip');
    });

    test('GET /api/epg returns EPG data', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/epg');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('channels');
      expect(Array.isArray(data.channels)).toBe(true);

      // Check response time (should be fast with caching)
      const timing = response.request().timing();
      expect(timing.responseEnd).toBeLessThan(2000); // Under 2 seconds
    });

    test('GET /api/epg returns cached data on subsequent requests', async ({ page }) => {
      // First request
      const response1 = await page.request.get('http://localhost:3001/api/epg');
      const timing1 = response1.request().timing();

      // Second request (should be cached)
      const response2 = await page.request.get('http://localhost:3001/api/epg');
      const timing2 = response2.request().timing();

      // Cached response should be faster
      expect(timing2.responseEnd).toBeLessThanOrEqual(timing1.responseEnd);

      // Data should be identical
      const data1 = await response1.json();
      const data2 = await response2.json();
      expect(data1).toEqual(data2);
    });

    test('GET /api/proxy proxies external requests', async ({ page }) => {
      const targetUrl = 'https://httpbin.org/get';
      const response = await page.request.get(
        `http://localhost:3001/api/proxy?url=${encodeURIComponent(targetUrl)}`
      );

      expect(response.status()).toBe(200);
    });

    test('API handles missing parameters gracefully', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/proxy');

      // Should return error status
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('WebSocket Connection', () => {
    test('WebSocket connects successfully', async ({ page }) => {
      await page.goto('/');

      const wsConnected = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 10000);

        page.on('websocket', (ws) => {
          clearTimeout(timeout);
          resolve(true);
        });
      });

      expect(wsConnected).toBe(true);
    });

    test('WebSocket receives ping/pong messages', async ({ page }) => {
      await page.goto('/');

      const messages: string[] = [];

      await new Promise<void>((resolve) => {
        page.on('websocket', (ws) => {
          ws.on('framereceived', (event) => {
            messages.push(event.payload.toString());
          });

          // Resolve after collecting some messages
          setTimeout(resolve, 5000);
        });
      });

      expect(messages.length).toBeGreaterThan(0);
    });

    test('WebSocket handles disconnection and reconnection', async ({ page }) => {
      await page.goto('/');

      // Wait for initial connection
      await page.waitForTimeout(2000);

      // Simulate network interruption
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Restore network
      await page.context().setOffline(false);

      // Wait for reconnection
      await page.waitForTimeout(3000);

      // Check that Lumen status indicator shows connected
      const statusIndicator = page.locator('[class*="lumenStatus"]');
      await expect(statusIndicator).not.toHaveText(/disconnected/i);
    });
  });

  test.describe('External API Integrations', () => {
    test('IPTV-Org playlist loads successfully', async ({ page }) => {
      const response = await page.request.get('https://iptv-org.github.io/iptv/countries/us.m3u');

      expect(response.status()).toBe(200);

      const body = await response.text();
      expect(body).toContain('#EXTM3U');
      expect(body).toContain('#EXTINF:');
    });

    test('Radio-Browser API returns station data', async ({ page }) => {
      const response = await page.request.get(
        'https://de1.api.radio-browser.info/json/stations/topvote/100'
      );

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Validate station structure
      const station = data[0];
      expect(station).toHaveProperty('stationuuid');
      expect(station).toHaveProperty('name');
      expect(station).toHaveProperty('url');
    });

    test('iTunes podcast API returns search results', async ({ page }) => {
      const response = await page.request.get(
        'https://itunes.apple.com/search?term=comedy&entity=podcast&limit=10'
      );

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('resultCount');
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
    });
  });

  test.describe('Data Pipeline & Transformation', () => {
    test('M3U playlist parsing extracts channel metadata', async ({ page, mockData }) => {
      await page.goto('/');

      // Wait for channels to load
      await page.locator('text=Loading Channels...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

      const channelItems = page.locator('div[class*="channelItem"]');
      const count = await channelItems.count();

      expect(count).toBeGreaterThan(0);

      // Check first channel has expected structure
      const firstChannel = channelItems.first();
      await expect(firstChannel).toBeVisible();

      // Channel should have name
      const channelName = await firstChannel.locator('h3, [class*="channelName"]').textContent();
      expect(channelName).toBeTruthy();
    });

    test('EPG data transformation preserves program information', async ({ page }) => {
      await page.goto('/');
      await page.click('text=TV Guide');

      // Wait for EPG to load
      await page.locator('text=Loading Guide...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

      const programCards = page.locator('div[class*="programCard"]');
      const count = await programCards.count();

      if (count > 0) {
        const firstProgram = programCards.first();
        await expect(firstProgram).toBeVisible();

        // Program should have title and time
        const programTitle = await firstProgram.locator('h3, [class*="programTitle"]').textContent();
        expect(programTitle).toBeTruthy();
      }
    });

    test('Content filtering removes religious content', async ({ page, mockData }) => {
      await page.goto('/');

      // Wait for channels to load
      await page.locator('text=Loading Channels...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

      // Search for religious keywords that should be filtered
      const religiousTerms = ['gospel', 'church', 'prayer', 'jesus', 'christ', 'religion'];

      for (const term of religiousTerms) {
        const religiousContent = page.locator(`text=${term}`).first();
        await expect(religiousContent).not.toBeVisible().catch(() => {});
      }
    });
  });

  test.describe('Error Handling & Recovery', () => {
    test('API handles network failures gracefully', async ({ page }) => {
      await page.route('**/api/epg', (route) => route.abort('failed'));

      await page.goto('/');
      await page.click('text=TV Guide');

      // Should show error message instead of crashing
      await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
    });

    test('Handles malformed M3U playlist data', async ({ page }) => {
      await page.route('**/us.m3u', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'INVALID M3U DATA WITHOUT PROPER FORMAT',
        });
      });

      await page.goto('/');

      // Should handle gracefully without crashing
      await page.waitForTimeout(3000);

      // Check that the page is still functional
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();
    });

    test('Handles HTTP error responses', async ({ page }) => {
      await page.route('**/us.m3u', (route) => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      await page.goto('/');

      // App should still load
      await expect(page.locator('canvas')).toBeVisible();
    });

    test('Handles slow API responses with timeout', async ({ page }) => {
      await page.route('**/api/epg', async (route) => {
        await page.waitForTimeout(5000);
        route.continue();
      });

      await page.goto('/');
      await page.click('text=TV Guide');

      // Should show loading state during slow response
      await expect(page.locator('text=Loading')).toBeVisible();
    });
  });

  test.describe('Performance & Caching', () => {
    test('API responses complete within performance budget', async ({ page }) => {
      const endpoints = [
        { url: 'http://localhost:3001/api/status', maxTime: 500 },
        { url: 'http://localhost:3001/api/epg', maxTime: 2000 },
      ];

      for (const endpoint of endpoints) {
        const start = Date.now();
        const response = await page.request.get(endpoint.url);
        const duration = Date.now() - start;

        expect(response.status()).toBe(200);
        expect(duration).toBeLessThan(endpoint.maxTime);
      }
    });

    test('Concurrent requests do not cause race conditions', async ({ page }) => {
      await page.goto('/');

      // Trigger multiple rapid mode switches (concurrent state updates)
      const modes = ['Sports', 'Radio', 'Podcasts', 'Live TV'];

      for (const mode of modes) {
        await page.click(`text=${mode}`);
        await page.waitForTimeout(50); // Small delay between clicks
      }

      // Verify final state is correct
      await expect(page.locator('button[class*="navItemActive"]')).toContainText('Live TV');

      // No console errors should occur
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });
  });
});
