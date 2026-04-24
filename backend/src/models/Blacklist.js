import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h' // The token will disappear
  }
});

const Blacklist = mongoose.model("Blacklist", blacklistSchema);
export default Blacklist;