import React, { useEffect } from 'react';
import './RecipeDetailModal.css';

// Interface for type safety
interface RecipeDetailModalProps {
  recipe: any; // TODO: Replace 'any' with a proper Recipe interface once Backend is merged
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose }) => {
  
  // Accessibility: Close modal when 'Escape' key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Safety check: do not render if no recipe data is provided
  if (!recipe) return null;

  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents closing the modal when clicking inside the content box */}
      <div className="rd-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="rd-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        {/* Hero Section: Dynamic Image & Recipe Title */}
        <div className="rd-header">
          <img 
            src={recipe.imageUrl || recipe.image} 
            alt={recipe.title} 
            className="rd-image" 
          />
          <div className="rd-title-wrapper">
            <h2 className="rd-title">{recipe.title}</h2>
            <span className="rd-category-tag">{recipe.category || 'Recipe'}</span>
          </div>
        </div>

        <div className="rd-body">
          {/* Metadata Section: Fetched from the .populate('author') in Backend */}
          <div className="rd-meta-bar">
            <div className="rd-author">
              <div className="rd-avatar">
                {recipe.author?.username?.charAt(0).toUpperCase() || 'C'}
              </div>
              <span>By <strong>{recipe.author?.username || 'Chef'}</strong></span>
            </div>
            <div className="rd-quick-stats">
              <span>⏱ {recipe.cookingTime || recipe.time} min</span>
              <span>👥 {recipe.servings || 4} servings</span>
            </div>
          </div>

          {/* Main Content Grid: Split between Ingredients and Instructions */}
          <div className="rd-details-grid">
            
            {/* Ingredients Column */}
            <section className="rd-ingredients">
              <h3>Ingredients</h3>
              <ul className="rd-ing-list">
                {recipe.ingredients?.map((ing: string, i: number) => (
                  <li key={i} className="rd-ing-item">
                    <input type="checkbox" id={`ing-${i}`} />
                    <label htmlFor={`ing-${i}`}>{ing}</label>
                  </li>
                ))}
              </ul>
            </section>

            {/* Preparation Steps Column */}
            <section className="rd-steps">
              <h3>Preparation</h3>
              <div className="rd-steps-list">
                {recipe.steps?.map((step: string, i: number) => (
                  <div key={i} className="rd-step-card">
                    <span className="rd-step-number">{i + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;