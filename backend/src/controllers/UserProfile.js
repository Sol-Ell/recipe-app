import User from "../models/User.js";
import { request, response } from "express";

export const getUserProfile = async (req, res) => {
  try {
    //Does the user exist? Verify if the user exist
    if (!req.user) {
      return res.status(401).json({ 
        message: "Access Denied: User not identified in the request." 
      });
    }
    // We search for the user by their ID (retrieved from the token)
    // We use .select('-password') to avoid returning the password!
    const user = await User.findById(req.user).select('-password');
    //
    if (!user) {
      return res.status(404).json({ 
        message: "User not found"
      });
    }

    if (user) {
      // Returns the data (200 OK) as expected in the diagram.
      res.status(200).json(user);
    } 
  } catch (error) {
    //The ID sent is not in the format expected by MongoDB
    if (error.name === 'CastError') {
    return res.status(400).json({ 
      message: "Invalid ID format (Wrong ID format)" 
    });
  }

  //Connection problem, database is down
  console.error("Detailed server error:", error);
  res.status(500).json({ 
    message: "Internal server error", 
    error: error.message 
  });
  }
};