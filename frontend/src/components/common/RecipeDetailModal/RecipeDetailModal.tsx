import React from 'react';
import './RecipeDetailModal.css';

interface RecipeModalProps {
  recipe: any;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  // Sécurité : Si le back n'envoie pas de tableau, on en crée un vide
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

  return (
    <div className="rd-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rd-close-btn" onClick={onClose}>&times;</button>
        
        <div className="rd-grid">
          {/* GAUCHE : Visuel */}
          <div className="rd-image-side">
            <img src={recipe.imageUrl || 'https://via.placeholder.com/400'} alt={recipe.title} />
            <div className="rd-badge">{recipe.category || 'Gourmet'}</div>
          </div>

          {/* DROITE : Infos */}
          <div className="rd-info-side">
            <header>
              <h1>{recipe.title}</h1>
              <p className="rd-author">Chef : <span>{recipe.author?.username || "Elio (Admin)"}</span></p>
              <div className="rd-tags-wrapper">
    {[...(recipe.cuisineTags || []), ...(recipe.dietaryTags || ["cheesy"])].map((tag, i) => (
      <span key={i} className="rd-tag-item">
        <span className="rd-tag-dot">#</span> {tag}
      </span>
    ))}
  </div>
            </header>

            <div className="rd-details">
              <section>
                <h3>Ingrédients</h3>
                <ul>
                  {ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                </ul>
              </section>

              <section>
                <h3>Préparation</h3>
                {instructions.length > 0 ? (
                  instructions.map((section: any, i: number) => (
                    <div key={i} className="rd-step-section">
                      <h4>{section.category}</h4>
                      {section.steps.map((s: string, j: number) => <p key={j}><strong>{j+1}.</strong> {s}</p>)}
                    </div>
                  ))
                ) : (
                  <p>Aucune instruction pour le moment.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;