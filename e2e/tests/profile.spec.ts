import { test, expect } from '@playwright/test';

const UNIQUE = Date.now() + Math.floor(Math.random() * 10000);
const PROFILE_USER = {
  username: `ProfileE2E${UNIQUE}`,
  email: `profile${UNIQUE}@test.com`,
  password: 'profilePass123',
};

test.describe('Profile System', () => {
  test.beforeAll(async ({ browser, request }) => {
    // Register user via API
    const res = await request.post('http://localhost:5000/api/users/register', {
      data: PROFILE_USER,
    });
    expect(res.status()).toBe(201);
  });

  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto('/login');
    await page.fill('input[name="email"]', PROFILE_USER.email);
    await page.fill('input[name="password"]', PROFILE_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/home/, { timeout: 15000 });
  });

  test('view own profile via navbar dropdown', async ({ page }) => {
    // Click avatar to open dropdown
    await page.locator('.nav-avatar-circle').first().click();

    // Click Profile in dropdown
    await page.locator('.dropdown-item:has-text("Profile")').first().click();

    // Should navigate to profile page showing own username
    await expect(page.locator(`text=${PROFILE_USER.username}`).first()).toBeVisible({ timeout: 10000 });
    // Own profile shows Edit profile button
    await expect(page.locator('text=Edit profile').first()).toBeVisible({ timeout: 5000 });
  });

  test('edit profile - inline edit mode', async ({ page }) => {
    // Navigate to own profile via navbar dropdown (same as passing test)
    await page.locator('.nav-avatar-circle').first().click();
    await page.locator('.dropdown-item:has-text("Profile")').first().click();

    await expect(page.locator('text=Edit profile').first()).toBeVisible({ timeout: 10000 });
    await page.locator('text=Edit profile').first().click();

    // Edit mode should show Save changes and sections
    await expect(page.locator('text=Save changes').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Change Password').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Change Email').first()).toBeVisible({ timeout: 3000 });
  });

  test('other profile does not show Edit profile button', async ({ page }) => {
    // Go to someone else's profile (non-existent user ID)
    await page.goto('/profile/999999999999999999999999');

    // Should NOT show Edit profile button
    await expect(page.locator('text=Edit profile')).not.toBeVisible({ timeout: 5000 });
  });
});
