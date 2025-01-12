import mongoose, { Document, Model, Schema } from "mongoose";
import { IWedding } from "./wedding.model";

export interface IUser extends Document {
  email: string;
  password: string;
  isActive: boolean;
  role: "admin" | "couple" | "guest";
  guestDetails: Array<{
    weddingId: mongoose.Types.ObjectId;
    rsvpStatus: "pending" | "confirmed" | "declined";
    dietaryPreferences: string;
  }>;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    profilePicture: string;
  };
  weddings: IWedding[];
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },
  profilePicture: { type: String, required: false },
});

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
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
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "couple", "guest"],
      default: "couple",
      required: [true, "Role is required"],
    },
    guestDetails: [
      {
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding" },
        rsvpStatus: {
          type: String,
          enum: ["pending", "confirmed", "declined"],
          default: "pending",
        },
        dietaryPreferences: String,
      },
    ],
    profile: profileSchema,
    weddings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wedding",
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
