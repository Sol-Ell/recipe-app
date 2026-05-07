import React, { useState, useRef } from 'react';
import './Create-Recipe.css';
import axios from 'axios';

// Mock Data for consistent search
const FOOD_DATABASE = [
  // Protéines & Viandes
  'Chicken Breast', 'Ground Beef', 'Pork Chops', 'Bacon', 'Salmon', 'Tuna', 'Cod', 'Shrimp', 'Tofu', 'Tempeh', 'Lamb Leg', 'Turkey', 'Duck Breast', 'Sardines', 'Mussels', 'Eggs', 'Prosciutto', 'Sausage',
  // Légumes
  'Tomato', 'Garlic', 'Onion', 'Spinach', 'Broccoli', 'Carrot', 'Zucchini', 'Eggplant', 'Bell Pepper', 'Cucumber', 'Potato', 'Sweet Potato', 'Pumpkin', 'Kale', 'Asparagus', 'Mushrooms', 'Leek', 'Celery', 'Cauliflower', 'Green Beans', 'Peas', 'Radish', 'Beetroot', 'Artichoke', 'Brussels Sprouts', 'Corn',
  // Fruits
  'Apple', 'Banana', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Blueberry', 'Raspberry', 'Mango', 'Pineapple', 'Avocado', 'Pear', 'Grape', 'Watermelon', 'Peach', 'Cherry', 'Kiwi', 'Fig', 'Pomegranate',
  // Produits Laitiers & Fromages
  'Milk', 'Greek Yogurt', 'Heavy Cream', 'Butter', 'Parmesan', 'Mozzarella', 'Cheddar', 'Feta', 'Ricotta', 'Goat Cheese', 'Blue Cheese', 'Mascarpone', 'Sour Cream',
  // Épicerie & Féculents
  'Pasta', 'Rice', 'Quinoa', 'Flour', 'Sugar', 'Brown Sugar', 'Honey', 'Maple Syrup', 'Lentils', 'Chickpeas', 'Black Beans', 'Couscous', 'Bulgur', 'Breadcrumbs', 'Oats', 'Cornstarch', 'Yeast',
  // Huiles & Condiments
  'Olive Oil', 'Coconut Oil', 'Sesame Oil', 'Soy Sauce', 'Dijon Mustard', 'Mayonnaise', 'Ketchup', 'Sriracha', 'Apple Cider Vinegar', 'Balsamic Vinegar', 'Tomato Paste', 'Tahini', 'Pesto', 'Peanut Butter',
  // Herbes & Épices
  'Basil', 'Parsley', 'Cilantro', 'Thyme', 'Rosemary', 'Oregano', 'Cinnamon', 'Paprika', 'Cumin', 'Turmeric', 'Chili Flakes', 'Ginger', 'Nutmeg', 'Vanilla Extract', 'Star Anise', 'Cardamom'
];
const CUISINE_STYLES = [
  'French', 'Italian', 'Spanish', 'Japanese', 'Mexican', 
  'Indian', 'Chinese', 'Thai', 'Greek', 'Moroccan', 
  'Vietnamese', 'Korean', 'American', 'Middle Eastern', 'Mediterranean'
];
const DIETARY_TYPES = [
  'Healthy', 'Veggie', 'Vegan', 'Meat Lover', 'Low Calories', 
  'Gluten-Free', 'Keto', 'High Protein', 'Dairy-Free', 'Quick & Easy'
];
const MEAL_TYPES = ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Dessert'];

