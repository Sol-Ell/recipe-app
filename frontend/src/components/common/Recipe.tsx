import React, { useState } from 'react';
import './Recipe.css';

// ... (garde tes icônes TimerIcon, ForkKnifeIcon, etc. en haut)

interface RecipeProps {
  id: string;
  variant: 'my-profile' | 'other-profile' | 'feed';
  title: string;
  image: string;
  authorName?: string;
  authorAvatar?: string; // NOUVEAU
  time: string;
  category: string;
  servings: number;
  rating?: number;
  isFavoriteInitial?: boolean;
  currentUser: any;
  onOpenRecipeModal: (id: string) => void; 
}
/**
 * SVG Icons Components - À mettre avant le composant RecipeCard
 */
const TimerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ForkKnifeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8c0 3.61-.19 6-2 8h-3V4h3c1.81 2 2 4.39 2 8Z"/><path d="M2 8V2v6Z"/><path d="M2 18V2h0a4 4 0 0 1 4 4v12Z"/><path d="M6 20l0-18"/></svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const RecipeCard: React.FC<RecipeProps> = ({ 
  id, variant, title, image, authorName, authorAvatar, time, category, servings, rating, 
  isFavoriteInitial, currentUser, onOpenRecipeModal 
}) => {
  
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial || false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      window.alert("Login to like this masterclass ! 🍝");
      return;
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="recipe-card-container" onClick={() => onOpenRecipeModal(id)}>
      
      {/* 1. HEADER : Photo du Chef + Nom */}
      {variant === 'feed' && (
        <div className="card-author-header">
          <img 
            src={authorAvatar || 'https://via.placeholder.com/150'} 
            alt={authorName} 
            className="author-avatar-img"
          />
          <span className="author-name">{authorName || "Chef Anonyme"}</span>
        </div>
      )}

      {/* 2. IMAGE + CŒUR ANIMÉ */}
      <div className="recipe-image-box">
        <img src={image} alt={title} className="main-recipe-img" />
        
        {variant !== 'my-profile' && (
          <button 
            className={`card-like-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleHeartClick}
          >
            <svg viewBox="0 0 24 24" className="heart-icon-svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="recipe-body">
        <h3 className="recipe-title">{title}</h3>
        <div className="recipe-stats-row">
          <div className="stat"><TimerIcon /> <span>{time}</span></div>
          <div className="stat"><ForkKnifeIcon /> <span>{category}</span></div>
          <div className="stat"><UserIcon /> <span>{servings} pers.</span></div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;