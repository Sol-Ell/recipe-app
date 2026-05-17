import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipeRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/api/users", authRoutes);//Register our user related routes like register login under the /api/users
app.use('/api/recipes', recipeRoutes);//Routes linked to the recipes
app.use('/api/edit', userRoutes);//Routes linked to the profile

// Wait for DB connection before starting the server
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  }
});

export default app;
