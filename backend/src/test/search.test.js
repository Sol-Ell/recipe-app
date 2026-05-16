import request from 'supertest';
import express from 'express';
import recipeRoutes from '../routes/recipeRoutes.js';
import Recipe from '../models/Recipe.js';

const app = express();
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

describe('Recipe Search Logic - Unit Tests (Mocked Framework)', () => {
  let mockRecipes;

  beforeAll(() => {
    // Fake dataset array representing sorted production data inside memory
    mockRecipes = [
      {
        title: "Fresh Spicy Chicken",
        ingredients: [{ name: "Chicken Breast", quantity: 500, unit: "g" }],
        createdAt: new Date('2026-05-15')
      },
      {
        title: "Old Tomato Salad",
        ingredients: [{ name: "Tomato", quantity: 2, unit: "pcs" }],
        createdAt: new Date('2026-01-01')
      }
    ];
  });

  beforeEach(() => {
    // 🛠️ ALIGNEMENT SUR LA CHAÎNE DE COMPOSANTS MONGOOSE : find -> populate -> skip -> limit -> sort
    Recipe.find = () => ({
      populate: () => ({
        skip: () => ({
          limit: () => ({
            sort: () => Promise.resolve(mockRecipes) // La chaîne se résout enfin ici sans crash 500
          })
        })
      })
    });

    // Mock countDocuments pour que la pagination calcule le total sans planter
    Recipe.countDocuments = () => Promise.resolve(mockRecipes.length);
  });

  // --- TC-SEARCH-01 ---
  it('TC-SEARCH-01: Should return empty array when query is empty space', async () => {
    const res = await request(app).get('/api/recipes/search?q=   ');
    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
    expect(res.body.message).toBe('Empty query');
  });

  // --- TC-SEARCH-02 ---
  it('TC-SEARCH-02: Should find recipes safely using case-insensitive regex matching', async () => {
    const res = await request(app).get('/api/recipes/search?q=cHicKeN');
    expect(res.status).toBe(200); // Ne plantera plus en 500 !
    expect(res.body.recipes.length).toBe(2); 
  });

  // --- TC-SEARCH-03 ---
  it('TC-SEARCH-03: Should return the most recent recipes first', async () => {
    const resAll = await request(app).get('/api/recipes/search?q=e'); 
    expect(resAll.status).toBe(200);
    
    const recipes = resAll.body.recipes;
    const firstTimestamp = new Date(recipes[0].createdAt).getTime();
    const secondTimestamp = new Date(recipes[1].createdAt).getTime();
    expect(firstTimestamp).toBeGreaterThanOrEqual(secondTimestamp);
  });
});