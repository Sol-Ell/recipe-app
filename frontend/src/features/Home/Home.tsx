import RecipeCard from '../../components/common/Recipe';
import React, { useState, useEffect } from 'react';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal';
import './Home.css';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  currentUser: any; 
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortType, setSortType] = useState<string>('rating'); 

  // --- LES DEUX LIGNES CRUCIALES À AJOUTER ---
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]); // Pour tes futurs vrais data

  // On simule des données d'objets au lieu de simples chiffres [1,2,3]
  // pour que le modal ait quelque chose à afficher
  const dummyRecipes = [
    { id: '1', title: "Big Wagyu Burger", time: "30 min", category: "Snack", servings: 4, rating: 5, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" },
    { id: '2', title: "Healthy Salad", time: "15 min", category: "Lunch", servings: 2, rating: 4, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
    // Ajoute d'autres objets ici...
  ];

  const handleCreateClick = () => {
    if (currentUser) {
      navigate('/create-recipe');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="home-page-container">
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">TRENDING RECIPES</h2>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
            className="sort-select"
          >
            <option value="rating">Sort by Rating</option>
            <option value="time">Sort by Time</option>
          </select>
        </div>

        <div className="home-recipes-grid">
          {dummyRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id}
              id={recipe.id}
              variant="feed"
              title={recipe.title}
              time={recipe.time}
              category={recipe.category}
              servings={recipe.servings}
              rating={recipe.rating}
              image={recipe.imageUrl}
              currentUser={currentUser} 
              // MISE À JOUR ICI : On passe l'objet complet au state
              onOpenRecipeModal={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      </section>

      {/* Floating Button */}
      <button className="create-recipe-btn" onClick={handleCreateClick}> + </button>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Login Required</h3>
            <p>You need to be connected in order to create a recipe.</p>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-secondary" onClick={() => setShowAuthModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DÉTAIL - selectedRecipe est maintenant défini ! */}
      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

export default Home;