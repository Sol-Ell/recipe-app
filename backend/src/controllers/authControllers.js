import Blacklist from "../models/Blacklist.js";

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Aucun token fourni" });
    }

    // Ajouter le token à la liste noire
    await Blacklist.create({ token });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};