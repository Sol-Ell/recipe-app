import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import recipeRoutes from '../routes/recipeRoutes.js';
import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';

const MOCK_USER_ID = "60d5ecb8b51d123456789abc";

process.env.JWT_SECRET = "super_qa_secret";
const VALID_TOKEN = jwt.sign({ id: MOCK_USER_ID }, process.env.JWT_SECRET);

const app = express();
app.use(express.json({ limit: '10mb' })); 
app.use('/api/recipes', recipeRoutes);

describe('QA Integration Testing: Recipe Post Flow (POST /recipes)', () => {

  beforeEach(() => {
    mongoose.set('bufferCommands', false);

    Blacklist.findOne = () => Promise.resolve(null);

    User.findById = () => {
      const mockUser = { _id: MOCK_USER_ID, username: "QA_User" };
      const chain = Promise.resolve(mockUser);
      chain.select = () => Promise.resolve(mockUser);
      return chain;
    };

    mongoose.Model.prototype.save = function() {
      this._id = "mock_recipe_id";
      return Promise.resolve(this);
    };
  });

  it('Integration Test (Auth): Send a valid recipe without a token -> Expect Unauthorized.', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .send({
        title: "No Auth Recipe",
        servings: 2,
        cookingTime: 10,
        category: "Appetizer",
        imageUrl: "http://img.com/test.jpg",
        ingredients: [{ name: "Salt", quantity: 1, unit: "g" }],
        steps: ["Step 1"]
      });

    expect(res.status).toBe(401);
  });

  it('Integration Test (Success): Send a valid recipe with a valid token -> Expect Created and verify the author field in the DB matches the logged-in user.', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: "Perfect Pizza",
        servings: 4,
        cookingTime: 25,
        category: "Main Course",
        imageUrl: "http://img.com/pizza.jpg",
        ingredients: [{ name: "Dough", quantity: 1, unit: "pcs" }],
        steps: ["Bake it"]
      });

    expect(res.status).toBe(201);
    expect(res.body.author).toBe(MOCK_USER_ID); 
  });

  it('Integration Test (Limits): Attempt to send an extremely large image URL or text body to check for payload size errors.', async () => {
    const massivePayload = "A".repeat(11 * 1024 * 1024); 

    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: "Giant Recipe",
        servings: 2,
        cookingTime: 10,
        category: "Dessert",
        imageUrl: massivePayload,
        ingredients: [{ name: "Sugar", quantity: 1, unit: "g" }],
        steps: ["Eat"]
      });

    expect(res.status).toBe(413);
  });
});