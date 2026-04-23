import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';
import Profile from './features/Profile/Profile'
import Navbar from './components/common/navbar';
import Home from './features/Home/Home';
import Create from './features/Create-Recipe/Create-Recipe'
import SearchPage from './features/SearchPage/SearchPage';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const App : React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // 1. AJOUT : État de chargement global
  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le JWT
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const res = await axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err: any) {
          localStorage.removeItem("token");
          console.error("Auth error:", err.response?.data || err.message);
        }
      }
      setLoading(false); // 2. AJOUT : On a fini de vérifier (succès ou échec)
    };

    fetchUser();
  }, []);

  // 3. AJOUT : Si on charge, on affiche un écran d'attente propre
  // Cela empêche la Navbar et le Profile de s'afficher avec un 'user' à null par erreur
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
        <h2 style={{ color: '#588157', fontFamily: 'Arial' }}>Loading Chef...</h2>
      </div>
    );
  }

  return (
    <Router>
      {/* Maintenant, quand la Navbar s'affiche, user est soit stable, soit null (si non connecté) */}
      <Navbar currentUser={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* pages use*/}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/create-recipe" element={<Create />} />
        <Route path="/" element={<Home currentUser={user}/>} />
        <Route path="/search/:query" element={<SearchPage currentUser={user} />} />

        
        {/* On garde la key pour forcer le refresh si on change de profil via l'URL */}
        <Route 
          path="/profile/:id" 
          element={<Profile key={window.location.pathname} currentUser={user} />} 
        />
        
        <Route path="/home" element={<Home currentUser={user} />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;