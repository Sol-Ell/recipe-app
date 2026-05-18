import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Importation des vrais fichiers du site
import recipeRoutes from '../routes/recipeRoutes.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';

process.env.JWT_SECRET = "super_qa_secret";
const VALID_TOKEN = jwt.sign({ id: "mock_user_123" }, process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

describe('QA Unit Testing: Recipe Creation Logic (Mocked Framework Chaining)', () => {

  beforeEach(() => {
    // 🛠️ METHODE DE CHAINAGE : On neutralise Blacklist pour le middleware protect
    Blacklist.findOne = () => Promise.resolve(null);

    // 🛠️ METHODE DE CHAINAGE : On simule l'objet User pour qu'il supporte le traitement direct OU avec .select()
    User.findById = () => {
      const mockUser = { _id: "mock_user_123", username: "QA_User" };
      const chain = Promise.resolve(mockUser);
      chain.select = () => Promise.resolve(mockUser); // Gère le .select('-password') du dev
      return chain;
    };

    // 🛠️ METHODE DE CHAINAGE : On court-circuite la sauvegarde de Mongoose en JS pur
    Recipe.prototype.save = function() {
      this._id = "mock_recipe_id";
      return Promise.resolve(this);
    };
  });

  // --- UNIT CRITÈRE 1 ---
  it('Unit Test (Data Integrity): Verify the logic that separates ingredients and steps into arrays before saving.', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: "Pasta",
        servings: 2,
        cookingTime: 15,
        category: "Main Course",
        imageUrl: "http://image.com/pasta.jpg",
        ingredients: "Tomato, Pasta, Salt", // Chaîne brute à séparer
        steps: "Boil water, Add pasta" // Chaîne brute à séparer
      });

    // Le test vérifie si le code actuel sépare les chaînes en tableaux (Attendu: 201)
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.ingredients)).toBe(true);
  });

  // --- UNIT CRITÈRE 2 ---
  it('Unit Test (Validation): Ensure the function throws an error if "Servings" or "Cooking Time" is a negative number.', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: "Negative Recipe",
        servings: -5, // Valeur négative invalide
        cookingTime: -20, // Valeur négative invalide
        category: "Main Course",
        imageUrl: "http://image.com/neg.jpg",
        ingredients: [{ name: "Salt", quantity: 1, unit: "g" }],
        steps: ["Step 1"]
      });

    // Le test s'attend à ce que le contrôleur lève une erreur de validation 400 Bad Request
    expect(res.status).toBe(400); 
  });
});