import React, { useState, ChangeEvent, FormEvent } from 'react';
import './Auth.css';
import loginart from "../../assets/login-art.jpg";
import logog from "../../assets/google-logo.png";


import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordverif, setPasswdverif] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordverif, setShowPasswordverif] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit:", { username, email, password });
  };

  return (
    <div className="auth-container">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-content">
          <h1 className="auth-title">Nice to meet you</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <input 
                  type="text"
                  placeholder="Username123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                /> 
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="Example@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Password Verification</label>
              <div className="input-wrapper">
                <input 
                  type={showPasswordverif ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  value={passwordverif}
                  onChange={(e) => setPasswdverif(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-button"
                  onClick={() => setShowPasswordverif(!showPasswordverif)}
                >
                  {showPasswordverif ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-signin">Create account</button>

            <div className="separator">
              <span>Or</span>
            </div>

            <button type="button" className="btn-google">
             <img src={logog} alt="Google Logo" />
              Sign up with Google
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <span className="signup-link" onClick={() => navigate('/login')}>
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div 
          className="image-card"
          style={{ backgroundImage: `url(${loginart})` }}
        />
      </div>
    </div>
  );
};

export default Register;