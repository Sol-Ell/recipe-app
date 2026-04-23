import React, { useState, useRef, useEffect } from 'react'; // Ajout de useState et useRef
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from '../../assets/Wrap de kebab savoureux et coloré.png'

interface NavbarProps {
  currentUser: any;
  onLogout: () => void; // On ajoute cette prop pour gérer la déconnexion
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    navigate('/login');
  };
  const handleSearch = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && searchTerm.trim()) {
    navigate(`/search/${searchTerm}`); // Envoie vers la page de recherche
    setSearchTerm(""); // Optionnel : vide le champ après la recherche
  }
};

  return (
    <nav className="main-navbar">
      <div className="nav-logo-section" onClick={() => navigate('/')}>
        <img 
          src={logo} // Displaying the tacos logo
          alt="Recipe App Logo" 
          className="navbar-tacos-logo" // New class for styling
        />
      </div>

      <div className="nav-search-section">
  <div className="search-wrapper">
    <span className="search-icon">🔍</span>
    <input 
      type="text" 
      placeholder="Search ..." 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleSearch} // Déclenche la recherche sur "Entrée"
    />
    <button className="filter-icon-btn">
       {/* Ton SVG filter... */}
    </button>
  </div>
</div>

      <div className="nav-user-section" ref={dropdownRef}>
        {currentUser ? (
          <>
            <div className="nav-profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <span className="nav-display-name">{currentUser.username}</span>
              <div className="nav-avatar-circle">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Profile" className="nav-avatar-img" />
                ) : (
                  <div className="nav-avatar-letter">{getInitials(currentUser.username)}</div>
                )}
              </div>
            </div>

            {/* DROPDOWN MENU - Style match with your image */}
            {showDropdown && (
              <div className="nav-dropdown-menu">
                <div className="dropdown-item" onClick={() => { navigate(`/profile/${currentUser._id}`); setShowDropdown(false); }}>
                  Profile
                </div>
                <div className="dropdown-item" onClick={() => { navigate('/create-recipe'); setShowDropdown(false); }}>
                  Create A Recipe
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout 
                  <span className="logout-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <button className="btn-login-small" onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;