import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal'; 
import '../../index.css';
import './Profile.css';

const CUISINE_STYLES = ['French', 'Italian', 'Spanish', 'Japanese', 'Mexican'];
const DIETARY_TYPES = ['Healthy', 'Tasty', 'Veggie', 'Meat Lover', 'Low Calories'];
const LEVEL = ['Beginner', 'Amateur', 'Intermediate', 'Advanced', 'Professional', 'Master Chef'];

interface ProfileProps {
  setUser: (currentUser: any) => void; 
  currentUser: any;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, recipeId: null as string | null });

  const [activeTab, setActiveTab] = useState('My Recipes');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'tags'>('none');
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const [tags, setTags] = useState<{ cuisine: string[], dietary: string[], level: string[] }>({
    cuisine: currentUser?.cuisineTags || [],
    dietary: currentUser?.dietaryTags || [],
    level: currentUser?.levelTags || []
  });

  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    newPassword: "", confirmPassword: "", currentEmailInput: "", newEmail: ""
  });

  const isOwnProfile = !id || (currentUser && id === currentUser._id);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isOwnProfile) {
        setViewedUser(currentUser);
        setTags({
          cuisine: currentUser?.cuisineTags || [],
          dietary: currentUser?.dietaryTags || [],
          level: currentUser?.levelTags || []
        });
      } else if (id) {
        try {
          const res = await axios.get(`/api/edit/profile/${id}`); // CORRIGÉ
          setViewedUser(res.data);
        } catch (err) {
          console.error("Utilisateur introuvable");
        }
      }
    };
    fetchUserData();
  }, [id, currentUser, isOwnProfile]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const targetId = id || currentUser?._id; 
        let endpoint = `/api/recipes/user/${targetId}`; 
        if (activeTab === 'Likes') endpoint = '/api/recipes/my-likes';

        const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        setRecipes(res.data);
      } catch (err) {
        setRecipes([]); 
      } finally {
        setTimeout(() => setLoading(false), 800); 
      }
    };
    fetchRecipes();
  }, [activeTab, id, currentUser]); 

  const toggleTag = (category: 'cuisine' | 'dietary' | 'level', tag: string) => {
    setTags(prev => {
      const currentList = prev[category];
      const limit = category === 'level' ? 1 : 3;

      if (currentList.includes(tag)) {
        return { ...prev, [category]: currentList.filter(t => t !== tag) };
      }
      if (currentList.length >= limit) {
        alert(`You can only select up to ${limit} ${category} tags.`);
        return prev;
      }
      return { ...prev, [category]: [...currentList, tag] };
    });
  };

  const handleOpenModal = (recipeId: string) => {
    const clickedRecipe = recipes.find(r => r._id === recipeId);
    if (clickedRecipe) setSelectedRecipe(clickedRecipe);
  };

  const handleTriggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
      if (editData.newEmail === currentUser.email) return alert("Error: New email must be different from current.");
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        avatar: newAvatar || currentUser.avatar,
        email: editData.newEmail || currentUser.email,
        password: editData.newPassword || undefined,
        cuisineTags: tags.cuisine,
        dietaryTags: tags.dietary,
        levelTags: tags.level
      };

      const res = await axios.patch(`/api/edit/update-profile`, payload, {
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
  const handleEditRecipe = () => {
  if (contextMenu.recipeId) {
    navigate(`/edit-recipe/${contextMenu.recipeId}`);
  }
};

const handleDeleteRecipe = async () => {
  if (!contextMenu.recipeId) return;
  if (window.confirm("Es-tu sûr de vouloir supprimer cette recette ? 🗑️")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/recipes/${contextMenu.recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(prev => prev.filter(r => r._id !== contextMenu.recipeId));
      alert("Recette supprimée !");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }
};
useEffect(() => {
  const closeMenu = () => setContextMenu({ ...contextMenu, visible: false });
  window.addEventListener('click', closeMenu);
  return () => window.removeEventListener('click', closeMenu);
}, [contextMenu]);

  const sortedRecipes = [...recipes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
  });

  if (loading || !viewedUser) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-top-background shimmer"></div>
        <div className="profile-main-card">
           <div className="skeleton circle-md shimmer center"></div>
        </div>
      </div>
    );
  }

  const profileName = viewedUser?.username || "User";
  const displayAvatar = newAvatar || viewedUser?.avatar || `https://ui-avatars.com/api/?name=${profileName}&background=3A5A40&color=fff&size=150&bold=true`;

  const displayTags = isOwnProfile ? [...tags.cuisine, ...tags.level, ...tags.dietary] : [...(viewedUser?.cuisineTags || []), ...(viewedUser?.levelTags || []), ...(viewedUser?.dietaryTags || [])];

  return (
    <div className="profile-page-wrapper">
      <div className="profile-top-background"></div>

      <div className="profile-main-card">
        <div className="profile-upper-info">
          
          <div className="avatar-container">
            <img src={displayAvatar} alt="Profile" className="large-avatar" />
            {isEditing && <button className="change-photo-btn" onClick={handleTriggerFileInput}>Change Picture</button>}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
          </div>
          
          <div className="profile-details-column">
            <div className="profile-identity">
              <h1 className="user-fullname">{profileName}</h1>
            </div>

            <div className="tags-section-pr">
              <div className="tags-container-centered">
                {displayTags.map((tag, index) => (
                  <span key={index} className="recipe-tag">{tag}</span>
                ))}
                {isEditing && (
                  <button className="add-tag-pill" onClick={() => setActiveModal('tags')}>+ Edit Tags</button>
                )}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <button className={isEditing ? "save-profile-btn" : "edit-profile-btn"} onClick={isEditing ? handleSave : () => setIsEditing(true)}>
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
                <div className="input-group"><label>New password</label><input name="newPassword" type="password" onChange={handleInputChange}/></div>
                <div className="input-group"><label>Confirm password</label><input name="confirmPassword" type="password" onChange={handleInputChange}/></div>
              </div>
              <div className="edit-section">
                <h1>Change Email</h1>
                <div className="input-group"><label>Actual email</label><input name="currentEmailInput" type='email' onChange={handleInputChange} value={editData.currentEmailInput}/></div>
                <div className="input-group"><label>New email</label><input name="newEmail" type="email" onChange={handleInputChange}/></div>
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
                <button className={activeTab === 'Likes' ? 'active' : ''} onClick={() => setActiveTab('Likes')}>Likes</button>
              )}
            </nav>

            <div className="recipes-grid">
              {sortedRecipes.length > 0 ? (
                sortedRecipes.map(recipe => (
                  <div 
  key={recipe._id} 
  style={{ cursor: 'context-menu' }} 
  onContextMenu={(e) => {
    e.preventDefault(); 
    
    if (isOwnProfile && activeTab === 'My Recipes') {
      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, recipeId: recipe._id });
    }
  }}
>
                  <RecipeCard 
                    key={recipe._id}
                    id={recipe._id}
                    authorName={recipe.author?.username}
                    authorAvatar={recipe.author?.avatar}
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
                  </div>
                ))
              ) : (
                <p className="no-data-msg">No recipes found here yet.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* --- TAGS MODAL --- */}
      {activeModal === 'tags' && (
        <div className="modal-overlay">
          <div className="tag-modal">
            <div className="modal-header">
              <span className="close-x" onClick={() => setActiveModal('none')}>ⓧ</span>
              <h2>Edit Profile Tags</h2>
              <span className="save-icon" onClick={() => setActiveModal('none')}>💾</span>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-head"><h3>Cuisine Style</h3> <span>{tags.cuisine.length}/3</span></div>
                <div className="tag-options">
                  {CUISINE_STYLES.map(tag => (
                    <button key={tag} className={`tag-opt ${tags.cuisine.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag('cuisine', tag)}>
                      {tag} {tags.cuisine.includes(tag) ? '×' : '+'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <div className="section-head"><h3>Level of cook</h3> <span>{tags.level.length}/1</span></div>
                <div className="tag-options">
                  {LEVEL.map(tag => (
                    <button key={tag} className={`tag-opt ${tags.level.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag('level', tag)}>
                      {tag} {tags.level.includes(tag) ? '×' : '+'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <div className="section-head"><h3>Dietary/Type</h3> <span>{tags.dietary.length}/3</span></div>
                <div className="tag-options">
                  {DIETARY_TYPES.map(tag => (
                    <button key={tag} className={`tag-opt ${tags.dietary.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag('dietary', tag)}>
                      {tag} {tags.dietary.includes(tag) ? '×' : '+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RECIPE MODAL --- */}
      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {contextMenu.visible && (
        <div 
          style={{
            position: 'absolute', top: contextMenu.y, left: contextMenu.x,
            backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden', minWidth: '120px'
          }}
          onClick={(e) => e.stopPropagation()} // Empêche le menu de se fermer tout seul quand on clique dedans
        >
          <button 
            style={{ display: 'block', width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#3A5A40', fontWeight: 'bold' }}
            onClick={handleEditRecipe}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✏️ Edit
          </button>
          <button 
            style={{ display: 'block', width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#d90429', fontWeight: 'bold' }}
            onClick={handleDeleteRecipe}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🗑️ Delete
          </button>
        </div>
      )}

    </div>
  );
};

export default Profile;