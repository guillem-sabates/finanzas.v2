import { defineConfig, devices } from '@playwright/test';

// Sirve la carpeta estática y prueba en Chromium, Firefox y WebKit.
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: { baseURL: 'http://127.0.0.1:8080', trace: 'on-first-retry' },
  webServer: {
    command: 'python -m http.server 8080',
    url: 'http://127.0.0.1:8080/index.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // §10: móvil 375px (Pixel 5 ≈ 393px y iPhone SE = 375px)
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone SE'] } },
  ],
});

// v2
