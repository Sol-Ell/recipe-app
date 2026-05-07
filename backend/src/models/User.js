import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: { 
        type: String,
        default: function() {
            // Génère l'avatar automatiquement avec sa première lettre
            return `https://ui-avatars.com/api/?name=${this.username}&background=588157&color=fff&bold=true`;
        }
    },
    cuisineTags: [{ type: String }], 
    dietaryTags: [{ type: String }], 
    levelTags: [{ type: String }],
    savedRecipes: [{type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    password: {
        type: String,
        required: true,
    }, 
}, {timestamps: true});

// Sécurité pour le hashage de mot de passe
userSchema.pre('save', async function() {
    // 👈 Plus de "next" ici !
    if (!this.isModified("password")) {
        return; 
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;