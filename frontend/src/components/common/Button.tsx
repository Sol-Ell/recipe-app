import React from 'react';

// defiens what king of buttons it can be 
interface ButtonProps {
  label: string;
  onClick?: () => void; 
  type?: 'button' | 'submit' | 'reset'; // only html type valide 
  variant?: 'primary' | 'outline' | 'google'; // different kin of style 
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false 
}) => {
  // change the css depending on the style choose 
  const className = `custom-button btn-${variant}`;

  return (
    <button 
      type={type} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;