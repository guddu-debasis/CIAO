import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(error.message);
    console.warn("HINT: Make sure your current IP address is whitelisted in MongoDB Atlas or check your internet connection.");
    process.exit(1);
  }
};

export default connectDB;
