import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    //Does req.user exist?
    if (!req.user) {
      return res.status(401).json({ 
        message: "Acces Denied : User not identified in the request." 
      });
    }
    // We search for the user by their ID (retrieved from the token)
    // We use .select('-password') to avoid returning the password!
    const user = await User.findById(req.user).select('-password');

    //Verification that the user exists in the database
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    if (user) {
      // Returns the data (200 OK) as expected in the diagram. 
      res.status(200).json(user);
    } 
    //The ID sent is not in the format expected by MongoDB
  } catch (error) {
    if (error.name === 'CastError') {
    return res.status(400).json({ 
      message: "Format d'identifiant invalide (Wrong ID format)" 
    });
  }
  //Connexion problem.
  console.error("Detailed server error :", error);
  res.status(500).json({ 
    message: "Server Error",
    error: error.message 
  });
  }
};