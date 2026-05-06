
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal';
import './SearchPage.css';

const SearchPage: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Appel à ton API avec le paramètre 'q'
        const response = await axios.get(`/api/recipes/search?q=${query}`);
        // On récupère le tableau 'recipes' renvoyé par le backend
        setResults(response.data.recipes); 
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]); // Se relance si l'utilisateur change sa recherche

  return (
    <div className="home-page-container">
      <section className="home-section">
        <h2 className="section-title">
          {loading ? "SEARCHING..." : `RESULTS FOR: "${query?.toUpperCase()}"`}
        </h2>
        
        {loading ? (
          <div className="loader">Loading recipes...</div>
        ) : results.length > 0 ? (
          <div className="home-recipes-grid">
            {results.map((recipe) => (
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
            ))}
          </div>
        ) : (
          <div className="no-results-container">
            <p className="no-results-text">No recipes found for "{query}". 🍳</p>
          </div>
        )}
      </section>

      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

/*import React, { useState } from 'react'; // Ajout de useState
import { useParams } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal'; // Import manquant
import './SearchPage.css';

interface SearchPageProps {
  currentUser: any;
}

const SearchPage: React.FC<SearchPageProps> = ({ currentUser }) => {
  const { query } = useParams<{ query: string }>();
  
  // --- ÉTAT POUR LE MODAL ---
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  // Simulation de résultats (On imagine que ce sont des objets complets)
  const results = [
    { id: '1', title: "Big Wagyu Burger", time: "30 min", category: "Snack", servings: 4, rating: 5, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" },
  ]; 

  return (
    <div className="home-page-container">
      <section className="home-section">
        <h2 className="section-title">
          RESULTS FOR: <span className="query-highlight">"{query?.toUpperCase()}"</span>
        </h2>
        
        {results.length > 0 ? (
          <div className="home-recipes-grid">
            {results.map((recipe) => (
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
                // AU CLIC : On ouvre le modal avec les infos de cette recette
                onOpenRecipeModal={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        ) : (
          <div className="no-results-container">
            <p className="no-results-text">No recipes found for "{query}". Try "Pasta" or "Burger"! 🍳</p>
          </div>
        )}
      </section>

      {/* --- AFFICHAGE DU MODAL --- *//*}/*
      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};*/

export default SearchPage;