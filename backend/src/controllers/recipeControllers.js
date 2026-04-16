import Recipe from '../models/Recipe.js';

// Get recipes created by a specific user
export const getUserRecipes = async (req, res) => {
  try {
    // On cherche les recettes où l'auteur correspond à l'ID dans l'URL
<<<<<<< REA-81-create-category-filters-appetizer-main-course-d
    const recipes = await Recipe.find({ author: req.params.id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des recettes" });
  }
};

export const getRecipesCategory = async (req, res) =>{ //Get Category and filter 
  try{
    const {category, q} = req.query;

    let filter = {};

    if(category){
      //category manage
      const allowedCategories = [
      "Appetizer", "Main Course", "Dessert", "Vegetarian",
     ];
      if(!allowedCategories.includes(category)){
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = category;
    }
    //search manager
    if (q){
      filter.title = { $regex: q, $options: "i" }
    }
    const recipes = await Recipe.find(filter).populate("author", "username");
    res.status(200).json(recipes);
    } catch (error) {
    res.status(500).json({ message: error.message });
=======
    const recipes = await Recipe.find({ user: req.params.id }).populate('user', 'name profilePicture');
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving recipes" });
>>>>>>> main
  }
};

// Get recipes liked by the logged-in user
export const getMyLikedRecipes = async (req, res) => {
  try {
<<<<<<< REA-81-create-category-filters-appetizer-main-course-d
    // On cherche les recettes où l'ID de l'utilisateur est présent dans le tableau 'likes'
    const recipes = await Recipe.find({ likes: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des favoris" });
=======
    // We are looking for recipes where the user ID is present in the 'likes' array
    const recipes = await Recipe.find({ likes: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving favorites" });
>>>>>>> main
  }
};

// Get recipes completed by the logged-in user
export const getMyDoneRecipes = async (req, res) => {
  try {
<<<<<<< REA-81-create-category-filters-appetizer-main-course-d
    // Supposons qu'il y a un champ 'completedBy' ou similaire dans ton modèle
    const recipes = await Recipe.find({ completedBy: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des recettes terminées" });
=======
    // Let's assume there's a 'completedBy' field or something similar in your model.
    const recipes = await Recipe.find({ completedBy: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving completed recipes" });
>>>>>>> main
  }
};