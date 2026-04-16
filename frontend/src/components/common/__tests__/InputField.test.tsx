import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../InputField';

const InputWrapper = () => {
  const [val, setVal] = useState('');
  return (
    <InputField label="Password" type="password" placeholder="Enter password" value={val} onChange={setVal} />
  );
};

describe('InputField Component', () => {
  it('toggles password visibility (Happy Path)', () => {
    render(<InputWrapper />);
    const input = screen.getByPlaceholderText('Enter password');
    const eyeButton = screen.getByRole('button');
    
    expect(input).toHaveAttribute('type', 'password');
    
    fireEvent.click(eyeButton);
    expect(input).toHaveAttribute('type', 'text');
    
    fireEvent.click(eyeButton);
    expect(input).toHaveAttribute('type', 'password');
  });
});