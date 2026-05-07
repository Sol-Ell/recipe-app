import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Create-Recipe.css';
import axios from 'axios';

const FOOD_DATABASE = [
  'Chicken Breast', 'Ground Beef', 'Tomato', 'Garlic', 'Onion', 'Milk', 'Butter', 'Pasta', 'Rice', 'Olive Oil', 
];
const CUISINE_STYLES = ['French', 'Italian', 'Spanish', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'American'];
const DIETARY_TYPES = ['Healthy', 'Veggie', 'Vegan', 'Meat Lover', 'Low Calories', 'Gluten-Free', 'Keto', 'High Protein'];
const MEAL_TYPES = ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Dessert'];

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);

  const [recipe, setRecipe] = useState({
    title: '',
    time: 30,
    category: 'Snack',
    servings: 4,
    cuisineTags: [] as string[],
    dietaryTags: [] as string[],
    ingredients: [{ id: Date.now(), name: '', qty: '', unit: 'pcs' }],
    subsections: [] as { id: number; title: string; content: string }[],
    image: null as string | null,
  });

  const [activeModal, setActiveModal] = useState<'none' | 'tags' | 'category'>('none');
  const [foodSearch, setFoodSearch] = useState({ index: -1, query: '' });

  // 👈 1. LE CHARGEMENT INTELLIGENT DES DONNÉES
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;

        // On reformate les ingrédients
        const formattedIngredients = data.ingredients.map((ing: any, index: number) => ({
          id: Date.now() + index,
          name: ing.name,
          qty: ing.quantity.toString(),
          unit: ing.unit
        }));

        // 🔪 LA MAGIE EST ICI : On découpe les étapes par "SECTION:"
        const formattedSubsections: any[] = [];
        if (data.steps && data.steps.length > 0) {
          let currentTitle = 'Préparation';
          let currentContent: string[] = [];

          data.steps.forEach((step: string, index: number) => {
            if (step.startsWith('SECTION:')) {
              // On sauvegarde la section précédente
              if (currentContent.length > 0 || currentTitle !== 'Préparation') {
                formattedSubsections.push({
                  id: Date.now() + index,
                  title: currentTitle,
                  content: currentContent.join('\n')
                });
              }
              // On prépare la nouvelle
              currentTitle = step.replace('SECTION:', '').trim();
              currentContent = [];
            } else {
              currentContent.push(step);
            }
          });
          
          // On ajoute la toute dernière section
          if (currentContent.length > 0 || currentTitle !== 'Préparation') {
            formattedSubsections.push({
              id: Date.now() + 10000, // ID unique
              title: currentTitle,
              content: currentContent.join('\n')
            });
          }
        }

        setRecipe({
          title: data.title || '',
          time: data.cookingTime || 30,
          category: data.category || 'Snack',
          servings: data.servings || 4,
          cuisineTags: data.cuisineTags || [],
          dietaryTags: data.dietaryTags || [],
          ingredients: formattedIngredients.length > 0 ? formattedIngredients : [{ id: Date.now(), name: '', qty: '', unit: 'pcs' }],
          subsections: formattedSubsections.length > 0 ? formattedSubsections : [{ id: Date.now(), title: 'Préparation', content: '' }],
          image: data.imageUrl || null,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de la recette:", error);
        alert("Impossible de charger la recette.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id]);

  // 👈 2. LA SAUVEGARDE INTELLIGENTE
  const handleSubmit = async () => {
    try {
      const formattedIngredients = recipe.ingredients.map(ing => ({
        name: ing.name,
        quantity: Number(ing.qty),
        unit: ing.unit.toLowerCase()
      }));

      // On reconstruit le tableau avec les "SECTION:" pour le Back-end
      const formattedSteps = recipe.subsections.flatMap(sub => {
        const steps = sub.content.split('\n').filter(s => s.trim() !== '');
        if (steps.length === 0) return []; // Ignore les sections vides
        
        const titleMarker = sub.title ? `SECTION: ${sub.title}` : `SECTION: Préparation`;
        return [titleMarker, ...steps];
      });

      const categoryMapping: { [key: string]: string } = {
        'Lunch': 'Main Course', 'Dinner': 'Main Course', 'Snack': 'Appetizer', 'Dessert': 'Dessert', 'Breakfast': 'Appetizer'
      };

      const recipeData = {
        title: recipe.title,
        servings: Number(recipe.servings),
        ingredients: formattedIngredients,
        category: categoryMapping[recipe.category] || recipe.category,
        steps: formattedSteps.length > 0 ? formattedSteps : ["SECTION: Préparation", "Préparation par défaut"],
        imageUrl: recipe.image,
        cookingTime: Number(recipe.time),
        cuisineTags: recipe.cuisineTags,
        dietaryTags: recipe.dietaryTags
      };

      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/recipes/${id}`, recipeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        alert("Recette modifiée avec succès ! 👨‍🍳");
        navigate(`/home`); 
      }
    } catch (error: any) {
      console.error("Erreur Backend:", error.response?.data);
      alert(`Erreur : ${error.response?.data?.message || "Erreur lors de la modification"}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) setRecipe((prev) => ({ ...prev, image: result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (list: 'cuisine' | 'dietary', tag: string) => {
    const key = list === 'cuisine' ? 'cuisineTags' : 'dietaryTags';
    const currentList = recipe[key];
    if (currentList.includes(tag)) {
      setRecipe({ ...recipe, [key]: currentList.filter(t => t !== tag) });
    } else if (currentList.length < 3) {
      setRecipe({ ...recipe, [key]: [...currentList, tag] });
    }
  };

  const addIngredient = () => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { id: Date.now(), name: '', qty: '', unit: 'pcs' }] });
  const addSubsection = () => {
    if (recipe.subsections.length < 3) {
      setRecipe({ ...recipe, subsections: [...recipe.subsections, { id: Date.now(), title: '', content: '' }] });
    }
  };

  if (loading) return <div className="creation-page"><h2 style={{textAlign: 'center', marginTop: '50px'}}>Chargement de la recette...</h2></div>;

  return (
    <div className="creation-page">
      <h1 className="main-title">EDIT RECIPE</h1>
      <hr className="divider" />
      <div className="main-grid">
        <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
          {recipe.image ? (
            <img src={recipe.image} alt="Preview" className="uploaded-img" />
          ) : (
            <>
              <span className="plus-large">+</span>
              <p>Add A Picture</p>
            </>
          )}
          <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} />
        </div>

        <div className="center-fields">
          <div className="input-group">
            <label>Title:</label>
            <input 
              type="text" 
              className="title-input" 
              value={recipe.title} 
              onChange={(e) => setRecipe({...recipe, title: e.target.value})}
              placeholder="Enter recipe name..." 
            />
          </div>
          
          <div className="meta-list">
            <div className="meta-row">
              <span className="icon">⏱️</span> 
              <input 
                type="number" 
                className="inline-input" 
                value={recipe.time} 
                onChange={(e) => setRecipe({...recipe, time: parseInt(e.target.value) || 0})}
              /> 
            </div>
            <div className="meta-row clickable" onClick={() => setActiveModal('category')}>
              <span className="icon">🍴</span> {recipe.category}
            </div>
            <div className="meta-row">
              <span className="icon">👤</span> 
              <input 
                type="number" 
                className="inline-input" 
                value={recipe.servings} 
                onChange={(e) => setRecipe({...recipe, servings: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="tags-container">
          <label>Tags:</label>
          <div className="tags-grid">
            {[...recipe.cuisineTags, ...recipe.dietaryTags].map(tag => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
            <button className="add-tag-btn" onClick={() => setActiveModal('tags')}>+</button>
          </div>
        </div>
      </div>

      <div className="ingredients-section">
        <h2>Ingredients:</h2>
        <div className="ingredients-labels">
          <span>Name</span><span>Quantity</span><span>Unit</span>
        </div>
        {recipe.ingredients.map((ing, idx) => (
          <div key={ing.id} className="ingredient-row">
            <div className="search-container">
              <input 
                type="text" 
                value={foodSearch.index === idx ? foodSearch.query : ing.name} 
                onChange={(e) => setFoodSearch({ index: idx, query: e.target.value })}
                className="ing-name" 
              />
              {foodSearch.index === idx && foodSearch.query.length > 0 && (
                <div className="suggestions">
                  {FOOD_DATABASE.filter(f => f.toLowerCase().includes(foodSearch.query.toLowerCase())).map(match => (
                    <div key={match} className="suggestion-item" onClick={() => {
                      const newIngs = [...recipe.ingredients];
                      newIngs[idx].name = match;
                      setRecipe({...recipe, ingredients: newIngs});
                      setFoodSearch({ index: -1, query: '' });
                    }}>{match}</div>
                  ))}
                </div>
              )}
            </div>
            <input type="text" className="ing-qty" value={ing.qty} onChange={(e) => {
               const newIngs = [...recipe.ingredients];
               newIngs[idx].qty = e.target.value;
               setRecipe({...recipe, ingredients: newIngs});
            }} />
            
            <select className="ing-unit" value={ing.unit} onChange={(e) => {
                const newIngs = [...recipe.ingredients];
                newIngs[idx].unit = e.target.value;
                setRecipe({...recipe, ingredients: newIngs});
            }}>
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="cup">cup</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
            </select>
          </div>
        ))}
        <button className="add-row-btn" onClick={addIngredient}>+</button>
      </div>

      <div className="subsections-section">
        {recipe.subsections.map((sub, idx) => (
          <div key={sub.id} className="subsection-item">
            <input 
              type="text" 
              placeholder="Subsection Title (e.g., Preparation)" 
              className="sub-title-input"
              value={sub.title}
              onChange={(e) => {
                const newSubs = [...recipe.subsections];
                newSubs[idx].title = e.target.value;
                setRecipe({...recipe, subsections: newSubs});
              }}
            />
            <textarea 
              placeholder="Describe the steps..." 
              value={sub.content}
              onChange={(e) => {
                const newSubs = [...recipe.subsections];
                newSubs[idx].content = e.target.value;
                setRecipe({...recipe, subsections: newSubs});
              }}
            />
          </div>
        ))}
        <div className="sub-actions">
           <button className="add-sub-btn" onClick={addSubsection} disabled={recipe.subsections.length >= 3}>
             + Add Subsection
           </button>
           <p className="limit-hint">(Maximum 3 additional subsections)</p>
        </div>
      </div>

      <button className="save-btn" onClick={handleSubmit}>
        Update Recipe
      </button>

      {activeModal === 'tags' && (
        <div className="modal-overlay">
          <div className="tag-modal">
            <div className="modal-header">
              <span className="close-x" onClick={() => setActiveModal('none')}>ⓧ</span>
              <h2>Tags</h2>
              <span className="save-icon" onClick={() => setActiveModal('none')}>💾</span>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-head"><h3>Cuisine Style:</h3> <span>{recipe.cuisineTags.length}/3</span></div>
                <div className="tag-options">
                  {CUISINE_STYLES.map(tag => (
                    <button key={tag} className={`tag-opt ${recipe.cuisineTags.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag('cuisine', tag)}>
                      {tag} {recipe.cuisineTags.includes(tag) ? '×' : '+'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <div className="section-head"><h3>Dietary/Type:</h3> <span>{recipe.dietaryTags.length}/3</span></div>
                <div className="tag-options">
                  {DIETARY_TYPES.map(tag => (
                    <button key={tag} className={`tag-opt ${recipe.dietaryTags.includes(tag) ? 'selected' : ''}`} onClick={() => toggleTag('dietary', tag)}>
                      {tag} {recipe.dietaryTags.includes(tag) ? '×' : '+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'category' && (
        <div className="modal-overlay">
          <div className="mini-modal">
             <h2>Select Meal Type</h2>
             <div className="meal-grid">
                {MEAL_TYPES.map(m => (
                  <button key={m} className="meal-btn" onClick={() => { setRecipe({...recipe, category: m}); setActiveModal('none'); }}>{m}</button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRecipe;