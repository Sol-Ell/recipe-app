import request from 'supertest';
import express from 'express';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js'; 

const app = express();
app.use(express.json());
app.use('/api/users', authRoutes);

describe('Authentication - Strict QA Unit Tests on Production Code', () => {

  beforeEach(() => {
    // 🛠️ EXACTEMENT COMME HIER : On utilise du JavaScript pur, pas de "jest.fn()" !
    User.findOne = async () => null;
    User.create = async () => ({
      _id: "mock_id",
      username: "mock",
      email: "mock@test.com"
    });
  });

  // --- Critère 1 ---
  it('Unit Test (Logic): Verify that the controller correctly rejects passwords that do not meet the security regex (8 chars, 1 number, 1 letter).', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ 
        username: "ValidUser", 
        email: "test@ece.fr", 
        password: "123" 
      });

    expect(res.status).toBe(400); 
  });

  // --- Critère 2 ---
  it('Unit Test (Logic): Verify that the controller correctly rejects username that do not meet the security regex ( between 3 and 16 )', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ 
        username: "Ed", 
        email: "test@ece.fr", 
        password: "SecurePassword1" 
      });

    expect(res.status).toBe(400);
  });

  // --- Critère 3 ---
  it('Unit Test (Logic): Verify that the email is normalized (trimmed and lowercase) before being compared or saved.', async () => {
    const testEmail = "  ELIO.z@ECE.FR   ";
    
    const res = await request(app)
      .post('/api/users/register')
      .send({ 
        username: "ValidUser", 
        email: testEmail, 
        password: "SecurePassword1" 
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("elio.z@ece.fr");
  });
});