import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import jwt from 'jsonwebtoken';

describe('Recipe System Tests', () => {
  let token, userId, otherUserId, otherToken;

  beforeAll(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    const me = await User.create({
      username: 'ChefAlice',
      email: 'alice@test.com',
      password: 'password123',
    });
    userId = me._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const other = await User.create({
      username: 'ChefBob',
      email: 'bob@test.com',
      password: 'password456',
    });
    otherUserId = other._id;
    otherToken = jwt.sign({ id: otherUserId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const validRecipe = {
    title: 'Spaghetti Carbonara',
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

  describe('POST /api/recipes — Create Recipe', () => {
    beforeEach(async () => {
      await Recipe.deleteMany({});
    });

    test('Creates a recipe and returns 201', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(validRecipe);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Spaghetti Carbonara');
      expect(res.body.author).toBe(userId.toString());
      expect(res.body.ingredients).toHaveLength(3);
      expect(res.body.steps).toHaveLength(3);
    });

    test('Returns 400 when title is too short', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, title: 'AB' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test('Returns 400 when category is invalid', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, category: 'InvalidCategory' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test('Returns 400 when ingredients is empty', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, ingredients: [] });

      expect(res.statusCode).toBe(400);
    });

    test('Returns 400 when steps is empty', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, steps: [] });

      expect(res.statusCode).toBe(400);
    });

    test('Returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .send(validRecipe);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/recipes — List & Filter Recipes', () => {
    beforeAll(async () => {
      await Recipe.deleteMany({});
      await Recipe.create([
        { ...validRecipe, title: 'Pasta A', category: 'Main Course', author: userId },
        { ...validRecipe, title: 'Salad B', category: 'Appetizer', author: userId },
        { ...validRecipe, title: 'Cake C', category: 'Dessert', author: otherUserId },
      ]);
    });

    test('Returns all recipes sorted by newest first', async () => {
      const res = await request(app).get('/api/recipes');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      expect(res.body[0].author).toBeDefined();
    });

    test('Filters recipes by category', async () => {
      const res = await request(app).get('/api/recipes?category=Dessert');
      expect(res.statusCode).toBe(200);
      expect(res.body.every(r => r.category === 'Dessert')).toBe(true);
    });

    test('Returns 400 for invalid category', async () => {
      const res = await request(app).get('/api/recipes?category=Invalid');
      expect(res.statusCode).toBe(400);
    });

    test('Searches recipes by title via query param q', async () => {
      const res = await request(app).get('/api/recipes?q=Pasta');
      expect(res.statusCode).toBe(200);
      const titles = res.body.map(r => r.title);
      expect(titles.some(t => /Pasta/i.test(t))).toBe(true);
    });
  });

  describe('GET /api/recipes/search — Full-Text Search', () => {
    beforeAll(async () => {
      await Recipe.deleteMany({});
      await Recipe.create([
        { ...validRecipe, title: 'Chicken Curry', author: userId },
        { ...validRecipe, title: 'Beef Stew', author: userId },
      ]);
    });

    test('Searches by title with pagination', async () => {
      const res = await request(app).get('/api/recipes/search?q=Chicken&page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.recipes).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBeDefined();
    });

    test('Returns empty results for no match', async () => {
      const res = await request(app).get('/api/recipes/search?q=zzzznonexistent');
      expect(res.statusCode).toBe(200);
      expect(res.body.recipes).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    test('Handles empty query gracefully', async () => {
      const res = await request(app).get('/api/recipes/search?q=');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Empty query');
    });
  });

  describe('GET /api/recipes/:id — Get Recipe by ID', () => {
    let recipeId;

    beforeAll(async () => {
      await Recipe.deleteMany({});
      const recipe = await Recipe.create({ ...validRecipe, author: userId });
      recipeId = recipe._id;
    });

    test('Returns recipe by ID', async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Spaghetti Carbonara');
      expect(res.body.author.username).toBe('ChefAlice');
    });

    test('Returns 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/recipes/:id — Update Recipe', () => {
    let recipeId;

    beforeEach(async () => {
      await Recipe.deleteMany({});
      const recipe = await Recipe.create({ ...validRecipe, author: userId });
      recipeId = recipe._id;
    });

    const updateData = {
      title: 'Updated Carbonara',
      servings: 2,
      ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }],
      category: 'Main Course',
      steps: ['Cook pasta', 'Serve'],
      imageUrl: 'https://example.com/updated.jpg',
      cookingTime: 30,
    };

    test('Owner can update their recipe', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Carbonara');
      expect(res.body.cookingTime).toBe(30);
    });

    test('Non-owner cannot update recipe (403)', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
    });

    test('Returns 404 for updating non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/recipes/:id — Delete Recipe', () => {
    let recipeId;

    beforeEach(async () => {
      await Recipe.deleteMany({});
      const recipe = await Recipe.create({ ...validRecipe, author: userId });
      recipeId = recipe._id;
    });

    test('Owner can delete their recipe', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);

      const deleted = await Recipe.findById(recipeId);
      expect(deleted).toBeNull();
    });

    test('Non-owner cannot delete recipe (403)', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('Returns 404 for deleting non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/recipes/:id/like — Toggle Like', () => {
    let recipeId;

    beforeEach(async () => {
      await Recipe.deleteMany({});
      const recipe = await Recipe.create({ ...validRecipe, author: otherUserId });
      recipeId = recipe._id;
    });

    test('Likes a recipe', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.likes.map(String)).toContain(userId.toString());
    });

    test('Unlikes a recipe when liked again', async () => {
      await request(app)
        .put(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .put(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.likes.map(String)).not.toContain(userId.toString());
    });

    test('Returns 404 for liking non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recipes/${fakeId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/recipes/user/:id — User Recipes', () => {
    beforeAll(async () => {
      await Recipe.deleteMany({});
      await Recipe.create({ ...validRecipe, title: 'Alices Dish', author: userId });
      await Recipe.create({ ...validRecipe, title: 'Bobs Dish', author: otherUserId });
    });

    test("Returns a specific user's recipes", async () => {
      const res = await request(app)
        .get(`/api/recipes/user/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.every(r => r.author._id.toString() === userId.toString())).toBe(true);
    });
  });

  describe('GET /api/recipes/my-likes — My Liked Recipes', () => {
    beforeAll(async () => {
      await Recipe.deleteMany({});
      const recipe = await Recipe.create({ ...validRecipe, author: otherUserId, likes: [userId] });
    });

    test('Returns recipes liked by current user', async () => {
      const res = await request(app)
        .get('/api/recipes/my-likes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Save Recipe Workflow', () => {
    let recipeId;

    beforeEach(async () => {
      await Recipe.deleteMany({});
      await User.findByIdAndUpdate(userId, { savedRecipes: [] });
      const recipe = await Recipe.create({ ...validRecipe, author: otherUserId });
      recipeId = recipe._id;
    });

    test('Saves a recipe and returns updated savedRecipes', async () => {
      const res = await request(app)
        .put('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId });

      expect(res.statusCode).toBe(200);
      expect(res.body.savedRecipes.map(String)).toContain(recipeId.toString());
    });

    test('GET /savedRecipes/ids returns saved recipe IDs', async () => {
      await request(app)
        .put('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId });

      const res = await request(app)
        .get('/api/recipes/savedRecipes/ids')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.savedRecipes.map(String)).toContain(recipeId.toString());
    });

    test('GET /savedRecipes returns full saved recipe objects', async () => {
      await request(app)
        .put('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId });

      const res = await request(app)
        .get('/api/recipes/savedRecipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.savedRecipes).toBeDefined();
      expect(res.body.savedRecipes.length).toBeGreaterThanOrEqual(1);
      expect(res.body.savedRecipes[0].title).toBeDefined();
    });
  });
});
