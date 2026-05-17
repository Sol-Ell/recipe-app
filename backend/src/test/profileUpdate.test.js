import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('Profile Update System Tests', () => {
  let token, userId, otherId;

  beforeAll(async () => {
    await User.deleteMany({});

    const me = await User.create({
      username: 'ProfileUser',
      email: 'profile@test.com',
      password: 'oldpassword',
      cuisineTags: ['Italian'],
      dietaryTags: [],
      levelTags: ['Beginner'],
    });
    userId = me._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const other = await User.create({
      username: 'OtherUser',
      email: 'otheruser@test.com',
      password: 'pass456',
    });
    otherId = other._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/edit/profile — Own Profile', () => {
    test('Returns own profile with auth token', async () => {
      const res = await request(app)
        .get('/api/edit/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('ProfileUser');
      expect(res.body).not.toHaveProperty('password');
      expect(res.body.cuisineTags).toContain('Italian');
    });

    test('Returns 401 without auth token', async () => {
      const res = await request(app).get('/api/edit/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/edit/profile/:id — Public Profile', () => {
    test("Returns any user's public profile by ID", async () => {
      const res = await request(app).get(`/api/edit/profile/${otherId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(otherId.toString());
      expect(res.body.username).toBe('OtherUser');
      expect(res.body).not.toHaveProperty('password');
    });

    test('Returns 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/edit/profile/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/edit/update-profile — Update Profile', () => {
    test('Updates avatar, email, and tags', async () => {
      const res = await request(app)
        .patch('/api/edit/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatar: 'https://example.com/new-avatar.jpg',
          email: 'newemail@test.com',
          cuisineTags: ['French', 'Italian'],
          dietaryTags: ['Vegetarian'],
          levelTags: ['Intermediate'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.avatar).toBe('https://example.com/new-avatar.jpg');
      expect(res.body.user.email).toBe('newemail@test.com');
      expect(res.body.user.cuisineTags).toEqual(['French', 'Italian']);
      expect(res.body.user.dietaryTags).toEqual(['Vegetarian']);
      expect(res.body.user.levelTags).toEqual(['Intermediate']);
      expect(res.body.user).not.toHaveProperty('password');
    });

    test('Updates password successfully', async () => {
      const resPatch = await request(app)
        .patch('/api/edit/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newsecurepassword' });

      expect(resPatch.statusCode).toBe(200);

      // Verify can login with new password
      const resLogin = await request(app)
        .post('/api/users/login')
        .send({ email: 'newemail@test.com', password: 'newsecurepassword' });

      expect(resLogin.statusCode).toBe(200);
      expect(resLogin.body.token).toBeDefined();
    });

    test('Returns 401 without auth token', async () => {
      const res = await request(app)
        .patch('/api/edit/update-profile')
        .send({ email: 'hacked@test.com' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/profile (legacy route)', () => {
    test('Returns own profile via legacy endpoint', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).not.toHaveProperty('password');
    });

    test('Returns 401 without token', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/profile/:id (legacy route)', () => {
    test('Returns another user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/profile/${otherId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('OtherUser');
      expect(res.body).not.toHaveProperty('password');
    });
  });
});
