import express from 'express';
import { 
  getUserRecipes, 
  getMyLikedRecipes, 
  getMyDoneRecipes 
} from '../controllers/recipeControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 1. Récupérer les recettes d'un utilisateur spécifique (vue publique/profil)
// URL: /api/recipes/user/:id
router.get('/user/:id', protect, getUserRecipes);

// 2. Récupérer mes likes (Privé)
// URL: /api/recipes/my-likes
router.get('/my-likes', protect, getMyLikedRecipes);

// 3. Récupérer mes recettes terminées (Privé)
// URL: /api/recipes/my-done
router.get('/my-done', protect, getMyDoneRecipes);

export default router;