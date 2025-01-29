import mongoose, { Document, Model, Schema } from "mongoose";
import { Wedding } from "./wedding.model";
import { UserRole } from "../types/user";

/**
 * Interface defining the User document structure
 * Extends mongoose.Document to include MongoDB document methods
 */
export interface User extends Document {
  email: string;
  password: string;
  isRegistered: boolean;
  isActive: boolean;
  role: UserRole; // Strict type for user roles
  // Array of guest-specific details for each wedding they're invited to
  guestDetails: Array<{
    weddingId: mongoose.Types.ObjectId;
    rsvpStatus: "pending" | "confirmed" | "declined";
    dietaryPreferences: string;
    relationship: "wife" | "husband" | "both";
    weddingRole:
      | "Guest"
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Flower girl"
      | "Ring bearer"
      | "Parent"
      | "Family"
      | "Other";
    trivia?: string;
  }>;
  // User's personal information
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    profilePicture: string;
  };
  weddings: Wedding[]; // References to weddings (either as guest or couple)
  createdAt: Date;
  updatedAt: Date;
  socialProvider?: "google";
  socialId?: string;
}

// Main user schema definition with validation rules
const userSchema: Schema<User> = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
      set: function (value: string | null | undefined) {
        // If value is empty string, null, or undefined, return undefined
        // This will cause the field to be omitted entirely
        return value?.trim() || undefined;
      },
    },
    password: {
      type: String,
      required: [
        function (this: User) {
          return !this.socialProvider && this.isRegistered;
        },
        "Password is required for registered users",
      ],
      validate: {
        validator: function (this: User, password: string) {
          if (this.socialProvider || !this.isRegistered) return true;
          return password.length >= 10;
        },
        message: "Password must be at least 10 characters long",
      },
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "couple", "guest", "weddingAdmin"], // Restricts role to these three options
      default: "couple",
      required: [true, "Role is required"],
    },
    // Nested array for tracking wedding-specific guest information
    guestDetails: [
      {
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding" },
        rsvpStatus: {
          type: String,
          enum: ["pending", "confirmed", "declined"],
          default: "pending",
        },
        dietaryPreferences: { type: String },
        relationship: {
          type: String,
          enum: ["wife", "husband", "both"],
          required: true,
        },
        weddingRole: {
          type: String,
          enum: [
            "Guest",
            "Maid of Honor",
            "Best Man",
            "Bridesmaid",
            "Groomsman",
            "Flower girl",
            "Ring bearer",
            "Parent",
            "Family",
            "Other",
          ],
          required: true,
        },
        trivia: { type: String },
      },
    ],
    profile: {
      firstName: {
        type: String,
        required: false,
      },
      lastName: {
        type: String,
        required: false,
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

// Add these indexes to the userSchema before creating the model
userSchema.index({ role: 1 });
userSchema.index({ weddings: 1 });
userSchema.index({ "guestDetails.weddingId": 1 });
userSchema.index({ weddings: 1, role: 1 });

// Create and export the User model
export const User: Model<User> = mongoose.model<User>("User", userSchema);
