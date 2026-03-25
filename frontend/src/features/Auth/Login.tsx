import React, { useState } from 'react';
import './Auth.css';
import loginart from "../../assets/login-art.jpg"
import logog from "../../assets/google-logo.png";
import axios from 'axios';

import { useNavigate } from 'react-router-dom';


// 1. Définir l'interface pour les Props en haut
interface LoginProps {
  setUser: (user: any) => void;
}
const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({
    email : "",
    password : "",

  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await axios.post("/api/users/login", formData);
        localStorage.setItem("token", res.data.token);
        console.log(res.data);
        setUser(res.data);
        navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Here TypeScript knows that's a Axios error
        setError(err.response?.data?.message || "Login failed");
      } else {
        // Errors don't come from axios
        setError("An unexpected error occurred");
      }
    };
    console.log("Submit:", formData);

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
                  name="email" // INDISPENSABLE pour handleChange
                  type="email" 
                  placeholder="Example@email.com" 
                  value={formData.email} // Utiliser formData au lieu de email
                  onChange={handleChange} // Appeler la fonction qui met à jour l'objet
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  name="password" // INDISPENSABLE
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  value={formData.password} // Utiliser formData
                  onChange={handleChange} // Appeler la fonction
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
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn-signin">Sign in</button>

            <div className="separator">
              <span>Or</span>
            </div>

            <button type="button" className="btn-google">
             <img src={logog} alt="Google Logo" />
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

