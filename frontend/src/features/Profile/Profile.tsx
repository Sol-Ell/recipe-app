import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal'; 
import '../../index.css';
import './Profile.css';

interface ProfileProps {
  setUser: (currentUser: any) => void; 
  currentUser: any;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- UI & NAVIGATION STATES ---
  const [activeTab, setActiveTab] = useState('My Recipes');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // NOUVEAU : On stocke l'utilisateur que l'on est en train de regarder
  const [viewedUser, setViewedUser] = useState<any>(null);

  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const handleOpenModal = (recipeId: string) => {
    // On cherche la recette complète dans notre liste grâce à son ID
    const clickedRecipe = recipes.find(r => r._id === recipeId);
    if (clickedRecipe) {
      setSelectedRecipe(clickedRecipe);
    }
  };
  // --- EDITING STATES ---
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    newPassword: "",
    confirmPassword: "",
    currentEmailInput: "",
    newEmail: ""
  });

  // CORRECTION : Mieux gérer si c'est notre profil ou non
  const isOwnProfile = !id || (currentUser && id === currentUser._id);

  // --- NOUVEAU 1: FETCH DES INFOS DE L'UTILISATEUR ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOwnProfile) {
        // Si c'est mon profil, on affiche mes infos direct
        setViewedUser(currentUser);
      } else if (id) {
        // Si c'est un autre profil, on demande au serveur ses infos
        try {
          const res = await axios.get(`/api/users/profile/${id}`);
          setViewedUser(res.data);
        } catch (err) {
          console.error("Utilisateur introuvable");
        }
      }
    };
    fetchUserData();
  }, [id, currentUser, isOwnProfile]);

  // --- 2. RECIPE FETCHING LOGIC ---
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const targetId = id || currentUser?._id; 
        let endpoint = `/api/recipes/user/${targetId}`; 
        
        if (activeTab === 'Likes') endpoint = '/api/recipes/my-likes';

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecipes(res.data);
      } catch (err) {
        setRecipes([]); 
      } finally {
        setTimeout(() => setLoading(false), 800); 
      }
    };
    fetchRecipes();
  }, [activeTab, id, currentUser]); 

  // --- PROFILE IMAGE EDITING LOGIC ---
  const handleTriggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- SAVE LOGIC ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editData.newPassword || editData.confirmPassword) {
      if (editData.newPassword !== editData.confirmPassword) return alert("Error: New passwords do not match!");
      if (editData.newPassword.length < 8) return alert("Error: Password must be at least 8 characters.");
    }
    if (editData.newEmail) {
      if (editData.currentEmailInput !== currentUser.email) return alert("Error: The current email entered is incorrect.");
      if (editData.newEmail === currentUser.email) return alert("Error: New email must be different from the current one.");
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        avatar: newAvatar || currentUser.avatar,
        email: editData.newEmail || currentUser.email,
        password: editData.newPassword || undefined
      };

      const res = await axios.patch(`/api/users/update-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200 || res.status === 201) {
        alert("Profile updated successfully! 🎉");
        setUser(res.data.user); 
        setIsEditing(false);
        setNewAvatar(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#A3B18A', '#588157', '#3A5A40', '#344E41'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // --- LOGIQUE DE TRI ---
  const sortedRecipes = [...recipes].sort((a, b) => {
    const aLiked = a.likes?.includes(currentUser?._id) ? 1 : 0;
    const bLiked = b.likes?.includes(currentUser?._id) ? 1 : 0;
    return bLiked - aLiked; 
  });

  if (loading || !viewedUser) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-top-background shimmer"></div>
        <div className="profile-main-card">
           <div className="skeleton circle-md shimmer center"></div>
           <div className="recipes-grid">
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
          <div className="avatar-container">
            {/* NOUVEAU : On utilise viewedUser pour l'affichage public */}
            {newAvatar ? (
              <img src={newAvatar} alt="Preview" className="large-avatar local-preview" />
            ) : viewedUser?.avatar ? (
              <img src={viewedUser.avatar} alt="Profile" className="large-avatar" />
            ) : (
              <div 
                className="large-avatar fallback-avatar" 
                style={{ backgroundColor: getAvatarColor(viewedUser?.username || "P") }}
              >
                {(viewedUser?.username || "P").charAt(0).toUpperCase()}
              </div>
            )}
            
            {isEditing && (
              <button className="change-photo-btn" onClick={handleTriggerFileInput}>
                Change Picture
              </button>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
          </div>
          
          <div className="profile-identity">
            {/* NOUVEAU : On affiche le pseudo du viewedUser */}
            <h1 className="user-fullname">{viewedUser?.username || "User Name"}</h1>
          </div>

          {isOwnProfile && (
            <button 
              className={isEditing ? "save-profile-btn" : "edit-profile-btn"} 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? "Save changes" : "Edit profile"}
            </button>
          )}
        </div>

        <hr className="divider" />

        {isEditing ? (
          <div className="edit-mode-container">
            <div className="edit-grid">
              <div className="edit-section">
                <h1>Change Password</h1>
                <div className="input-group"><label>Enter the new password</label><input name="newPassword" type="password" onChange={handleInputChange}/></div>
                <div className="input-group"><label>Confirm new password</label><input name="confirmPassword" type="password" onChange={handleInputChange}/></div>
              </div>
              <div className="edit-section">
                <h1>Change Email</h1>
                <div className="input-group"><label>Enter the actual email</label><input name="currentEmailInput" type='email' onChange={handleInputChange} value={editData.currentEmailInput}/></div>
                <div className="input-group"><label>Enter the new email</label><input name="newEmail" type="email" onChange={handleInputChange}/></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <nav className="tabs-nav">
              <button className={activeTab === 'My Recipes' ? 'active' : ''} onClick={() => setActiveTab('My Recipes')}>
                {isOwnProfile ? 'My Recipes' : 'Recipes'}
              </button>
              {isOwnProfile && (
                <button className={activeTab === 'Likes' ? 'active' : ''} onClick={() => setActiveTab('Likes')}>
                  Likes
                </button>
              )}
            </nav>

            <div className="recipes-grid">
              {sortedRecipes.length > 0 ? (
                sortedRecipes.map(recipe => (
                  <RecipeCard 
                  authorName={recipe.author?.username}
                  authorAvatar={recipe.author?.avatar}
                  key={recipe._id}
                  id={recipe._id}
                  authorId={typeof recipe.author === 'object' ? recipe.author?._id : recipe.author} 
                  currentUser={currentUser}
                  isFavoriteInitial={recipe.likes?.includes(currentUser?._id)} 
                  variant={!isOwnProfile ? 'other-profile' : activeTab === 'My Recipes' ? 'my-profile' : 'feed'}
                  title={recipe.title}
                  time={recipe.cookingTime ? `${recipe.cookingTime} min` : "30 min"}
                  category={recipe.category || "Food"}
                  servings={recipe.servings || 2}
                  rating={recipe.rating || 4}
                  image={recipe.imageUrl || recipe.image} 
                  onOpenRecipeModal={handleOpenModal} 
      />
                ))
              ) : (
                <p className="no-data-msg">No recipes found here yet.</p>
              )}
            </div>
          </>
        )}
      </div>
      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

export default Profile;