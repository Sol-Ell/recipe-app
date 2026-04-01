import mongoose from "mongoose";
const recipeSchema = mongoose.Schema({
  // ... tes champs (title, author, etc.)
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

// C'EST CETTE LIGNE QUI MANQUE :
export default Recipe;