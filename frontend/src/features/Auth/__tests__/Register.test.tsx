import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Register from '../Register';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../assets/login-art.jpg', () => 'login-art.jpg');
jest.mock('../../assets/google-logo.png', () => 'google-logo.png');
jest.mock('./Auth.css', () => ({}));

describe('Register Component', () => {
  const mockSetUser = jest.fn();

  it('shows error if passwords do not match (Sad Path)', async () => {
    render(<BrowserRouter><Register setUser={mockSetUser} /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Username123'), { target: { value: 'JohnDoe' } });
    fireEvent.change(screen.getByPlaceholderText('Example@email.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'Password456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText('Passwords do not match!')).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});