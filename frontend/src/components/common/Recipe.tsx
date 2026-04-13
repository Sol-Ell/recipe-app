import React, { useState } from 'react';
import './Recipe.css';

/**
 * SVG Icons Components
 */
const TimerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ForkKnifeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8c0 3.61-.19 6-2 8h-3V4h3c1.81 2 2 4.39 2 8Z"/><path d="M2 8V2v6Z"/><path d="M2 18V2h0a4 4 0 0 1 4 4v12Z"/><path d="M6 20l0-18"/></svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

interface RecipeProps {
  id: string;
  variant: 'my-profile' | 'other-profile' | 'feed';
  title: string;
  image: string;
  authorName?: string;
  time: string;
  category: string;
  servings: number;
  rating?: number;
  isFavoriteInitial?: boolean;
  currentUser: any; // Must match the object from App.tsx/Navbar
  onOpenRecipeModal: (id: string) => void; 
}

const RecipeCard: React.FC<RecipeProps> = ({ 
  id, variant, title, image, authorName, time, category, servings, rating, 
  isFavoriteInitial, currentUser, onOpenRecipeModal 
}) => {
  
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial || false);

  /**
   * Handles favorite toggle logic.
   * Checks if currentUser exists (is logged in).
   */
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents opening the recipe modal

    if (!currentUser) {
      window.alert("Please login first to use favorites!");
      return;
    }

    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    // API Call would go here: 
    // console.log(`Recipe ${id} favorite status: ${newStatus}`);
  };

  const handleCardClick = () => {
    onOpenRecipeModal(id);
  };

  return (
    <div className="recipe-card-container" onClick={handleCardClick}>
      
      {/* 1. Author Header - Feed view only */}
      {variant === 'feed' && (
        <div className="card-author-header">
          <div className="author-avatar-circle">
            <UserIcon />
          </div>
          <span className="author-name">{authorName || "Anonymous"}</span>
        </div>
      )}

      {/* 2. Recipe Image with Favorite Overlay */}
      <div className="recipe-image-box">
        <img src={image} alt={title} />
        
        {variant !== 'my-profile' && (
          <button 
            className={`like-heart-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleHeartClick}
            title={currentUser ? "Favorite" : "Login to favorite"}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* 3. Card Content */}
      <div className="recipe-body">
        <h3 className="recipe-title">{title}</h3>
        
        <div className="recipe-stats-row">
          <div className="stat">
            <TimerIcon /> <span>{time}</span>
          </div>
          <div className="stat">
            <ForkKnifeIcon /> <span>{category}</span>
          </div>
          <div className="stat">
            <UserIcon /> <span>{servings}</span>
          </div>
        </div>

        {/* 4. Rating Stars */}
        {rating && (
          <div className="recipe-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < rating ? "star-filled" : "star-empty"}>
                {i < rating ? '★' : '☆'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;