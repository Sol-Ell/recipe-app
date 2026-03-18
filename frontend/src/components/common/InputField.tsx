import React, { useState } from 'react';


interface InputFieldProps {
  label: string;
  type: 'text' | 'email' | 'password'; 
  placeholder: string;
  value: string;
  onChange: (val: string) => void; 
}

const InputField: React.FC<InputFieldProps> = ({ label, type, placeholder, value, onChange }) => {
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        {/* only showing the eys if the field is a password field  */}
        {type === 'password' && (
          <button 
            type="button" 
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="eye-button"
          >
            {isPasswordVisible ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;