import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/lentera_blog";
    await mongoose.connect(uri);
    console.log("✅ MongoDB Terhubung via Mongoose");
  } catch (error) {
    console.error("❌ Gagal connect MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
