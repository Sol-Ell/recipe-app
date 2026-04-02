import request from 'supertest';
import app from '../server.js'; // Vérifie que server.js fait bien "export default app"
import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('🧪 Automation Test: User Profile System', () => {
  let token, myId, otherId;

  beforeAll(async () => {
    // Nettoyage et création des données de test
    await User.deleteMany({});
    
    const me = await User.create({
      username: 'MySelf',
      email: 'me@test.com',
      password: 'password123',
      followers: [],
      tags: ['Chef']
    });
    myId = me._id;

    const other = await User.create({
      username: 'OtherChef',
      email: 'other@test.com',
      password: 'password456'
    });
    otherId = other._id;

    token = jwt.sign({ id: myId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Requirement 1: Fetch OWN profile via Token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('MySelf');
    expect(res.body).not.toHaveProperty('password');
  });

  test('Requirement 2: Successfully retrieves the information of the specified user', async () => {
    const res = await request(app)
      .get(`/api/users/profile/${otherId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body._id).toBe(otherId.toString());
    expect(res.body.username).toBe('OtherChef');
    expect(res.body.email).toBe('other@test.com');

    expect(res.body).not.toHaveProperty('password');
  });

  test('Requirement 3: Block unauthorized access', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });
});