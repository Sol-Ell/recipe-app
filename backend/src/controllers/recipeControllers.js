import Recipe from '../models/Recipe.js';

// Get recipes created by a specific user
export const getUserRecipes = async (req, res) => {
  try {
    // On cherche les recettes où l'auteur correspond à l'ID dans l'URL
    const recipes = await Recipe.find({ user: req.params.id }).populate('user', 'name profilePicture');
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving recipes" });
  }
};

// Get recipes liked by the logged-in user
export const getMyLikedRecipes = async (req, res) => {
  try {
    // We are looking for recipes where the user ID is present in the 'likes' array
    const recipes = await Recipe.find({ likes: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving favorites" });
  }
};

// Get recipes completed by the logged-in user
export const getMyDoneRecipes = async (req, res) => {
  try {
    // Let's assume there's a 'completedBy' field or something similar in your model.
    const recipes = await Recipe.find({ completedBy: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving completed recipes" });
  }
};