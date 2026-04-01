import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.js';
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());//This line tells our express server to automatically parse incoming JSON in the body of HTTP request, request body will be undefined and we will not be able to access the data
app.use("/api/users", authRoutes);//Register our user related routes like register login under the /api/users
app.use('/api/recipes', recipeRoutes);
connectDB();
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});

