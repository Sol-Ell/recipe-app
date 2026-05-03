import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import '../../index.css';
import './Profile.css';

const CUISINE_STYLES = ['French', 'Italian', 'Spanish', 'Japanese', 'Mexican'];
const DIETARY_TYPES = ['Healthy', 'Tasty', 'Veggie', 'Meat Lover', 'Low Calories'];
const LEVEL = [
  'Beginner', 'Amateur', 'Intermediate', 'Advanced', 'Professional', 'Master Chef'
];

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
  const [error, setError] = useState<string>("");
  const [activeModal, setActiveModal] = useState<'none' | 'tags' | 'category'>('none');

  // --- TAGS STATE ---
  const [tags, setTags] = useState<{ cuisine: string[], dietary: string[], level: string[] }>({
    cuisine: currentUser?.cuisineTags || [],
    dietary: currentUser?.dietaryTags || [],
    level: currentUser?.levelTags || []
  });

  // --- EDITING STATES ---
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    newPassword: "",
    confirmPassword: "",
    currentEmailInput: "",
    newEmail: ""
  });

  const isOwnProfile = currentUser && id ? currentUser._id === id : false;

  // --- TAG LOGIC ---
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

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = `/api/recipes/user/${id}`;
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
  }, [activeTab, id]);

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
    // Password Validation
    if (editData.newPassword || editData.confirmPassword) {
      if (editData.newPassword !== editData.confirmPassword) {
        alert("Error: New passwords do not match!");
        return;
      }
      if (editData.newPassword.length < 8) {
        alert("Error: Password must be at least 8 characters.");
        return;
      }
    }

    // Email Validation
    if (editData.newEmail) {
      if (editData.currentEmailInput !== currentUser.email) {
        alert("Error: The current email entered is incorrect.");
        return;
      }
      if (editData.newEmail === currentUser.email) {
        alert("Error: New email must be different from current.");
        return;
      }
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

  const getAvatarColor = (name: string) => {
    const colors = ['#A3B18A', '#588157', '#3A5A40', '#344E41'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading || !currentUser) {
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
            {newAvatar ? (
              <img src={newAvatar} alt="Preview" className="large-avatar local-preview" />
            ) : currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="large-avatar" />
            ) : (
              <div
                className="large-avatar fallback-avatar"
                style={{ backgroundColor: getAvatarColor(currentUser?.username || "P") }}
              >
                {(currentUser?.username || "P").charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <button className="change-photo-btn" onClick={handleTriggerFileInput}>Change Picture</button>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="profile-details-column">
            <div className="profile-identity">
              <h1 className="user-fullname">{currentUser?.username || "User Name"}</h1>
            </div>
            <div className="tags-section-pr">
              <div className="tags-container-centered">
                {[...tags.cuisine, ...tags.level, ...tags.dietary].map((tag, index) => (
                  <span key={index} className="recipe-tag">{tag}</span>
                ))}
                {isEditing && (
                  <button className="add-tag-pill" onClick={() => setActiveModal('tags')}>+ Edit Tags</button>
                )}
              </div>
            </div>
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
                <div className="input-group">
                  <label>New password</label>
                  <input name="newPassword" type="password" onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Confirm password</label>
                  <input name="confirmPassword" type="password" onChange={handleInputChange} />
                </div>
              </div>

              <div className="edit-section">
                <h1>Change Email</h1>
                <div className="input-group">
                  <label>Actual email</label>
                  <input name="currentEmailInput" type='email' value={editData.currentEmailInput} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>New email</label>
                  <input name="newEmail" type="email" onChange={handleInputChange} />
                </div>
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
              {recipes.length > 0 ? (
                recipes.map(recipe => <RecipeCard key={recipe._id} {...recipe} />)
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
    </div>
  );
};

export default Profile;