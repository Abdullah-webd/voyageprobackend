import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://webmastersmma:FfPxalo5a6T0hNhb@cluster0.o7l8wpg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;