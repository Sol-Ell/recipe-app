import Recipe from '../models/Recipe.js';

import { validationResult } from "express-validator";

export const createRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Récupère TOUS les champs nécessaires
const { title, servings, ingredients, category, steps, imageUrl, cookingTime, cuisineTags, dietaryTags } = req.body;
    const newRecipe = new Recipe({
      title,
      servings,
      ingredients,
      category,
      steps,
      imageUrl,
      cookingTime,
      cuisineTags,
      dietaryTags,
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
    const recipes = await Recipe.find({ author: req.params.id })
                                .populate('author', 'username avatar');
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
      const allowedCategories = ["Appetizer", "Main Course", "Dessert", "Vegetarian"];
      if(!allowedCategories.includes(category)){
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = category;
    }
    //search manager
   if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { ingredients: { $elemMatch: { $regex: q, $options: "i" } } }
      ];
    }
    
    // 👈 MAGIE ICI : On ajoute l'avatar (il n'y avait que le username avant)
    const recipes = await Recipe.find(filter).populate("author", "username avatar");
    res.status(200).json(recipes);
    } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recipes liked by the logged-in user
export const getMyLikedRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ likes: req.user._id })
                                .populate('author', 'username avatar');
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

export const toggleLikeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const userId = req.user._id.toString();
    const isLiked = recipe.likes.includes(userId);

    if (isLiked) {
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId);
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();
    res.status(200).json({ message: "Like updated", likes: recipe.likes });
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};
export const searchRecipes = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

      //Empty request
    if (!q || q.trim() === "") {
      return res.status(200).json({
        recipes: [],
        total: 0,
        message: "Empty query"
      });
    }

    const regex = new RegExp(q, "i");

    const filter = {
      $or: [
        { title: regex },
        { ingredients: { $elemMatch: { $regex: regex } } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recipes = await Recipe.find(filter)
      .populate("author", "username avatar")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Recipe.countDocuments(filter);

    res.status(200).json({
      recipes,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username avatar');
    if (!recipe) {
      return res.status(404).json({ message: "Recette introuvable." });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la recette.", error: error.message });
  }
};
export const getAllRecipes = async(req, res)=>{
  try{
    const recipes = await Recipe.find().populate("author", "username").sort({createdAt: -1});
    res.status("200").json(recipes);
  } catch(error){
    res.status("500").json({message: "Error retrieving stream"});
  }};

export const updateRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recette introuvable." });
    }

    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé. Tu ne peux modifier que tes propres recettes !" });
    }

    const { title, servings, ingredients, category, steps, imageUrl, cookingTime, cuisineTags, dietaryTags } = req.body;

    recipe.title = title || recipe.title;
    recipe.servings = servings || recipe.servings;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.category = category || recipe.category;
    recipe.steps = steps || recipe.steps;
    recipe.imageUrl = imageUrl || recipe.imageUrl;
    recipe.cookingTime = cookingTime || recipe.cookingTime;
    recipe.cuisineTags = cuisineTags || recipe.cuisineTags;
    recipe.dietaryTags = dietaryTags || recipe.dietaryTags;

    const updatedRecipe = await recipe.save();
    res.status(200).json(updatedRecipe);

  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour.", error: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recette introuvable." });
    }

    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé. Tu ne peux supprimer que tes propres recettes !" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Recette supprimée avec succès ! 🗑️" });

  } catch (error) {
    console.error("Erreur de suppression:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression.", error: error.message });
  }
};
