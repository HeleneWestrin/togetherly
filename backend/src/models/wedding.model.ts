import mongoose, { Schema, Document, Model } from "mongoose";

interface IBudgetItem {
  _id?: mongoose.Types.ObjectId;
  category: string;
  spent: number;
  taskIds: mongoose.Types.ObjectId[]; // references Tasks collection
}

interface ILocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IWedding extends Document {
  title: string;
  slug: string;
  date: Date;
  location: ILocation;
  budget: {
    total: number;
    allocated: IBudgetItem[];
  };
  couple: mongoose.Types.ObjectId[]; // references Users collection
  guests: mongoose.Types.ObjectId[]; // references Users collection (guests are a user role)
  tasks: mongoose.Types.ObjectId[]; // references Tasks collection
  createdAt: Date;
  updatedAt: Date;
}

const budgetItemSchema = new Schema<IBudgetItem>({
  category: { type: String, required: true },
  spent: { type: Number, required: true, default: 0 }, // dynamically calculated based on "actualCost" in tasks
  taskIds: [{ type: Schema.Types.ObjectId, ref: "Task", required: false }],
});

const locationSchema = new Schema<ILocation>({
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

const weddingSchema = new Schema<IWedding>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    date: { type: Date, required: true },
    location: { type: locationSchema, required: true },
    budget: {
      total: { type: Number, required: true },
      allocated: { type: [budgetItemSchema], default: [] },
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
budgetItemSchema
  .virtual("calculatedSpent")
  .get(async function (this: IBudgetItem) {
    const Task = mongoose.model("Task");
    const tasks = await Task.find({ _id: { $in: this.taskIds } });
    return tasks.reduce((total, task) => total + (task.actualCost || 0), 0);
  });

export const Wedding: Model<IWedding> = mongoose.model<IWedding>(
  "Wedding",
  weddingSchema
);
