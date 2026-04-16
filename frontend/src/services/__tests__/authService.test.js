import { login } from '../authService';

describe('authService', () => {
  it('resolves with a fake token and user email (Happy Path)', async () => {
    const email = 'alex.smith@example.com'; // Realistic data
    const response = await login(email, 'SecurePass123!');
    
    expect(response).toEqual({
      token: "fake-jwt-token",
      user: { email: 'alex.smith@example.com' }
    });
  });
});