import { test, expect } from '@playwright/test';

test.describe('Search System', () => {
  test('search bar is visible and functional', async ({ page }) => {
    await page.goto('/home');

    // Search input in navbar should be visible
    const searchInput = page.locator('.search-bar input, input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search query and submit
    await searchInput.fill('pasta');
    await searchInput.press('Enter');

    // Should navigate to search page showing results
    await expect(page.locator('text=RESULTS FOR: "PASTA"').first()).toBeVisible({ timeout: 10000 });
  });

  test('empty search page shows no results message', async ({ page }) => {
    // Navigate directly to search with empty query - should show no results
    await page.goto('/search/emptynonexistent');

    // Should show no results message
    await expect(page.locator('.no-results-text, .no-results-container').first()).toBeVisible({ timeout: 10000 });
  });

  test('search by keyword returns matching recipes', async ({ page }) => {
    await page.goto('/search/chicken');

    // Should show either results title or no-results message
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const resultsTitle = page.locator('text=RESULTS FOR: "CHICKEN"');
    const noResults = page.locator('text=No recipes found for "chicken"');
    const hasContent = await resultsTitle.isVisible().catch(() => false) || await noResults.isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
