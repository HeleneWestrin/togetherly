import mongoose, { Schema, Document } from "mongoose";

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
    role: { type: String },
    partnerRole: { type: String },
  },
  weddingInfo: {
    date: { type: String },
    estimatedGuests: { type: Number },
    estimatedBudget: { type: Number },
  },
  completed: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
});

export const OnboardingProgress = mongoose.model<OnboardingProgress>(
  "OnboardingProgress",
  onboardingSchema
);
