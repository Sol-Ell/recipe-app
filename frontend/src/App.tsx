import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const App : React.FC = () => {
  // On définit les types pour TypeScript (User peut être un objet ou null)
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  console.log(user);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Récupération du token stocké dans le navigateur
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // 2. Appel à l'API backend de ton camarade X
          const res = await axios.get("/api/users/me", {
            headers: { 
              Authorization: `Bearer ${token}` 
            },
          });

          // 3. Si ça marche, on stocke les infos de l'utilisateur
          setUser(res.data);
        } catch (err: any) {
          // 4. En cas d'erreur (token expiré ou invalide), on nettoie
          setError("Failed to fetch user data");
          localStorage.removeItem("token");
          console.error("Erreur axios:", err.response?.data || err.message);
        }
      }
    };

    fetchUser();
  }, []); // Le tableau vide [] assure que l'appel ne se fait qu'au chargement de la page
  return (
    <Router>
      <Routes>
        {/* open login first */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* pages use*/}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        
        {/* Page 404  */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;