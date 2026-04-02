import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import '../../index.css';
import './Profile.css';

interface ProfileProps {
  currentUser: any; // The authenticated user passed from App.tsx
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const { id } = useParams(); // Extracts the user ID from the URL string
  const [activeTab, setActiveTab] = useState('My Recipes');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Dynamic Check: Compare logged-in user ID with the Profile ID in the URL
const isOwnProfile = currentUser && id ? currentUser._id === id : false;

  // 1. Fetching recipes based on the selected tab and user ID
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = `/api/recipes/user/${id}`; // Default view
        
        // Adjust endpoint based on navigation tab
        if (activeTab === 'Likes') endpoint = '/api/recipes/my-likes';
        if (activeTab === 'Done') endpoint = '/api/recipes/my-done';

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecipes(res.data);
      } catch (err) {
        setRecipes([]); // Reset grid if request fails or data is empty
      } finally {
        // Keeps the shimmer visible for a split second for better UX feel
        setTimeout(() => setLoading(false), 800); 
      }
    };
    fetchRecipes();
  }, [activeTab, id]);

  // 2. Generates a consistent background color based on the username string
  const getAvatarColor = (name: string) => {
    const colors = ['#A3B18A', '#588157', '#3A5A40', '#344E41'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

 
  // --- SKELETON LOADING VIEW ---
  if (loading || !currentUser) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-top-background shimmer"></div>
        <div className="profile-main-card">
          <div className="profile-upper-info" style={{ flexDirection: 'column', alignItems: 'center' }}>
            <div className="skeleton circle-md shimmer"></div>
            <div className="skeleton title-md shimmer" style={{ marginTop: '20px' }}></div>
          </div>
          <div className="recipes-grid" style={{ marginTop: '50px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton card-lg shimmer"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-top-background"></div>

      <div className="profile-main-card">
        <div className="profile-upper-info">
          {/* AVATAR: Render image if available, otherwise show initial with colored background */}
          <div className="avatar-container">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="large-avatar" />
            ) : (
              <div 
                className="large-avatar fallback-avatar" 
                style={{ backgroundColor: getAvatarColor(currentUser?.username || "P") }}
              >
                {(currentUser?.username || "P").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-identity">
            <h1 className="user-fullname">{currentUser?.username || "User Name"}</h1>
            
            {/* Real-time stats from the database */}
            <div className="stats-row">
              <div className="stat-block">
                <span className="stat-value">{currentUser?.followers?.length || 0}</span>
                <span className="stat-label">followers</span>
              </div>
              <div className="stat-block">
                <span className="stat-value">{currentUser?.following?.length || 0}</span>
                <span className="stat-label">following</span>
              </div>
            </div>
          </div>

          {/* Action button changes based on profile ownership */}
          {isOwnProfile ? (
            <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
              Edit profile
            </button>
          ) : (
            <button className="follow-btn">Follow</button>
          )}
        </div>

        <hr className="divider" />

        {/* Navigation Tabs */}
        <nav className="tabs-nav">
          <button 
            className={activeTab === 'My Recipes' ? 'active' : ''} 
            onClick={() => setActiveTab('My Recipes')}
          >
            {isOwnProfile ? 'My Recipes' : 'Recipes'}
          </button>
          
          {/* Private tabs: Only visible if browsing your own profile */}
          {isOwnProfile && (
            <>
              <button 
                className={activeTab === 'Likes' ? 'active' : ''} 
                onClick={() => setActiveTab('Likes')}
              >
                Likes
              </button>
              <button 
                className={activeTab === 'Done' ? 'active' : ''} 
                onClick={() => setActiveTab('Done')}
              >
                Done
              </button>
            </>
          )}
        </nav>

        {/* Recipes Rendering Grid */}
        <div className="recipes-grid">
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <RecipeCard 
                key={recipe._id}
                variant={!isOwnProfile ? 'other-profile' : activeTab === 'My Recipes' ? 'my-profile' : 'feed'}
                title={recipe.title}
                time={recipe.cookingTime || "30 min"}
                category={recipe.category || "Food"}
                servings={recipe.servings || 2}
                rating={recipe.rating || 4}
                image={recipe.image}
              />
            ))
          ) : (
            <p className="no-data-msg">No recipes found here yet.</p>
          )}
        </div>
      </div>

      {/* MODAL: Profile Update Form */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <div className="input-group">
              <label>Username</label>
              <input type="text" defaultValue={currentUser?.username} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;