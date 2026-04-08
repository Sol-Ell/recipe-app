import { Router } from "express";
import { getUserProfile, getUserById } from "../controllers/UserProfile.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get('/profile', protect, getUserProfile);      
router.get('/profile/:id', getUserById);
export default router;
