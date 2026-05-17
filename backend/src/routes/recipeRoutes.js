import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';

import { 
  getUserRecipes, 
  getMyLikedRecipes, 
  getMyDoneRecipes,
  toggleLikeRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipesCategory,
  createRecipe,
  searchRecipes
} from '../controllers/recipeControllers.js';

import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

const router = express.Router();

const recipeValidationRules = [ // validation rule
  body('title').trim().isLength({ min: 3 }).withMessage('The title must have at least three characters.'),
  body('ingredients').isArray({ min: 1 }).withMessage(' To Have at least one ingredient.'),
  body('steps').isArray({ min: 1 }).withMessage('To have at least one step.'),
  body('cookingTime').isNumeric().withMessage('The time must be numeric.'),
  body('category').isIn(["Appetizer", "Main Course", "Dessert", "Vegetarian"]).withMessage('Invalid category.'),
];



router.get("/search", searchRecipes);

router.get("/", getRecipesCategory); 


router.get('/user/:id', protect, getUserRecipes);
router.get('/my-likes', protect, getMyLikedRecipes);
router.get('/my-done', protect, getMyDoneRecipes);

// Retrieve only the IDs of saved recipes
router.get("/savedRecipes/ids", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ savedRecipes: user?.savedRecipes || [] });
  } catch (err) {
    res.json(err);
  }
});

// Retrieve all saved recipe items
router.get("/savedRecipes", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const savedRecipes = await Recipe.find({
      _id: { $in: user.savedRecipes },
    });
    res.json({ savedRecipes });
  } catch (err) {
    res.json(err);
  }
});

router.put('/:id/like', protect, toggleLikeRecipe);

// route that allow us to save our recipes
router.put("/", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.body.recipeId);
    const user = await User.findById(req.user._id);
    if (!user.savedRecipes.includes(req.body.recipeId)) {
      user.savedRecipes.push(recipe._id);
      await user.save();
    }
    res.json({ savedRecipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", protect, recipeValidationRules, createRecipe);



router.get("/:id", protect, getRecipeById);
router.put("/:id", protect, recipeValidationRules, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

export default router;