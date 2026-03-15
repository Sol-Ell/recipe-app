import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirige automatiquement la racine vers le login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Tes pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Page 404 (Optionnel) */}
        <Route path="*" element={<h1>Page non trouvée</h1>} />
      </Routes>
    </Router>
  );
};

export default App;