import User from "../models/User.js";


export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Access Denied: User not identified." });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: "Invalid ID format" });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: "Format d'ID invalide" });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { avatar, email, password, cuisineTags, dietaryTags, levelTags } = req.body;

    if (avatar) user.avatar = avatar;
    if (email) user.email = email;
    if (cuisineTags) user.cuisineTags = cuisineTags;
    if (dietaryTags) user.dietaryTags = dietaryTags;
    if (levelTags) user.levelTags = levelTags;

    // CORRECTION DU DOUBLE-HASH : On change juste la valeur, le Mongoose Model (User.js) va le hasher tout seul !
    if (password && password.trim() !== "") {
       user.password = password; 
    }
    console.log("Mot de passe reçu du front : ", password);

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Erreur détaillée :", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};