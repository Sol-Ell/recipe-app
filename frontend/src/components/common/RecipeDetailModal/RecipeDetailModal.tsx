import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 NOUVEAU : Pour pouvoir rediriger
import './RecipeDetailModal.css';

interface RecipeModalProps {
  recipe: any;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const navigate = useNavigate(); // 👈 Initialise la navigation

  if (!recipe) return null;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  
  // 👈 CORRECTION : Ton backend envoie "steps" (et non "instructions") 
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];

  // 👈 NOUVELLE FONCTION : Clic sur le chef
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // On récupère l'ID du chef (selon si le backend a envoyé un objet complet ou juste l'ID)
    const authorId = typeof recipe.author === 'object' ? recipe.author?._id : recipe.author;
    
    if (authorId) {
      onClose(); // On ferme la modale pour que ce soit propre
      navigate(`/profile/${authorId}`); // On navigue vers son profil
    }
  };

  // Sécurisation des données de l'auteur
  const authorName = recipe.author?.username || "Chef Anonyme";
  const authorAvatar = recipe.author?.avatar || 'https://via.placeholder.com/40';

  return (
    <div className="rd-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rd-close-btn" onClick={onClose}>&times;</button>
        
        <div className="rd-grid">
          {/* GAUCHE : Visuel */}
          <div className="rd-image-side">
            <img src={recipe.imageUrl || recipe.image || 'https://via.placeholder.com/400'} alt={recipe.title} />
            <div className="rd-badge">{recipe.category || 'Gourmet'}</div>
          </div>

          {/* DROITE : Infos */}
          <div className="rd-info-side">
            <header>
              <h1>{recipe.title}</h1>
              
              {/* 👈 NOUVEAU : Zone Auteur cliquable avec Photo (PP) et Nom */}
              <div 
                className="rd-author-clickable" 
                onClick={handleAuthorClick}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', 
                  cursor: 'pointer', marginTop: '10px', marginBottom: '15px' 
                }}
              >
                <img 
                  src={authorAvatar} 
                  alt={authorName} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <p className="rd-author" style={{ margin: 0, fontSize: '1.1rem' }}>
                  Chef : <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{authorName}</span>
                </p>
              </div>

              <div className="rd-tags-wrapper">
                {[...(recipe.cuisineTags || []), ...(recipe.dietaryTags || ["Tasty"])].map((tag, i) => (
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
                  {ingredients.map((ing: any, i: number) => (
                    <li key={i}>
                      <strong>{ing.quantity} {ing.unit}</strong> de {ing.name}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>Préparation</h3>
                {steps.length > 0 ? (
                  <div className="rd-step-section">
                    {/* 👈 CORRECTION : Adapté à ta base de données (liste simple) */}
                    {steps.map((step: string, i: number) => (
                      <p > {step}</p>
                    ))}
                  </div>
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