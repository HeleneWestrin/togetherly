import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DEFAULT_BUDGET_CATEGORIES } from "../types/constants";

interface BudgetTaskItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  budget: number;
  actualCost: number;
  completed: boolean;
}

export interface BudgetCategory {
  _id?: mongoose.Types.ObjectId;
  category: string;
  estimatedCost: number;
  spent: number;
  tasks: mongoose.Types.ObjectId[];
  progress: number;
}

export interface PopulatedBudgetCategory extends Omit<BudgetCategory, "tasks"> {
  tasks: {
    _id: Types.ObjectId;
    title: string;
    budget: number;
    actualCost: number;
    completed: boolean;
    dueDate: Date;
  }[];
}

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Wedding extends Document {
  title: string;
  slug: string;
  date: Date;
  location: Location;
  budget: {
    total: number;
    spent: number;
    budgetCategories: BudgetCategory[];
  };
  couple: mongoose.Types.ObjectId[]; // references Users collection
  guests: mongoose.Types.ObjectId[]; // references Users collection (guests are a user role)
  tasks: mongoose.Types.ObjectId[]; // references Tasks collection
  createdAt: Date;
  updatedAt: Date;
}

const budgetCategorySchema = new Schema<BudgetCategory>({
  category: {
    type: String,
    required: true,
    enum: DEFAULT_BUDGET_CATEGORIES,
  },
  estimatedCost: { type: Number, required: true, default: 0 },
  spent: { type: Number, required: true, default: 0 },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task", required: false }],
  progress: { type: Number, required: true, default: 0 },
});

const locationSchema = new Schema<Location>({
  address: { type: String, required: false },
  coordinates: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
});

const weddingSchema = new Schema<Wedding>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    date: { type: Date, required: false },
    location: {
      type: locationSchema,
      required: false,
      default: {
        address: "",
        coordinates: {
          lat: 0,
          lng: 0,
        },
      },
    },
    budget: {
      total: { type: Number, required: true },
      spent: { type: Number, required: true },
      budgetCategories: {
        type: [budgetCategorySchema],
        default: () =>
          DEFAULT_BUDGET_CATEGORIES.map((category) => ({
            category,
            spent: 0,
            tasks: [],
          })),
      },
    },
    couple: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    guests: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task", required: false }],
  },
  { timestamps: true }
);

// Add a pre-save middleware to generate the slug
weddingSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for existing slugs
    let slug = baseSlug;
    let counter = 1;

    while (await Wedding.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Virtual to calculate spent dynamically based on task "actualCost"
budgetCategorySchema
  .virtual("calculatedSpent")
  .get(async function (this: BudgetCategory) {
    const Task = mongoose.model("Task");
    const tasks = await Task.find({ _id: { $in: this.tasks } });
    return tasks.reduce((total, task) => total + (task.actualCost || 0), 0);
  });

// Add these indexes to the weddingSchema before creating the model
weddingSchema.index({ couple: 1 });
weddingSchema.index({ guests: 1 });
weddingSchema.index({ "budget.budgetCategories.category": 1 });

export const Wedding: Model<Wedding> = mongoose.model<Wedding>(
  "Wedding",
  weddingSchema
);
