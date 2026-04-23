import Recipe from '../models/Recipe.js';

import { validationResult } from "express-validator";

export const createRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Récupère TOUS les champs nécessaires
    const { title, servings, ingredients, category, steps, imageUrl, cookingTime } = req.body;

    const newRecipe = new Recipe({
      title,
      servings,
      ingredients,
      category,
      steps,
      imageUrl,
      cookingTime,
      author: req.user._id, 
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);

  } catch (error) {
    console.error("Recipe creation error:", error);
    res.status(500).json({ message: "Server error during creation" });
  }
};

// Get recipes created by a specific user
export const getUserRecipes = async (req, res) => {
  try {
    // On cherche les recettes où l'auteur correspond à l'ID dans l'URL
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