import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log(`MongoDB already connected to ${mongoose.connection.host}`);
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected ${conn.connection.host}`)
    }catch (err) {
        console.log(err)
        process.exit(1);
    }
}