import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly and handles clicks (Happy Path)', () => {
    const handleClick = jest.fn();
    render(<Button label="Sign In" onClick={handleClick} variant="primary" />);
    
    const button = screen.getByText('Sign In');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-button btn-primary');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled (Sad Path)', () => {
    const handleClick = jest.fn();
    render(<Button label="Submit" onClick={handleClick} disabled={true} />);
    
    const button = screen.getByText('Submit');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});