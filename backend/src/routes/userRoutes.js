import { Router } from "express";
import { getUserProfile, getUserById, updateProfile } from "../controllers/UserProfile.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get('/profile', protect, getUserProfile);      
router.get('/profile/:id', getUserById);
router.patch('/update-profile', protect, updateProfile);
export default router;
