import React, { useState } from 'react';
import './Auth.css';
import loginart from "../../assets/login-art.jpg";
import logog from "../../assets/google-logo.png";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. On définit l'interface pour recevoir setUser
interface RegisterProps {
  setUser: (user: any) => void;
}

// 2. On passe setUser en paramètre ici
const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  
  // 3. On centralise tout dans formData (y compris password verification)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordverif: "" // Ajouté ici
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordverif, setShowPasswordverif] = useState<boolean>(false);

  // 4. Fonction unique pour mettre à jour les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 5. Petite vérification de sécurité avant d'envoyer au backend
    if (formData.password !== formData.passwordverif) {
      setError("Passwords do not match!");
      return;
    }

    try {
        // On envoie le formData (le backend ignorera passwordverif s'il est bien codé)
        const res = await axios.post("/api/users/register", formData);
        localStorage.setItem("token", res.data.token);
        
        setUser(res.data); // Maintenant setUser est reconnu !
        navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-content">
          <h1 className="auth-title">Nice to meet you</h1>
          
          

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <input 
                  name="username" // Ajouté
                  type="text"
                  placeholder="Username123"
                  value={formData.username} // Changé
                  onChange={handleChange} // Changé
                  required
                /> 
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <input 
                  name="email" // Ajouté
                  type="email" 
                  placeholder="Example@email.com" 
                  value={formData.email} // Changé
                  onChange={handleChange} // Changé
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  name="password" // Ajouté
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  value={formData.password} // Changé
                  onChange={handleChange} // Changé
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
                  name="passwordverif" // Ajouté
                  type={showPasswordverif ? "text" : "password"} 
                  placeholder="Repeat your password" 
                  value={formData.passwordverif} // Changé
                  onChange={handleChange} // Changé
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


            {error && (
  <div className="error-text-minimal">
    <span className="dot"></span>
    {error}
  </div>
)}

            <button type="submit" className="btn-signin">Create account</button>

            

            
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <span className="signup-link" onClick={() => navigate('/login')}>
              Sign in
            </span>
          </p>
        </div>
      </div>

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