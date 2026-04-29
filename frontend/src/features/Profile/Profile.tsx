import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, useParams } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import '../../index.css';
import './Profile.css';

interface ProfileProps {
  setUser:(currentUser: any) => void; // The authenticated user passed from App.tsx
  currentUser: any
}


// Ajoute setUser ici dans les accolades
const Profile: React.FC<ProfileProps> = ({ currentUser, setUser }) => {
  const { id } = useParams(); // Extracts the user ID from the URL string
  const [activeTab, setActiveTab] = useState('My Recipes');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave(); // Trigger save if already in edit mode
    } else {
      setIsEditing(true); // Switch to edit mode
    }
  };

  const handleTriggerFileInput = () => {
    // Programmatically "click" the hidden file input

    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file

    if (file) {
      const reader = new FileReader(); // Create a FileReader

      // Event listener: executes when reading is successfully finished
      reader.onloadend = () => {
        const base64String = reader.result as string; // Convert to Base64 string
        setNewAvatar(base64String); // Set state for immediate local preview
      };

      reader.readAsDataURL(file); // Start reading file content as Data URL (Base64)
    }
  };
  
  const handleSave = async () => {
    // Combine existing save logic (passwords match...)
    
    try {
      console.log("Saving new profile photo (Base64)...", newAvatar);
      // API CALL HERE: axios.patch('/api/users/profile', { avatar: newAvatar, ... })
      
      // Update local context/state with the new avatar after success API call
      // setUser({...currentUser, avatar: newAvatar}); 

      setIsEditing(false); // Switch off edit mode
      setNewAvatar(null); // Reset temp avatar state
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to save changes.");
    }
  };

  const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState({
      email : "",
      password : "",
  
    });
  
  // Dynamic Check: Compare logged-in user ID with the Profile ID in the URL
const isOwnProfile = currentUser && id ? currentUser._id === id : false;

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await axios.post("/api/users/login", formData);
        localStorage.setItem("token", res.data.token);
        console.log(res.data);
        setUser(res.data);
        window.location.href = '/';
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Here TypeScript knows that's a Axios error
        setError(err.response?.data?.message || "Login failed");
      } else {
        // Errors don't come from axios
        setError("An unexpected error occurred");
      }
    };
    console.log("Submit:", formData);

  };

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
           {newAvatar ? (
              <img src={newAvatar} alt="New Profile Preview" className="large-avatar local-preview" />
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
              <button 
                className="change-photo-btn" 
                onClick={handleTriggerFileInput} // Triggers hidden input
                type="button" // Important to not submit any form
              >
                Change Picture
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} // Relates the ref to this element
              style={{ display: 'none' }} // Hides the element visually
              accept="image/*" // Restricts selection to images
              onChange={handleFileChange} // Executes preview logic on change
            />
          </div>
          
          <div className="profile-identity">
            <h1 className="user-fullname">{currentUser?.username || "User Name"}</h1>
          </div>

          {isOwnProfile && (
            <button className={isEditing ? "save-profile-btn" : "edit-profile-btn"} onClick={handleEditToggle}>
              {isEditing ? "Save changes" : "Edit profile"}
            </button>
          )}
        </div>

        <hr className="divider" />
        {isEditing ? (
  /* FORMULAIRE D'ÉDITION */
  <div className="edit-mode-container">
    {/* Tes inputs Email / Password ici */}
    <h1>Password</h1>
          <form id="editing-form">
            <input 
                  name="password" // INDISPENSABLE
                  type={"password"} 
                  placeholder="At least 8 characters" 
                  required 
                />
                <input 
                  name="password" // INDISPENSABLE
                  type={"password"} 
                  placeholder="At least 8 characters" 
                  required 
                />
                <input 
                  name="password" // INDISPENSABLE
                  type={"password"} 
                  placeholder="At least 8 characters" 
                  required 
                />
            



          </form>
          <h1>Email</h1>
  </div>
) : (
  /* MODE VUE CLASSIQUE */
  <>
    <nav className="tabs-nav">
       {/* Tes boutons My Recipes / Likes ici */}
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
            </>
          )}
        </nav>
    </nav>
    <div className="recipes-grid">
       {/* Tes cartes de recettes ici */}
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
  </>
)}

      
      </div>

      
    </div>
  );
};

export default Profile;