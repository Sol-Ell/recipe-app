import mongoose from "mongoose";

const recipeSchema = mongoose.Schema({
  // Critère : title (String, required, trimmed, minlength)
  title: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true,
    minlength: [3, "Le titre doit avoir au moins 3 caractères"]
  },
  // Critère : ingredients (Array non vide)
  ingredients: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, "Il faut au moins un ingrédient"]
  },
  // Critère : steps (Array non vide)
  steps: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, "Il faut au moins une étape"]
  },
  imageUrl: { type: String, required: true },
  // Critère : cookingTime (Number in minutes)
  cookingTime: { 
    type: Number, 
    required: [true, "Le temps de cuisson est requis"],
    min: [1, "Le temps doit être supérieur à 0"]
  },
  // Critère : author (ObjectId reference to User)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Référence au modèle User
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true }); // Critère : gère automatiquement createdAt et updatedAt

// Critère : Index sur le titre pour l'optimisation de la recherche
recipeSchema.index({ title: 'text' });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;