import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* open login first */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* pages use*/}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Page 404  */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;