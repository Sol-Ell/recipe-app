import React, { useState, useEffect } from 'react';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const dummyRecipes = [1, 2, 3, 4, 5, 6];

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate('/create-recipe');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="home-page-container">
      <section className="home-section">
        <h2 className="section-title">TRENDING RECIPES</h2>
        <div className="home-recipes-grid">
          {dummyRecipes.map((i) => {
            // We define a mock object to fill the modal with data
            const recipeData = {
              _id: `recipe-${i}`,
              title: "Big and Juicy Wagyu Beef Cheeseburger",
              imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
              cookingTime: 30,
              category: "Snack",
              servings: 4,
              ingredients: ["Wagyu Beef", "Brioche Bun", "Cheddar Cheese", "Onions", "Secret Sauce"],
              steps: ["Grill the wagyu patty", "Toast the brioche buns", "Assemble with cheese and sauce"],
              author: { username: "ChefElio" }
            };

            return (
              <div 
                key={`trending-${i}`} 
                onClick={() => setSelectedRecipe(recipeData)} 
                style={{ cursor: 'pointer' }}
              >
                <RecipeCard 
                  variant="feed"
                  title={recipeData.title}
                  time="30 Minutes"
                  category={recipeData.category}
                  servings={recipeData.servings}
                  rating={5}
                  image={recipeData.imageUrl}
                />
              </div>
            );
          })}
        </div>
      </section>

      <button 
        className="create-recipe-btn" 
        onClick={handleCreateClick}
        aria-label="Create new recipe"
      >
        + 
      </button>

      {/* AUTH MODAL */}
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

      {/* RECIPE DETAIL MODAL - Moved inside the return */}
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