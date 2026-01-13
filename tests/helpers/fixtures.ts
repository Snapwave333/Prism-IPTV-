/**
 * Custom Playwright Fixtures
 * Extends base test with custom functionality
 */

import { test as base, expect } from '@playwright/test';
import { injectAxe } from 'axe-playwright';
import { setupMocks, waitForAppReady, captureConsoleLogs, captureNetworkErrors } from './test-utils';

type CustomFixtures = {
  appPage: AppPage;
  mockData: void;
  consoleLogs: string[];
  networkErrors: Array<{ url: string; error: string }>;
};

/**
 * App Page Object Model
 */
export class AppPage {
  constructor(public page: any) {}

  // Navigation methods
  async goto(path = '/') {
    await this.page.goto(path);
    await waitForAppReady(this.page);
  }

  async gotoWithMocks(path = '/') {
    await setupMocks(this.page);
    await this.goto(path);
  }

  // Sidebar navigation
  async navigateToLiveTV() {
    await this.page.click('aside >> text=Live TV');
  }

  async navigateToRadio() {
    await this.page.click('aside >> text=Radio');
  }

  async navigateToPodcasts() {
    await this.page.click('aside >> text=Podcasts');
  }

  async navigateToSports() {
    await this.page.click('aside >> text=Sports');
  }

  async navigateToFavorites() {
    await this.page.click('aside >> text=Favorites');
  }

  async navigateToTVGuide() {
    await this.page.click('aside >> text=TV Guide');
  }

  async navigateToSettings() {
    await this.page.click('aside >> text=Settings');
  }

  // Player controls
  async playPause() {
    const btn = this.page.locator('button[aria-label*="Play"], button[aria-label*="Pause"]').first();
    await btn.click();
  }

  async mute() {
    await this.page.getByLabel('Mute').click();
  }

  async unmute() {
    await this.page.getByLabel('Unmute').click();
  }

  async setVolume(value: number) {
    await this.page.locator('input[type="range"][aria-label*="Volume"]').fill(value.toString());
  }

  async fullscreen() {
    await this.page.getByLabel('Fullscreen').click();
  }

  // Channel operations
  async selectChannel(index: number) {
    await this.page.locator('div[class*="channelItem"]').nth(index).click();
  }

  async getActiveChannel() {
    return this.page.locator('div[class*="channelItem"][class*="active"]');
  }

  async toggleFavorite(channelIndex: number) {
    const channel = this.page.locator('div[class*="channelItem"]').nth(channelIndex);
    await channel.locator('button[aria-label*="favorites"]').click();
  }

  // Lumen/AI interactions
  async waitForLumenReady(timeout = 30000) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), timeout);

      this.page.on('console', (msg: any) => {
        if (msg.text().includes('VRM loaded') || msg.text().includes('VRM Load Progress: 100%')) {
          clearTimeout(timeoutId);
          resolve(true);
        }
      });
    });
  }

  async sendLumenMessage(message: string) {
    // Assuming there's a chat input in LumenChat component
    await this.page.fill('input[placeholder*="chat"]', message);
    await this.page.press('input[placeholder*="chat"]', 'Enter');
  }

  // WebGL/3D checks
  async isCanvasRendering() {
    const canvas = this.page.locator('canvas');
    await expect(canvas).toBeVisible();

    return await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
  }

  async getCanvasDimensions() {
    return await this.page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => ({
      width: canvas.width,
      height: canvas.height,
    }));
  }

  // Utility methods
  async waitForNoLoadingSpinners() {
    await this.page.locator('text=Loading').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }

  async captureScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  async getLocalStorageItem(key: string) {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string) {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Accessibility helpers
  async injectAxe() {
    await injectAxe(this.page);
  }
}

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<CustomFixtures>({
  // App page fixture
  appPage: async ({ page }, use) => {
    const appPage = new AppPage(page);
    await use(appPage);
  },

  // Auto-mock data for all tests
  mockData: async ({ page }, use) => {
    await setupMocks(page);
    await use();
  },

  // Auto-capture console logs
  consoleLogs: async ({ page }, use) => {
    const logs = captureConsoleLogs(page);
    await use(logs);
  },

  // Auto-capture network errors
  networkErrors: async ({ page }, use) => {
    const errors = captureNetworkErrors(page);
    await use(errors);
  },
});

export { expect };
