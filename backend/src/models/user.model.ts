import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";

// Create JWT secret
// console.log(crypto.randomBytes(32).toString("hex"));

export interface IUser extends Document {
  email: string;
  password: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [10, "Password must be at least 10 characters long"],
  },
});

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
