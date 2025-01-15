import mongoose, { Types } from "mongoose";
import { Wedding } from "../models/wedding.model";
import { IUser, User } from "../models/user.model";
import { ITask, Task } from "../models/task.model";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { weddingSchemas } from "../validators/schemas";
import { z } from "zod";

export class WeddingService {
  static async getWeddingsForUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    let weddings;
    const populateOptions = "profile.firstName profile.lastName email";

    switch (user.role) {
      case "admin":
        // Admins can see all weddings
        weddings = await Wedding.find()
          .populate("couple", populateOptions)
          .populate("guests", populateOptions)
          .select("title slug date location couple"); // Add slug to selected fields
        break;

      case "couple":
        // Couples can only see their weddings
        weddings = await Wedding.find({ couple: userId })
          .populate("couple", populateOptions)
          .populate("guests", populateOptions)
          .select("title slug date location couple"); // Add slug to selected fields
        break;

      case "guest":
        // Guests can only see weddings they're invited to
        weddings = await Wedding.find({ guests: userId })
          .populate("couple", populateOptions)
          .select("title slug date location couple guests"); // Only include necessary fields
        break;

      default:
        throw new ForbiddenError("Invalid user role");
    }

    return weddings;
  }

  static async getWeddingById(weddingId: string, userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const wedding = await Wedding.findById(weddingId)
      .populate("couple", "profile.firstName profile.lastName email")
      .populate("guests", "profile.firstName profile.lastName email");

    if (!wedding) throw new NotFoundError("Wedding not found");

    // If user is a guest, remove sensitive information
    if (user.role === "guest") {
      return wedding.toObject({
        transform: (_, ret) => {
          delete ret.budget;
          return ret;
        },
      });
    }

    return wedding;
  }

  static async createWedding(weddingData: {
    title: string;
    date: Date;
    location: {
      venue: string;
      address: string;
      city: string;
      country: string;
    };
    budget: {
      total: number;
    };
    coupleIds: string[];
  }) {
    const wedding = new Wedding({
      ...weddingData,
      couple: weddingData.coupleIds,
      guests: [],
      tasks: [],
    });

    const savedWedding = await wedding.save();

    // Update the couples' wedding references
    await User.updateMany(
      { _id: { $in: weddingData.coupleIds } },
      { $push: { weddings: savedWedding._id } }
    );

    return savedWedding;
  }

  static async addGuest(weddingId: string, guestEmail: string, userId: string) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Only couples of the wedding or admins can add guests
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!isCouple && user?.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can add guests");
    }

    const guest = await User.findOne({ email: guestEmail });
    if (!guest) throw new NotFoundError("Guest not found");

    // Add guest to wedding if not already added
    if (
      !wedding.guests.some(
        (id) => id.toString() === (guest._id as Types.ObjectId).toString()
      )
    ) {
      wedding.guests.push(guest._id as Types.ObjectId);
      await wedding.save();

      // Add wedding reference to guest's guestDetails
      await User.findByIdAndUpdate(guest._id, {
        $push: {
          guestDetails: {
            weddingId: wedding._id,
            rsvpStatus: "pending",
          },
        },
      });
    }

    return wedding;
  }

  static async updateRSVP(
    weddingId: string,
    userId: string,
    rsvpStatus: unknown
  ): Promise<IUser> {
    try {
      const validatedStatus = weddingSchemas.rsvpStatus.parse(rsvpStatus);
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      const guestDetail = user.guestDetails.find(
        (detail) => detail.weddingId.toString() === weddingId
      );

      if (!guestDetail) {
        throw new ForbiddenError("You are not invited to this wedding");
      }

      guestDetail.rsvpStatus = validatedStatus;
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }
  }

  static async getWeddingBySlug(slug: string, userId: string) {
    const user = (await User.findById(userId)) as IUser | null;
    if (!user) throw new NotFoundError("User not found");

    // Populate both couple/guest info AND tasks for budget calculations
    const wedding = await Wedding.findOne({ slug })
      .populate("couple", "profile.firstName profile.lastName email")
      .populate("guests", "profile.firstName profile.lastName email")
      .populate({
        path: "budget.allocated",
        populate: {
          path: "tasks",
          model: "Task",
          select: "title completed budget actualCost",
        },
      });

    if (!wedding) throw new NotFoundError("Wedding not found");

    // If user is a guest, remove sensitive information
    if (user.role === "guest") {
      return wedding.toObject({
        transform: (_, ret) => {
          delete ret.budget;
          return ret;
        },
      });
    }

    // Calculate budget totals and progress for each category
    if (wedding.budget?.allocated) {
      wedding.budget.allocated = wedding.budget.allocated.map((category) => {
        // Type the populated tasks array properly
        const tasks = (category.tasks || []) as unknown as Array<
          ITask & { _id: mongoose.Types.ObjectId }
        >;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;

        // Create a properly typed category object
        const transformedCategory = {
          _id: category._id,
          category: category.category,
          progress: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
          estimatedCost: tasks.reduce(
            (sum, task) => sum + (task.budget || 0),
            0
          ),
          spent: tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0),
          tasks: tasks.map((task) => ({
            _id: task._id,
            title: task.title,
            budget: task.budget || 0,
            actualCost: task.actualCost,
            completed: task.completed,
          })),
        };

        return transformedCategory;
      });

      // Calculate overall budget totals with type safety
      wedding.budget.spent = wedding.budget.allocated.reduce(
        (sum, category) => sum + (category.spent || 0),
        0
      );
    }

    return wedding;
  }

  static async updateTask(taskId: string, completed: boolean, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    // Get the wedding to check permissions
    const wedding = await Wedding.findById(task.weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check if user has permission (is part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    if (!isCouple) throw new ForbiddenError("Only couples can update tasks");

    // Update the task
    task.completed = completed;
    await task.save();

    return task;
  }
}
