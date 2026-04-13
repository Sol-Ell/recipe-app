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
    savedRecipes: [{type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    password: {
        type: String,
        required: true,
    }, 
}, {timestamps: true});

userSchema.pre('save', async function() {
    if (!this.isModified("password")) next(); //To check if the password has not been modified
    const salt = await bcrypt.genSalt(10);//Generate the random salt for password hashing and 10 is the number of salt rounds a common default
    this.password = await bcrypt.hash(this.password, salt)//This line hashes the password with the genrated salt and overides the plaintext in our database
    //next();
})

userSchema.methods.matchPassword = async function(enteredPassword) {//This function compare the password that the user type when he tries to login to the password which in our database
    return await bcrypt.compare(enteredPassword, this.password);//Compare internally hashes the entered password and checks if it matches the stored hash
}

const User = mongoose.model("User", userSchema);
export default User;