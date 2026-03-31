import React from 'react';
import RecipeCard from '../../components/common/Recipe';
import './Home.css';

const Home: React.FC = () => {
  // On crée une liste vide ou fictive pour tester le rendu visuel
  const dummyRecipes = [1, 2, 3, 4, 5, 6];

  return (
    <div className="home-page-container">
      
      {/* SECTION 1: TRENDING */}
      <section className="home-section">
        <h2 className="section-title">TRENDING RECIPES</h2>
        <div className="home-recipes-grid">
          {dummyRecipes.map((i) => (
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
      </section>

      {/* SECTION 2: FOLLOWS */}
      <section className="home-section">
        <h2 className="section-title">ACCOUNT YOU FOLLOW</h2>
        <div className="home-recipes-grid">
          {dummyRecipes.slice(0, 3).map((i) => (
            <RecipeCard 
              key={`follow-${i}`}
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
      </section>
      
      <section className="home-section">
        <h2 className="section-title">RECOMMENDATION</h2>
        <div className="home-recipes-grid">
          {dummyRecipes.slice(0, 3).map((i) => (
            <RecipeCard 
              key={`follow-${i}`}
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
      </section>
    </div>
  );
};

export default Home;