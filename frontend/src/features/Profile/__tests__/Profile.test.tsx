import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Profile from '../Profile';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../../components/common/Recipe', () => () => <div data-testid="recipe-card" />);
jest.mock('../../index.css', () => ({}));
jest.mock('./Profile.css', () => ({}));

describe('Profile Component', () => {
  const currentUser = { _id: '1', username: 'TestUser', followers: [], following: [] };

  it('fetches and displays recipes on mount (Happy Path)', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ _id: '101', title: 'Burger' }] });

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:id" element={<Profile currentUser={currentUser} />} />
        </Routes>
      </MemoryRouter>
    );

    // Should fetch the default endpoint
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/recipes/user/1', expect.any(Object));
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    });
  });

  it('opens edit modal if it is own profile (Happy Path)', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:id" element={<Profile currentUser={currentUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Edit profile')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit profile'));
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument(); // Modal title
  });
});