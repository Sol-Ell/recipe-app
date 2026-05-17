import { test, expect } from '@playwright/test';

const UNIQUE = Date.now() + Math.floor(Math.random() * 10000);
const TEST_USER = {
  username: `E2EUser${UNIQUE}`,
  email: `e2e${UNIQUE}@test.com`,
  password: 'testPass123',
};

test.describe('Authentication System', () => {
  test('register via API then login via UI', async ({ page, request }) => {
    // First, register via direct API call to debug
    const res = await request.post('http://localhost:5000/api/users/register', {
      data: TEST_USER,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.token).toBeDefined();

    // Set token in localStorage and go to home
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, body.token);
    await page.goto('/home');

    // Should see create recipe button as logged-in user
    await expect(page.locator('.create-recipe-btn')).toBeVisible({ timeout: 10000 });

    // === LOGOUT ===
    await page.locator('.nav-avatar-circle').first().click();
    await page.locator('.logout-item').first().click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // === LOGIN via UI ===
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/home/, { timeout: 15000 });
    await expect(page.locator('.create-recipe-btn')).toBeVisible({ timeout: 10000 });
  });

  test('full register flow via UI', async ({ page }) => {
    const UI_UNIQUE = Date.now() + Math.floor(Math.random() * 10000) + 1;
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Nice to meet you');

    await page.fill('input[name="username"]', `UIUser${UI_UNIQUE}`);
    await page.fill('input[name="email"]', `uiuser${UI_UNIQUE}@test.com`);
    await page.fill('input[name="password"]', 'testPass123');
    await page.fill('input[name="passwordverif"]', 'testPass123');

    // Listen for server response
    const responsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/users/register') && resp.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');

    const response = await responsePromise;
    const status = response.status();
    const respBody = await response.json().catch(() => ({}));

    if (status !== 201 && status !== 200) {
      // Check UI for error
      const errorEl = page.locator('.error-text-minimal');
      if (await errorEl.isVisible().catch(() => false)) {
        const msg = await errorEl.textContent();
        throw new Error(`UI Register failed [${status}]: ${msg}. Body: ${JSON.stringify(respBody)}`);
      }
      throw new Error(`Register API returned ${status}: ${JSON.stringify(respBody)}`);
    }

    // Wait for navigation
    await page.waitForURL(/\/home/, { timeout: 15000 }).catch(async () => {
      // Still on register? Check for error
      const errorEl = page.locator('.error-text-minimal');
      if (await errorEl.isVisible().catch(() => false)) {
        throw new Error(`Register UI error: ${await errorEl.textContent()}`);
      }
      throw new Error('Registration succeeded but navigation to /home timed out. Current URL: ' + page.url());
    });

    await expect(page.locator('.create-recipe-btn')).toBeVisible({ timeout: 10000 });
  });

  test('guest user sees limited home page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/home');

    await expect(page.locator('text=Hungry for more?')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Sign In to See More')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@noexist.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-text-minimal').first()).toBeVisible({ timeout: 10000 });
  });
});
