import mongoose, { Document, Model, Schema } from "mongoose";
import {
  WeddingAccessLevel,
  CoupleRole,
  WeddingPartyRoles,
  RSVPStatus,
} from "../types/constants";

/**
 * Interface defining the User document structure
 * Extends mongoose.Document to include MongoDB document methods
 */
export interface User extends Document {
  email?: string;
  password?: string;
  isAdmin: boolean;
  isRegistered: boolean;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    profilePicture?: string;
  };
  weddings: Array<{
    weddingId: mongoose.Types.ObjectId;
    accessLevel: (typeof WeddingAccessLevel)[keyof typeof WeddingAccessLevel];

    // Only for accessLevel = "couple"
    coupleDetails?: {
      role: (typeof CoupleRole)[keyof typeof CoupleRole];
    };

    // Only for accessLevel = "guest" | "weddingAdmin"
    guestDetails?: {
      rsvpStatus: (typeof RSVPStatus)[keyof typeof RSVPStatus];
      partyRole: (typeof WeddingPartyRoles)[keyof typeof WeddingPartyRoles];
      connection: {
        partnerIds: mongoose.Types.ObjectId[];
      };
      dietaryPreferences?: string;
      trivia?: string;
    };
  }>;
  socialProvider?: string;
  socialId?: string;
  createdAt: Date;
  updatedAt: Date;
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
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Nested array for tracking wedding-specific guest information
    weddings: [
      {
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding" },
        accessLevel: {
          type: String,
          enum: Object.values(WeddingAccessLevel),
          required: true,
        },
        coupleDetails: {
          role: {
            type: String,
            enum: Object.values(CoupleRole),
          },
        },
        guestDetails: {
          rsvpStatus: {
            type: String,
            enum: Object.values(RSVPStatus),
            default: RSVPStatus.PENDING,
          },
          partyRole: {
            type: String,
            enum: Object.values(WeddingPartyRoles),
            default: WeddingPartyRoles.GUEST,
          },
          connection: {
            partnerIds: {
              type: [Schema.Types.ObjectId],
              ref: "User",
              validate: {
                validator: function (partnerIds: mongoose.Types.ObjectId[]) {
                  return partnerIds.length >= 1 && partnerIds.length <= 2;
                },
                message:
                  "Must be connected to at least one partner and no more than two",
              },
            },
          },
          dietaryPreferences: { type: String },
          trivia: { type: String },
        },
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
    socialProvider: { type: String, enum: ["google"] },
    socialId: { type: String },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Add these indexes to the userSchema before creating the model
userSchema.index({ weddings: 1 });
userSchema.index({ "weddings.weddingId": 1 });
userSchema.index({ "weddings.accessLevel": 1 });

// Create and export the User model
export const User: Model<User> = mongoose.model<User>("User", userSchema);
