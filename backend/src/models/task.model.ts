import mongoose, { Schema, Document, Model } from "mongoose";

export interface Task extends Document {
  weddingId: mongoose.Types.ObjectId; // references Weddings collection
  title: string;
  budget: number;
  actualCost: number;
  completed: boolean;
  budgetCategoryId: mongoose.Types.ObjectId; // references Budget item in Weddings collection
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<Task>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    title: { type: String, required: true },
    budget: { type: Number, required: false },
    actualCost: { type: Number, required: true, default: 0 },
    completed: { type: Boolean, required: true, default: false },
    budgetCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Wedding.budget.budgetCategories",
      required: true,
    },
    dueDate: { type: Date, required: false },
  },
  { timestamps: true }
);

taskSchema.index({ weddingId: 1 });
taskSchema.index({ budgetCategoryId: 1 });
taskSchema.index({ completed: 1 });

export const Task: Model<Task> = mongoose.model<Task>("Task", taskSchema);
