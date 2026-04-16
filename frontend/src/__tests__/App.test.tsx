import React from 'react';
import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from '../App';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock all nested complex components so we just test App's routing & logic
jest.mock('../features/Auth/Login', () => () => <div data-testid="login-page" />);
jest.mock('../features/Auth/Register', () => () => <div data-testid="register-page" />);
jest.mock('../features/Profile/Profile', () => () => <div data-testid="profile-page" />);
jest.mock('../features/Home/Home', () => () => <div data-testid="home-page" />);
jest.mock('../components/common/navbar', () => () => <div data-testid="navbar" />);

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('fetches user if token exists in localStorage (Happy Path)', async () => {
    localStorage.setItem('token', 'valid-token');
    mockedAxios.get.mockResolvedValueOnce({ data: { _id: '1', username: 'TestUser' } });

    render(<App />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/me', {
        headers: { Authorization: 'Bearer valid-token' }
      });
    });
  });

  it('removes token if fetching user fails (Sad Path)', async () => {
    localStorage.setItem('token', 'expired-token');
    mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});