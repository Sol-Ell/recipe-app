import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../Login';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock static assets and CSS
jest.mock('../../assets/login-art.jpg', () => 'login-art.jpg');
jest.mock('../../assets/google-logo.png', () => 'google-logo.png');
jest.mock('./Auth.css', () => ({}));

describe('Login Component', () => {
  const mockSetUser = jest.fn();

  beforeEach(() => { jest.clearAllMocks(); localStorage.clear(); });

  it('logs in successfully and sets token (Happy Path)', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'valid-token', id: '123' } });
    render(<BrowserRouter><Login setUser={mockSetUser} /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Example@email.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123' } });
    
    const signInButton = screen.getByRole('button', { name: /^Sign in$/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  it('displays error on failed login (Sad Path)', async () => {
    const mockError = {
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } }
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);
    mockedAxios.isAxiosError.mockReturnValueOnce(true); 

    render(<BrowserRouter><Login setUser={mockSetUser} /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Example@email.com'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'wrongpassword' } });
    const signInButton = screen.getByRole('button', { name: /^Sign in$/i });
    fireEvent.click(signInButton);

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});