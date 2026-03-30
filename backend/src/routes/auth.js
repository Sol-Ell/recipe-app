import express from "express";
import User from '../models/User.js';
import { getUserProfile } from "../controllers/UserProfile.js";
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

// Route for Register
const router = express.Router();//Will allow to work with router
router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;
    try{
        if (!username || !email || !password) {//Check if the information has been filled
            return res.status(400).json({message: "Please fill all the fields"})
        }

        const userExists = await User.findOne({email});//To find a user

        if (userExists){//To check if a user exist
            return res
                .status(400)
                .json({ message: "user already exists" });
        }

        const user = await User.create({username, email, password});
        const token = generateToken(user._id);
        res.status(201).json({//This function will create a user if he doesn't exist
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try{
        if(!email || !password){
            return res
                .status(400)
                .json({ message: "Please fill all the the fields" });
        }
        const user = await User.findOne({email});

        if (!user || !(await user.matchPassword(password))){//If the email in the database doesn't exit that's means the user doesn't exist
               return res
                .status(401)
                .json({ message: "Invalid credentials" });
        }
        const token = generateToken(user._id)
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        })
    } catch (err) {
        res.status(500).json({ message: "Server error"});
    }
})

// Me
router.get("/me", protect, async (req, res) => {
res.status(200).json(req.user)
});

//Profile Page
router.get("/profile", protect, getUserProfile);



// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "30d"});//to store the user id 
};
export default router;