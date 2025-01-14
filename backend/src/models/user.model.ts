import mongoose, { Document, Model, Schema } from "mongoose";
import { IWedding } from "./wedding.model";

/**
 * Interface defining the User document structure
 * Extends mongoose.Document to include MongoDB document methods
 */
export interface IUser extends Document {
  email: string;
  password: string;
  isActive: boolean;
  role: "admin" | "couple" | "guest"; // Strict type for user roles
  // Array of guest-specific details for each wedding they're invited to
  guestDetails: Array<{
    weddingId: mongoose.Types.ObjectId;
    rsvpStatus: "pending" | "confirmed" | "declined";
    dietaryPreferences: string;
  }>;
  // User's personal information
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    profilePicture: string;
  };
  weddings: IWedding[]; // References to weddings (either as guest or couple)
  createdAt: Date;
  updatedAt: Date;
  socialProvider?: "google";
  socialId?: string;
}

// Main user schema definition with validation rules
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensures email addresses are unique
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"], // Email format validation
    },
    password: {
      type: String,
      required: [
        function (this: IUser) {
          return !this.socialProvider;
        },
        "Password is required",
      ],
      validate: {
        validator: function (this: IUser, password: string) {
          // Skip validation if using social login
          if (this.socialProvider) return true;
          return password.length >= 10;
        },
        message: "Password must be at least 10 characters long",
      },
    },
    isActive: {
      type: Boolean,
      default: true, // Users are active by default
    },
    role: {
      type: String,
      enum: ["admin", "couple", "guest"], // Restricts role to these three options
      default: "couple",
      required: [true, "Role is required"],
    },
    // Nested array for tracking wedding-specific guest information
    guestDetails: [
      {
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding" }, // Reference to Wedding model
        rsvpStatus: {
          type: String,
          enum: ["pending", "confirmed", "declined"],
          default: "pending",
        },
        dietaryPreferences: String,
      },
    ],
    profile: {
      firstName: {
        type: String,
        required: [
          function (this: IUser) {
            return !this.socialProvider;
          },
          "First name is required",
        ],
      },
      lastName: {
        type: String,
        required: [
          function (this: IUser) {
            return !this.socialProvider;
          },
          "Last name is required",
        ],
      },
      phoneNumber: { type: String, required: false },
      address: { type: String, required: false },
      profilePicture: { type: String, required: false },
    },
    weddings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wedding", // Allows population of wedding details
      },
    ],
    socialProvider: { type: String, enum: ["google"] },
    socialId: { type: String },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create and export the User model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
