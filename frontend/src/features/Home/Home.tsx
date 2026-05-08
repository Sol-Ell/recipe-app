import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal';
import './Home.css';

interface HomeProps {
  currentUser: any;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Loading Data
  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); // Récupère le token stocké

        const response = await axios.get('/api/recipes', {
          headers: {
            Authorization: `Bearer ${token}` // Envoie le token au backend
          }
        });
        setRecipes(response.data);
      } catch (error: any) {
        console.error("Erreur lors du chargement des recettes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, []);

  //  FILTERING FOR SECTIONS
  // On filtre dynamiquement selon l'Enum de ton Recipe.js
  const trendingRecipes = recipes.slice(0, 6); // The 4 most recent
  const meatRecipes = recipes.filter(r => r.category === "Main Course").slice(0, 6);
  const healthyRecipes = recipes.filter(r => r.category === "Vegetarian").slice(0, 6);

  const handleCreateClick = () => {
    if (currentUser) {
      navigate('/create-recipe');
    } else {
      setShowAuthModal(true);
    }
  };

  // Fonction utilitaire pour éviter la répétition du rendu des grilles
  const renderRecipeGrid = (recipeList: any[]) => (
    <div className="home-recipes-grid">
      {recipeList.length > 0 ? (
        recipeList.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            id={recipe._id}
            variant="feed"
            title={recipe.title}
            time={`${recipe.cookingTime} min`}
            category={recipe.category}
            servings={recipe.servings}
            image={recipe.imageUrl}
            currentUser={currentUser}
            onOpenRecipeModal={() => setSelectedRecipe(recipe)}
          />
        ))
      ) : (
        <p className="no-data-msg">No recipes found in this category yet.</p>
      )}
    </div>
  );

  return (
    <div className="home-page-container">
      {/* SECTION TRENDING (Toujours visible) */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">TRENDING RECIPES</h2>
        </div>
        {loading ? <div className="loader">Loading...</div> : renderRecipeGrid(trendingRecipes)}
      </section>

      {currentUser ? (
        <>
          {/* SECTIONS FOR CONNECTED USERS */}
          <section className="home-section">
            <h2 className="section-title">MEAT LOVER</h2>
            {renderRecipeGrid(meatRecipes)}
          </section>

          <section className="home-section">
            <h2 className="section-title">HEALTHY & VEGGIE</h2>
            {renderRecipeGrid(healthyRecipes)}
          </section>
        </>
      ) : (
        /* BANNIÈRE GUEST */
        <div className="guest-login-banner">
          <div className="banner-content">
            <h3>Hungry for more? 🍝</h3>
            <p>Login to follow your favorite chefs and discover recipes tailored just for you.</p>
            <button className="login-cta-btn" onClick={() => navigate('/login')}>
              Sign In to See More
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON CREATION */}
      {currentUser && (
        <button className="create-recipe-btn" onClick={handleCreateClick}> + </button>
      )}

      {/* MODAL DE DÉTAIL */}
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