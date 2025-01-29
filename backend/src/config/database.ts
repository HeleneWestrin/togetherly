import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URI || "mongodb://localhost/togetherly";
  const options = {
    maxPoolSize: 10,
  };

  try {
    await mongoose.connect(mongoUrl, options);
    mongoose.Promise = Promise;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
