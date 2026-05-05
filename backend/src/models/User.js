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
    avatar: { type: String },
    cuisineTags: [{ type: String }], 
    dietaryTags: [{ type: String }], 
    levelTags: [{ type: String }],
    savedRecipes: [{type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],//Reference from the /models/Recipe.js for saving the recipe
    password: {
        type: String,
        required: true,
    }, 
}, {timestamps: true});

userSchema.pre('save', async function() {
    if (!this.isModified("password")) {
        return; 
    }

    try {
        // 2. Générer le sel et hasher
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
    } catch (error) {
        throw error;
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {//This function compare the password that the user type when he tries to login to the password which in our database
    return await bcrypt.compare(enteredPassword, this.password);//Compare internally hashes the entered password and checks if it matches the stored hash
}

const User = mongoose.model("User", userSchema);
export default User;