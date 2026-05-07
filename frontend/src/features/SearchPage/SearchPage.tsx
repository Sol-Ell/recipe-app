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
                
                // 👇 LES LIGNES MAGIQUES SONT LÀ 👇
                authorName={recipe.author?.username}
                authorAvatar={recipe.author?.avatar}
                authorId={typeof recipe.author === 'object' ? recipe.author?._id : recipe.author}
                isFavoriteInitial={recipe.likes?.includes(currentUser?._id)} 
                // 👆 ============================ 👆

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

export default SearchPage;