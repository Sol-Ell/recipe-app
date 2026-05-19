import request from 'supertest';
import express from 'express';
import recipeRoutes from '../routes/recipeRoutes.js';
import Recipe from '../models/Recipe.js';

const app = express();
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

describe('QA Unit Testing: Recipe Stream Logic (GET /recipes)', () => {

  beforeEach(() => {
    // Mock par chaînage classique pour empêcher Mongoose de se connecter à Internet
    Recipe.find = () => ({
      populate: () => Promise.resolve([])
    });
  });

  // --- UNIT CRITÈRE 1 ---
  it('Unit Test (Filtering): Verify the helper function that filters recipes by category (e.g., "Meat Lover" vs "Vegetarian").', async () => {
    const res = await request(app)
      .get('/api/recipes?category=Meat Lover'); // Catégorie non supportée

    // On s'attend à ce que le code rejette (400) ou gère proprement l'absence de cette catégorie
    expect(res.status).toBe(400);
  });
});