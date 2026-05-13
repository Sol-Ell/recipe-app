import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';

describe('Auth System Tests', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/users/register', () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    test('Registers a new user and returns token + user data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'TestUser', email: 'test@example.com', password: 'secret123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.username).toBe('TestUser');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.token).toBeDefined();
      expect(res.body).not.toHaveProperty('password');
    });

    test('Returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'NoEmail' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please fill all the fields');
    });

    test('Returns 400 when email already exists', async () => {
      await User.create({ username: 'Existing', email: 'dup@example.com', password: 'pass123' });

      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'NewGuy', email: 'dup@example.com', password: 'pass456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('user already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await User.create({ username: 'LoginTest', email: 'login@test.com', password: 'correct123' });
    });

    test('Logs in with valid credentials and returns token', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com', password: 'correct123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('LoginTest');
      expect(res.body.token).toBeDefined();
    });

    test('Returns 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    test('Returns 400 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please fill all the the fields');
    });
  });

  describe('POST /api/users/logout', () => {
    let token;

    beforeEach(async () => {
      await User.deleteMany({});
      await Blacklist.deleteMany({});
      const user = await User.create({ username: 'Logouter', email: 'logout@test.com', password: 'pass123' });
      const jwt = (await import('jsonwebtoken')).default;
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    test('Logs out and blacklists the token', async () => {
      const res = await request(app)
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);

      const blacklisted = await Blacklist.findOne({ token });
      expect(blacklisted).toBeTruthy();
    });

    test('Rejects a blacklisted token on subsequent request', async () => {
      await Blacklist.create({ token });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Token revoked (disconnected)');
    });
  });

  describe('GET /api/users/me', () => {
    let token, userId;

    beforeEach(async () => {
      await User.deleteMany({});
      const user = await User.create({ username: 'MeUser', email: 'me@test.com', password: 'pass123' });
      userId = user._id;
      const jwt = (await import('jsonwebtoken')).default;
      token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    test('Returns authenticated user data', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('MeUser');
      expect(res.body.email).toBe('me@test.com');
      expect(res.body).not.toHaveProperty('password');
    });

    test('Returns 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });

    test('Returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtokenstuff');

      expect(res.statusCode).toBe(401);
    });
  });
});
