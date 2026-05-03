import User from "../models/User.js";
import { request, response } from "express";

export const getUserProfile = async (req, res) => {
  try {
    //Does the user exist?
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
// @desc    Récupérer le profil de n'importe quel utilisateur via son ID
// @route   GET /api/users/profile/:id
export const getUserById = async (req, res) => {
  try {
    // 1. On récupère l'ID qui est dans l'URL (:id)
    const userId = req.params.id;

    // 2. Recherche en base de données
    const user = await User.findById(userId).select('-password');

    // 3. Si l'utilisateur n'existe pas
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 4. Succès
    res.status(200).json(user);

  } catch (error) {
    // Gestion des erreurs d'ID mal formé (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Format d'ID invalide" });
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // req.user est déjà l'objet utilisateur chargé par le middleware protect
    if (!req.user) return res.status(401).json({ message: "User not found in request" });

    const userId = req.user._id; // On récupère l'ID MongoDB
    const { avatar, email, password, cuisineTags, dietaryTags, levelTags } = req.body;

    // On récupère l'utilisateur en mode "mutable" pour pouvoir faire .save()
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Mise à jour des champs
    if (avatar) user.avatar = avatar;
    if (email) user.email = email;
    if (cuisineTags) user.cuisineTags = cuisineTags;
    if (dietaryTags) user.dietaryTags = dietaryTags;
    if (levelTags) user.levelTags = levelTags;

    // Password : Ne pas oublier de hasher
    if (password && password.trim() !== "") {
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Réponse propre
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Erreur détaillée :", error); // TRÈS IMPORTANT pour voir le log dans ton terminal
    res.status(500).json({ message: "Server error", error: error.message });
  }
};  