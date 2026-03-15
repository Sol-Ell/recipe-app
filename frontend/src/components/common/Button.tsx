import React from 'react';

// On définit ce que notre bouton peut recevoir comme "ordres" (props)
interface ButtonProps {
  label: string;
  onClick?: () => void; // Le '?' veut dire que c'est optionnel
  type?: 'button' | 'submit' | 'reset'; // On restreint aux types HTML valides
  variant?: 'primary' | 'outline' | 'google'; // Nos variantes de style
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false 
}) => {
  // On change la classe CSS selon la variante choisie
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