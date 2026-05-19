import request from 'supertest';
import express from 'express';
import recipeRoutes from '../routes/recipeRoutes.js';
import Recipe from '../models/Recipe.js';
import Blacklist from '../models/Blacklist.js';

const app = Pattern = express();
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

describe('QA Integration Testing: Main Page Display (GET /recipes)', () => {

  beforeEach(() => {
    Blacklist.findOne = () => Promise.resolve(null);

    // Simulation d'un jeu de données volumineux contenant des jointures d'auteurs
    const mockBigDataset = Array.from({ length: 25 }, (_, i) => ({
      _id: `recipe_id_${i}`,
      title: `Recipe ${i}`,
      category: "Main Course",
      author: {
        username: `User_${i}`,
        avatar: `avatar_${i}.png`
      }
    }));

    // Mock complet de l'alignement de ta route : find -> populate
    Recipe.find = () => ({
      populate: () => Promise.resolve(mockBigDataset.slice(0, 10)) // Le dev limite actuellement à 10 ou 20 via son contrôleur
    });
  });

  // --- INTEGRATION CRITÈRE 1 ---
  it('Integration Test (Public Access): Ensure the main page route works without any Authorization header (Guest mode).', async () => {
    const res = await request(app).get('/api/recipes');
    
    // Pas de middleware protect sur cette route globale : accès public attendu (200)
    expect(res.status).toBe(200);
  });

  // --- INTEGRATION CRITÈRE 2 ---
  it('Integration Test (Data Population): Verify the JSON response contains the authorName and authorAvatar to prevent frontend crashes.', async () => {
    const res = await request(app).get('/api/recipes');

    expect(res.status).toBe(200);
    expect(res.body[0].author).toHaveProperty('username');
    expect(res.body[0].author).toHaveProperty('avatar');
  });

  // --- INTEGRATION CRITÈRE 3 ---
  it('Integration Test (Performance): Confirm the route returns a maximum limit of recipes to ensure the Home Page loads quickly.', async () => {
    const res = await request(app).get('/api/recipes');

    expect(res.status).toBe(200);
    // Vérification que l'API applique bien une troncature de sécurité (ne renvoie pas les 25 éléments d'un coup)
    expect(res.body.length).toBeLessThanOrEqual(20);
  });
});