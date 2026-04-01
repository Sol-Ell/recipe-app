import Recipe from '../models/Recipe.js';

// @desc    Get recipes created by a specific user
export const getUserRecipes = async (req, res) => {
  try {
    // On cherche les recettes où l'auteur correspond à l'ID dans l'URL
    const recipes = await Recipe.find({ author: req.params.id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des recettes" });
  }
};

// @desc    Get recipes liked by the logged-in user
export const getMyLikedRecipes = async (req, res) => {
  try {
    // On cherche les recettes où l'ID de l'utilisateur est présent dans le tableau 'likes'
    const recipes = await Recipe.find({ likes: req.user });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des favoris" });
  }
};

// @desc    Get recipes completed by the logged-in user
export const getMyDoneRecipes = async (req, res) => {
  try {
    // Supposons qu'il y a un champ 'completedBy' ou similaire dans ton modèle
    const recipes = await Recipe.find({ completedBy: req.user });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des recettes terminées" });
  }
};