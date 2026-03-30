import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

interface NavbarProps {
  currentUser: any; // The logged-in user from App.tsx
}

const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  // Helper function to get initials if no avatar is present
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="main-navbar">
      {/* Left Section: Logo */}
      <div className="nav-logo-section" onClick={() => navigate('/')}>
        
        <div className="logo-text">
          THIS IS<br /><span>MY LOGO</span>
        </div>
      </div>

      {/* 2. Middle Section: Search Bar (as designed) */}
      <div className="nav-search-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search ..." />
          {/* Add the specific filter icon from your design */}
          <button className="filter-icon-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5H15M3 9H15M3 13.5H15" stroke="#3A5A40" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="6" cy="4.5" r="1.5" fill="white" stroke="#3A5A40" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="1.5" fill="white" stroke="#3A5A40" strokeWidth="1.5"/>
              <circle cx="9" cy="13.5" r="1.5" fill="white" stroke="#3A5A40" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 3. Right Section: User Profile Trigger */}
      <div className="nav-user-section">
        {currentUser ? (
          <div 
            className="nav-profile-trigger" 
            onClick={() => navigate(`/profile/${currentUser._id}`)}
          >
            {/* Real name from DB instead of "Name" */}
            <span className="nav-display-name">{currentUser.username}</span>
            <div className="nav-avatar-circle">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="nav-avatar-img" />
              ) : (
                <div className="nav-avatar-letter">{getInitials(currentUser.username)}</div>
              )}
            </div>
          </div>
        ) : (
          <button className="btn-login-small" onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;