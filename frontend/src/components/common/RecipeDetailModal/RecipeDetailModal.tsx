import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetailModal.css';

interface RecipeModalProps {
  recipe: any;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const navigate = useNavigate();

  if (!recipe) return null;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const rawSteps = Array.isArray(recipe.steps) ? recipe.steps : [];

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const authorId = typeof recipe.author === 'object' ? recipe.author?._id : recipe.author;
    
    if (authorId) {
      onClose();
      navigate(`/profile/${authorId}`);
    }
  };

  const authorName = recipe.author?.username || "Chef Anonyme";
  const authorAvatar = recipe.author?.avatar || `https://ui-avatars.com/api/?name=${authorName}&background=588157&color=fff&bold=true`;

  const cuisineTags = recipe.cuisineTags || recipe.author?.cuisineTags || [];
  const dietaryTags = recipe.dietaryTags || recipe.author?.dietaryTags || [];
  const levelTags = recipe.levelTags || recipe.author?.levelTags || [];

  const displayTags = [...cuisineTags, ...dietaryTags, ...levelTags];

  if (displayTags.length === 0) {
    displayTags.push("Gourmand", "Fait Maison");
  }

  const parsedSections: { title: string, steps: string[] }[] = [];
  let currentSection = { title: "Préparation", steps: [] as string[] };

  rawSteps.forEach((step: string) => {
    if (step.startsWith('SECTION:')) {
      if (currentSection.steps.length > 0 || currentSection.title !== "Préparation") {
        parsedSections.push(currentSection);
      }
      currentSection = { title: step.replace('SECTION:', '').trim(), steps: [] };
    } else {
      currentSection.steps.push(step);
    }
  });
  if (currentSection.steps.length > 0) {
    parsedSections.push(currentSection);
  }

  return (
    <div className="rd-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rd-close-btn" onClick={onClose}>&times;</button>
        
        <div className="rd-grid">
          <div className="rd-image-side">
            <img src={recipe.imageUrl || recipe.image || 'https://via.placeholder.com/400'} alt={recipe.title} />
            <div className="rd-badge">{recipe.category || 'Gourmet'}</div>
          </div>

          <div className="rd-info-side">
            <header>
              <h1>{recipe.title}</h1>
              
              <div 
                className="rd-author-clickable" 
                onClick={handleAuthorClick}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px', marginBottom: '15px' }}
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
                {displayTags.map((tag, i) => (
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

              <section className="rd-instructions-container">
                {parsedSections.length > 0 ? (
                  parsedSections.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <h3 style={{ color: '#588157', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>
                        {section.title}
                      </h3>
                      
                      {/* Les étapes de cette sous-section */}
                      <div className="rd-step-section">
                        {section.steps.map((step: string, stepIdx: number) => (
                          <p key={stepIdx} style={{ marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#3A5A40' }}>{stepIdx + 1}.</span> 
                            {step}
                          </p>
                        ))}
                      </div>
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