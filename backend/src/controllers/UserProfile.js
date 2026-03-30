import User from "../models/User.js";
import { request, response } from "express";

export const getUserProfile = async (req, res) => {
  try {
    // We search for the user by their ID (retrieved from the token)
    // We use .select('-password') to avoid returning the password!
    const user = await User.findById(req.user).select('-password');

    if (user) {
      // Retourne les données (200 OK) comme prévu dans le diagramme 
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};