const RecipeEditor: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = async () => {
  try {
    // 1. Transformation des ingrédients (Backend : Array d'objets)
    const formattedIngredients = recipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: Number(ing.qty),
      unit: ing.unit.toLowerCase() // Conversion en minuscule pour correspondre à l'enum ["l", "g", "pcs"...]
    }));

    // 2. Transformation des étapes (Backend : [String])
    // On fusionne les titres de subsections et le contenu en un seul tableau de chaînes
    const formattedSteps = recipe.subsections.flatMap(sub => {
      const steps = sub.content.split('\n').filter(s => s.trim() !== '');
      return [`SECTION: ${sub.title}`, ...steps];
    });

    // 3. Mapping de la catégorie (Adaptation aux Enums du Backend)
    // On s'assure d'envoyer une valeur acceptée ou une valeur par défaut
    const categoryMapping: { [key: string]: string } = {
      'Lunch': 'Main Course',
      'Dinner': 'Main Course',
      'Snack': 'Appetizer',
      'Dessert': 'Dessert',
      'Breakfast': 'Appetizer'
    };

    const recipeData = {
      title: recipe.title,
      servings: Number(recipe.servings),
      ingredients: formattedIngredients,
      category: categoryMapping[recipe.category] || "Main Course", // Sécurité Enum
      steps: formattedSteps.length > 0 ? formattedSteps : ["Préparation par défaut"],
      imageUrl: recipe.image, // Chaîne Base64
      cookingTime: Number(recipe.time),
      // 👈 LA CORRECTION EST LÀ : On ajoute les tags au colis !
      cuisineTags: recipe.cuisineTags,
      dietaryTags: recipe.dietaryTags
    };

    const token = localStorage.getItem('token');
    
    const response = await axios.post('/api/recipes', recipeData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 201) {
      alert("Recette enregistrée avec succès ! 👨‍🍳");
    }
  } catch (error: any) {
    console.error("Erreur Backend:", error.response?.data);
    const message = error.response?.data?.message || "Erreur lors de l'envoi";
    alert(`Erreur : ${message}`);
  }
};
  const [recipe, setRecipe] = useState({
    title: '',
    time: 30,
    category: 'Snack',
    servings: 4,
    cuisineTags: [] as string[],
    dietaryTags: [] as string[],
    ingredients: [{ id: 1, name: 'Milk', qty: '2', unit: 'L' }],
    subsections: [] as { id: number; title: string; content: string }[],
    image: null as string | null,
  });

  // UI States
  const [activeModal, setActiveModal] = useState<'none' | 'tags' | 'category'>('none');
  const [foodSearch, setFoodSearch] = useState({ index: -1, query: '' });

  // --- Handlers ---

  // Handle Image Upload
 // 1. Unified and Clean Image Upload Handler
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]; // Get the first file safely
  
  if (file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        console.log("Image successfully loaded!"); // Debugging line
        setRecipe((prevRecipe) => ({
          ...prevRecipe,
          image: result as string, // Store the Base64 string for preview
        }));
      }
    };

    reader.onerror = () => {
      console.error("Error reading the file.");
    };

    reader.readAsDataURL(file); // Trigger the reading process
  }
};

  // Toggle Tags with strict 3/3 limit
  const toggleTag = (list: 'cuisine' | 'dietary', tag: string) => {
    const key = list === 'cuisine' ? 'cuisineTags' : 'dietaryTags';
    const currentList = recipe[key];
    
    if (currentList.includes(tag)) {
      setRecipe({ ...recipe, [key]: currentList.filter(t => t !== tag) });
    } else if (currentList.length < 3) {
      setRecipe({ ...recipe, [key]: [...currentList, tag] });
    }
  };

  // Ingredient Logic
  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { id: Date.now(), name: '', qty: '', unit: 'L' }]
    });
  };

  // Subsection Logic (Max 3)
  const addSubsection = () => {
    if (recipe.subsections.length < 3) {
      setRecipe({
        ...recipe,
        subsections: [...recipe.subsections, { id: Date.now(), title: '', content: '' }]
      });
    }
  };

  return (
    <div className="creation-page">
      <h1 className="main-title">RECIPE CREATION</h1>
      <hr className="divider" />

      <div className="main-grid">
        {/* LEFT: Image Upload */}
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

        {/* CENTER: Title & Meta Info */}
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

        {/* RIGHT: Tags View */}
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

      {/* INGREDIENTS SECTION */}
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
            <select className="ing-unit"><option>L</option><option>g</option><option>pcs</option></select>
          </div>
        ))}
        <button className="add-row-btn" onClick={addIngredient}>+</button>
      </div>

      {/* SUBSECTIONS */}
      <div className="subsections-section">
        {recipe.subsections.map((sub, idx) => (
          <div key={sub.id} className="subsection-item">
            <input 
              type="text" 
              placeholder="Subsection Title (e.g., Preparation)" 
              className="sub-title-input"
              onChange={(e) => {
                const newSubs = [...recipe.subsections];
                newSubs[idx].title = e.target.value;
                setRecipe({...recipe, subsections: newSubs});
              }}
            />
            <textarea 
              placeholder="Describe the steps..." 
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
  Save Recipe
</button>

      {/* TAG MODAL */}
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

      {/* CATEGORY MODAL */}
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

export default RecipeEditor;
