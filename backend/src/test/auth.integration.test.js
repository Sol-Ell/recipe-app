import request from 'supertest';
import express from 'express';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js'; 

// 1. Prévention du crash (Erreur 500) en injectant la variable d'environnement manquante
process.env.JWT_SECRET = "super_secret_test_key";

const app = express();
app.use(express.json());
app.use('/api/users', authRoutes);

// 2. Simulation de la base de données en mémoire pour l'intégration
let mockDatabase = [];

describe('Authentication - Integration Tests (Flow & Security)', () => {

  beforeEach(() => {
    mockDatabase = []; // On vide la fausse base avant chaque test

    // 3. Mocks Mongoose en JS pur (Connectés à notre mockDatabase)
    User.findOne = async (query) => {
      const user = mockDatabase.find(u => u.email === query.email);
      if (!user) return null;
      
      // On attache la méthode matchPassword attendue par ton contrôleur de Login
      return {
        ...user,
        matchPassword: async (enteredPassword) => enteredPassword === user.password
      };
    };

    User.create = async (userData) => {
      const newUser = { _id: "test_id_123", ...userData };
      mockDatabase.push(newUser);
      return newUser;
    };
  });

  // --- CRITÈRE 1 ---
  it('Integration Test (POST): Successfully register a new user and confirm a JWT token is returned.', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: "NewUser", email: "integration@test.com", password: "Password123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token'); // Vérifie que le token est bien généré et renvoyé
    expect(res.body.username).toBe("NewUser");
  });

  // --- CRITÈRE 2 ---
  it('Integration Test (Security): Attempt to login with the correct email but a wrong password -> Expect Unauthorized.', async () => {
    // Étape A : On pré-enregistre un utilisateur valide dans la base
    mockDatabase.push({ 
      username: "LoginUser", 
      email: "login@test.com", 
      password: "CorrectPassword123" 
    });

    // Étape B : On tente de se connecter avec un faux mot de passe
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: "login@test.com", password: "WrongPassword999" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // --- CRITÈRE 3 ---
  it('Integration Test (Duplicates): Attempt to register with an email already in the DB -> Expect Bad Request.', async () => {
    // Étape A : On insère un email existant
    mockDatabase.push({ 
      username: "FirstUser", 
      email: "duplicate@test.com", 
      password: "Password123" 
    });

    // Étape B : On tente de recréer un compte avec le même email
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: "SecondUser", email: "duplicate@test.com", password: "NewPassword456" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("user already exists");
  });
});