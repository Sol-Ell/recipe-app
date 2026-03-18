import React, { useState } from 'react';
import './Auth.css';
import loginart from "../../assets/login-art.jpg"
import { useNavigate } from 'react-router-dom';



const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit:", { email, password });

  };

  return (
    <div className="auth-container">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-content">
          <h1 className="auth-title">Welcome Back</h1>
          
          <form onSubmit={handleSubmit}>
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

            <div className="forgot-pw">
              <a href="">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-signin">Sign in</button>

            <div className="separator">
              <span>Or</span>
            </div>

            <button type="button" className="btn-google">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa/google.svg" alt="" />
              Sign in with Google
            </button>
          </form>

          <p className="auth-footer">
          Don't you have an account?{' '}
            <span className="signup-link" onClick={() => navigate('/register')}>
      Sign up
    </span>
      </p>
        </div>
      </div>

      {/* right */}
      <div className="auth-right">
        <div className="image-card"
        style={{backgroundImage: `url(${loginart})`}}
        >
          
        </div>
      </div>
    </div>
  );
};

export default Login;

