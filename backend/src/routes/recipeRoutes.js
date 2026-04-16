import express from 'express';
import { 
  getUserRecipes, 
  getMyLikedRecipes, 
  getMyDoneRecipes 
} from '../controllers/recipeControllers.js';
import { protect } from '../middleware/auth.js';
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import { getRecipesCategory } from '../controllers/recipeControllers.js';

const router = express.Router();

// Retrieve recipes from a specific user (public view/profile)
// URL: /api/recipes/user/:id
router.get('/user/:id', protect, getUserRecipes);

// Retrieve my likes (Private)
// URL: /api/recipes/my-likes
router.get('/my-likes', protect, getMyLikedRecipes);

// Retrieve my completed recipes (Private)
// URL: /api/recipes/my-done
router.get('/my-done', protect, getMyDoneRecipes);

//Retrieve the recipes's category
router.get("/", protect, getRecipesCategory);

//return all recipes it can find in the database
router.get("/", protect, async (req, res) => {
  try{
    const response = await Recipe.find({});// return all the documents in that collection
    res.json(response);
  } catch (err) {
    res.json(err);
  }
});

//routes for the recipe creation
router.post("/", protect, async (req, res) => {
  const recipe = new Recipe({ ...req.body, author: req.user._id });
  try{
    const response = await recipe.save();// return all the documents in that collection
    res.json(response);
  } catch (err) {
    res.json(err);
  }
});

//route that allow us to save our recipes
router.put("/", protect, async (req, res) => {
  try{
    const recipe = await Recipe.findById(req.body.recipeId);
    const user = await User.findById(req.user._id);//Security via the token
    //Avoid duplicata in favourite
    if (!user.savedRecipes.includes(req.body.recipeId)) {
      user.savedRecipes.push(recipe);
      await user.save();
    }
    res.json({ savedRecipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Retrieve only the IDs of saved recipes
router.get("/savedRecipes/ids", protect, async (req, res) => {
  try{
    const user = await User.findById(req.user._id);
    res.json({ savedRecipes: user?.savedRecipes || [] });
  } catch (err) {
    res.json(err);
  }
});
//Retrieve all saved recipe items
router.get("/savedRecipes", protect, async (req, res) => {
  try{
    const user = await User.findById(req.user._id);
    const savedRecipes = await Recipe.find({
      _id: { $in: user.savedRecipes },
    });
    res.json({savedRecipes});
  } catch (err) {
    res.json(err);
  }
});
export default router;