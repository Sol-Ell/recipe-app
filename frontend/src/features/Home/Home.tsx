import React, { useState } from 'react';
import RecipeCard from '../../components/common/Recipe';
import RecipeDetailModal from '../../components/common/RecipeDetailModal/RecipeDetailModal';
import './Home.css';
import { useNavigate } from 'react-router-dom';

// 1. Define the props interface
interface HomeProps {
  currentUser: any; 
}

// 2. IMPORTANT: Pass the interface to React.FC and destructure currentUser
const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // PROFESSIONAL APPROACH: Mocking the Auth state
  // This will be replaced by "const { isAuthenticated } = useAuth();" later
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sortType, setSortType] = useState<string>('rating'); 
  
  useEffect(() => {
    // Check for a token in local storage (standard way to handle JWT)
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const dummyRecipes = [1, 2, 3, 4, 5, 6];

  /**
   * Logic to handle recipe creation access
   */
  const handleCreateClick = () => {
    if (currentUser) {
      navigate('/create-recipe');
    } else {
      setShowAuthModal(true);
    }
  };

  const sortedRecipes = [...dummyRecipes].sort((a, b) => {
  if (sortType === 'rating') {
    return b - a; // rating sort
  }
  if (sortType === 'time') {
    return a - b; // time sort
  }
  return 0;
});

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
          {dummyRecipes.map((i) => (
            <RecipeCard 
              key={`trending-${i}`}
              id={`recipe-${i}`}
              variant="feed"
              title="Big and Juicy Wagyu Beef Cheeseburger"
              time="30 Minutes"
              category="Snack"
              servings={4}
              rating={5}
              // 3. Pass the currentUser received from App.tsx down to the card
              currentUser={currentUser} 
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
              onOpenRecipeModal={(id) => console.log("Recipe Modal ID:", id)}
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