import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/togetherly";

  try {
    await mongoose.connect(mongoUrl);
    mongoose.Promise = Promise;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
