import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive E2E Test Configuration
 * Supports smoke, integration, visual regression, performance, accessibility, and AI testing
 */
export default defineConfig({
  testDir: './tests',

  // Test organization
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retry configuration for flaky test detection
  retries: process.env.CI ? 2 : 1,

  // Parallel execution optimization
  workers: process.env.CI ? 1 : 4,

  // Test timeout configuration
  timeout: 60000, // 60s per test
  expect: {
    timeout: 10000, // 10s for assertions
  },

  // Comprehensive reporting
  reporter: [
    ['html', {
      open: 'never',
      outputFolder: 'test-results/html-report'
    }],
    ['json', {
      outputFile: 'test-results/results.json'
    }],
    ['junit', {
      outputFile: 'test-results/results.xml'
    }],
    ['list'], // Console output
    ['github'], // GitHub Actions annotations
    // Coverage report (requires custom reporter)
    process.env.CI ? ['blob'] : null,
  ].filter(Boolean),

  // Global settings for all tests
  use: {
    baseURL: 'http://localhost:5173',

    // Comprehensive debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Headless mode by default (can be overridden)
    headless: true,

    // Viewport size
    viewport: { width: 1920, height: 1080 },

    // Accept downloads
    acceptDownloads: true,

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Permissions (microphone not supported in all browsers)
    // permissions: ['microphone', 'notifications'],

    // Geolocation (if needed)
    // geolocation: { latitude: 40.7128, longitude: -74.0060 },

    // Color scheme
    colorScheme: 'dark',

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors (for dev/testing only)
    ignoreHTTPSErrors: true,
  },

  // Test categories via projects
  projects: [
    // === SMOKE TESTS (Critical Path) ===
    {
      name: 'smoke-chromium',
      testMatch: /smoke\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },

    // === DESKTOP BROWSERS ===
    {
      name: 'chromium',
      testIgnore: [
        /smoke\.spec\.ts/,
        /visual-regression\.spec\.ts/,
        /performance\.spec\.ts/,
        /mobile\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },

    {
      name: 'firefox',
      testIgnore: [
        /smoke\.spec\.ts/,
        /visual-regression\.spec\.ts/,
        /performance\.spec\.ts/,
        /mobile\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
      },
    },

    {
      name: 'webkit',
      testIgnore: [
        /smoke\.spec\.ts/,
        /visual-regression\.spec\.ts/,
        /performance\.spec\.ts/,
        /mobile\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Safari'],
        headless: true,
      },
    },

    {
      name: 'edge',
      testIgnore: [
        /smoke\.spec\.ts/,
        /visual-regression\.spec\.ts/,
        /performance\.spec\.ts/,
        /mobile\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        headless: true,
      },
    },

    // === MOBILE BROWSERS ===
    {
      name: 'mobile-chrome',
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        headless: true,
      },
    },

    {
      name: 'mobile-safari',
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices['iPhone 13'],
        headless: true,
      },
    },

    // === VISUAL REGRESSION (Chromium only for consistency) ===
    {
      name: 'visual-regression',
      testMatch: /visual-regression\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 },
      },
    },

    // === PERFORMANCE TESTS (Chromium with specific settings) ===
    {
      name: 'performance',
      testMatch: /performance\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-gpu',
            '--no-sandbox',
          ],
        },
      },
      timeout: 120000, // Extended timeout for performance tests
    },

    // === ACCESSIBILITY TESTS ===
    {
      name: 'accessibility',
      testMatch: /accessibility\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],

  // Web servers for frontend and backend
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:3001/api/status',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    }
  ],

  // Output configuration
  outputDir: 'test-results/artifacts',

  // Fail fast in CI
  maxFailures: process.env.CI ? 10 : undefined,
});
