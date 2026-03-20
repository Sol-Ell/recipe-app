import User from "../models/User.js"
import jwt from 'jsonwebtoken';//Library that will create and verifies some tokens

export const protect = async (req, res, next) => {//express middleware which access to request, respond and next(function that tells middleware to move to the next handler)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
       try {
            token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//
        
        req.user = await User.findById(decoded.id).select("-password")//To have the user info except the password. the "-" tells to MongoDB to return the information of user except the password field
        
        return next();
       } catch(err) {
            console.error("Token verification failed: ", err.message);
            return res.status(401).json({message: "Not authorized, token failed"})
       }
    }
   if (!token) {
        return res.status(401).json({ message: "Not authorized, no token found" });
    }
}