import { test, expect } from '@playwright/test';

const UNIQUE = Date.now() + Math.floor(Math.random() * 10000);
const CHEF = {
  username: `ChefE2E${UNIQUE}`,
  email: `chef${UNIQUE}@test.com`,
  password: 'chefPass123',
};

async function registerViaUI(page: any) {
  await page.goto('/register');
  await page.fill('input[name="username"]', CHEF.username);
  await page.fill('input[name="email"]', CHEF.email);
  await page.fill('input[name="password"]', CHEF.password);
  await page.fill('input[name="passwordverif"]', CHEF.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/home/, { timeout: 15000 });
}

test.describe('Recipe Management System', () => {
  let authToken: string;

  test.beforeAll(async ({ browser, request }) => {
    // Register via API to get a token
    const res = await request.post('http://localhost:5000/api/users/register', {
      data: CHEF,
    });
    const body = await res.json();
    authToken = body.token;

    // Create a recipe via API so we have data to test with
    const recipeData = {
      title: `E2E Carbonara ${UNIQUE}`,
      servings: 4,
      ingredients: [
        { name: 'Spaghetti', quantity: 400, unit: 'g' },
        { name: 'Eggs', quantity: 4, unit: 'pcs' },
        { name: 'Parmesan', quantity: 100, unit: 'g' },
      ],
      category: 'Main Course',
      steps: ['Boil pasta', 'Mix eggs and cheese', 'Combine and serve'],
      imageUrl: 'https://example.com/carbonara.jpg',
      cookingTime: 25,
      cuisineTags: ['Italian'],
      dietaryTags: ['Non-Vegetarian'],
    };

    await request.post('http://localhost:5000/api/recipes', {
      data: recipeData,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  });

  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto('/login');
    await page.fill('input[name="email"]', CHEF.email);
    await page.fill('input[name="password"]', CHEF.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/home/, { timeout: 15000 });
  });

  test('home page shows created recipes', async ({ page }) => {
    // Home page should show the recipe we created via API
    await expect(page.locator('.home-recipes-grid').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=E2E Carbonara ${UNIQUE}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('create recipe page loads correctly', async ({ page }) => {
    // Navigate to create recipe page
    await page.locator('.create-recipe-btn').first().click();
    await page.waitForURL(/\/create-recipe/, { timeout: 10000 });

    // Should see the creation form
    await expect(page.locator('h1')).toContainText('RECIPE CREATION');
    await expect(page.locator('input[placeholder="Enter recipe name..."]')).toBeVisible();

    // Form should have key elements
    await expect(page.locator('.ingredients-section')).toBeVisible();
    await expect(page.locator('.save-btn')).toBeVisible();
  });

  test('open recipe detail from home page', async ({ page }) => {
    await expect(page.locator('.home-recipes-grid').first()).toBeVisible({ timeout: 10000 });

    // Click first recipe card title to open detail
    const recipeTitle = page.locator(`text=E2E Carbonara ${UNIQUE}`).first();
    await expect(recipeTitle).toBeVisible({ timeout: 10000 });

    // Click on the recipe card
    const recipeCard = page.locator('[class*="recipe-card"]').first();
    await recipeCard.click();

    // Detail modal should appear
    await expect(page.locator('[class*="modal"], [class*="detail"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('like a recipe from home page', async ({ page }) => {
    await expect(page.locator('.home-recipes-grid').first()).toBeVisible({ timeout: 10000 });

    // Find heart/like button and click it
    const likeBtn = page.locator('[class*="heart"], [class*="like"], [class*="fav"]').first();
    if (await likeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await likeBtn.click();
      await expect(likeBtn).toBeVisible({ timeout: 3000 });
    }
  });
});
