import React from 'react';
import { useParams } from 'react-router-dom';
import RecipeCard from '../../components/common/Recipe';
import './SearchPage.css'; // On va réutiliser le style de la Home

const SearchPage: React.FC = () => {
  const { query } = useParams<{ query: string }>(); // Récupère le mot de l'URL

  // Pour le moment (Frontend-only), on simule des résultats
  const results = [1, 2, 3]; 

  return (
    <div className="home-page-container"> {/* On garde la même classe pour le style */}
      <section className="home-section">
        <h2 className="section-title">
          RESULTS FOR: <span className="query-highlight">"{query?.toUpperCase()}"</span>
        </h2>
        
        {results.length > 0 ? (
          <div className="home-recipes-grid">
            {results.map((i) => (
              <RecipeCard 
              key={`trending-${i}`}
              variant="feed"
              title="Big and Juicy Wagyu Beef Cheeseburger"
              time="30 Minutes"
              category="Snack"
              servings={4}
              rating={5}
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
            />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No recipes found for "{query}". Try something else! 🍳</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;