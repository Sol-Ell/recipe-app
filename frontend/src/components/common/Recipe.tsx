import React from 'react';
import './Recipe.css';

// Icônes SVG
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
  variant: 'my-profile' | 'other-profile' | 'feed';
  title: string;
  image: string;
  authorName?: string;
  time: string;
  category: string;
  servings: number;
  rating?: number;
}

const RecipeCard: React.FC<RecipeProps> = ({ variant, title, image, authorName, time, category, servings, rating}) => {
  return (
    <div className="recipe-card-container">
      
      {/* 1. Header (Seulement pour la Home/Feed) */}
      {variant === 'feed' && (
        <div className="card-author-header">
          <div className="author-avatar-circle">
             <UserIcon />
          </div>
          <span className="author-name">{authorName || "Anonymous"}</span>
        </div>
      )}

      {/* 2. Image Image Card */}
      <div className="recipe-image-box">
        <img src={image} alt={title} />
        {/* Coeur (Seulement si PAS mon profil) */}
        {variant !== 'my-profile' && (
          <button className="like-heart-btn">❤️</button>
        )}
      </div>

      {/* 3. Content */}
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

        {/* 4. Stars (Seulement pour Other Profile et Feed) */}
        {rating && (
        <div className="recipe-stars">
          {"⭐".repeat(rating)}
        </div>
      )}
      </div>
    </div>
  );
};

export default RecipeCard;