import mongoose, { Schema, Document } from "mongoose";
import { userRoleValues } from "../types/constants";

export interface OnboardingProgress extends Document {
  userId: string;
  step: number;
  coupleInfo: {
    firstName: string;
    lastName: string;
    partnerFirstName: string;
    partnerLastName: string;
    partnerEmail: string;
    role: string;
    partnerRole: string;
  };
  weddingInfo: {
    date: string;
    estimatedGuests: number;
    estimatedBudget: number;
  };
  completed: boolean;
  lastUpdated: Date;
}

const onboardingSchema = new Schema({
  userId: { type: String, required: true },
  step: { type: Number, required: true },
  coupleInfo: {
    firstName: { type: String },
    lastName: { type: String },
    partnerFirstName: { type: String },
    partnerLastName: { type: String },
    partnerEmail: { type: String },
    role: { type: String, enum: userRoleValues },
    partnerRole: { type: String, enum: userRoleValues },
  },
  weddingInfo: {
    date: { type: String },
    estimatedGuests: { type: Number },
    estimatedBudget: { type: Number },
  },
  completed: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
});

onboardingSchema.index(
  { lastUpdated: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
); // Expire after 7 days

export const OnboardingProgress = mongoose.model<OnboardingProgress>(
  "OnboardingProgress",
  onboardingSchema
);
