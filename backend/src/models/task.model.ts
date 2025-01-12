import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  weddingId: mongoose.Types.ObjectId; // references Weddings collection
  title: string;
  budget: number;
  actualCost: number;
  budgetItem: mongoose.Types.ObjectId; // references Budget item in Weddings collection
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    title: { type: String, required: true },
    budget: { type: Number, required: false },
    actualCost: { type: Number, required: true, default: 0 },
    budgetItem: {
      type: Schema.Types.ObjectId,
      ref: "Wedding.budget.allocated",
      required: true,
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
