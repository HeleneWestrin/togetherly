import mongoose, { Types } from "mongoose";
import { DEFAULT_BUDGET_CATEGORIES, Wedding } from "../models/wedding.model";
import { User } from "../models/user.model";
import { Task } from "../models/task.model";
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
  ): Promise<User> {
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
    const user = (await User.findById(userId)) as User | null;
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
          select: "title completed budget actualCost dueDate",
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
          Task & { _id: mongoose.Types.ObjectId }
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
            dueDate: task.dueDate,
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

    // Get user to check if they're an admin
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Check if user has permission (is admin or part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can update tasks");
    }

    // Update the task
    task.completed = completed;
    await task.save();

    return task;
  }

  static async createTask(
    taskData: {
      title: string;
      budget: number;
      actualCost: number;
      dueDate: string;
      budgetItem: string;
      weddingId: string;
    },
    userId: string
  ) {
    const wedding = await Wedding.findById(taskData.weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can create tasks");
    }

    const task = await Task.create(taskData);

    // Update the wedding's budget category with the new task
    await Wedding.findOneAndUpdate(
      {
        _id: taskData.weddingId,
        "budget.allocated._id": taskData.budgetItem,
      },
      {
        $push: {
          "budget.allocated.$.tasks": task._id,
        },
      }
    );

    return task;
  }

  static async deleteTask(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const wedding = await Wedding.findById(task.weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can delete tasks");
    }

    // Remove task reference from wedding
    await Wedding.findOneAndUpdate(
      { _id: task.weddingId },
      { $pull: { "budget.allocated.$[].tasks": task._id } }
    );

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    return { message: "Task deleted successfully" };
  }

  static async updateTaskDetails(
    taskId: string,
    taskData: Partial<Task>,
    userId: string
  ) {
    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const wedding = await Wedding.findById(task.weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can update tasks");
    }

    Object.assign(task, taskData);
    await task.save();
    return task;
  }

  static async updateBudget(weddingId: string, total: number, userId: string) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check if user has permission (is admin or part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError("Only couples or admins can update the budget");
    }

    if (total < 0) {
      throw new ValidationError("Budget cannot be negative");
    }

    wedding.budget.total = total;
    await wedding.save();

    return wedding;
  }

  static async createWeddingFromOnboarding(
    userId: string,
    data: {
      coupleInfo: {
        firstName: string;
        lastName: string;
        partnerFirstName: string;
        partnerLastName: string;
        partnerEmail: string;
        role: string;
      };
      weddingInfo: {
        date: string;
        estimatedGuests: number;
        estimatedBudget: number;
      };
    }
  ) {
    const { coupleInfo, weddingInfo } = data;

    // Create or find partner user
    let partnerUser;
    if (coupleInfo.partnerEmail) {
      partnerUser = await User.findOne({ email: coupleInfo.partnerEmail });
      if (!partnerUser) {
        partnerUser = await User.create({
          email: coupleInfo.partnerEmail,
          role: "couple",
          profile: {
            firstName: coupleInfo.partnerFirstName,
            lastName: coupleInfo.partnerLastName,
          },
        });
      }
    }

    // Create the wedding
    const wedding = new Wedding({
      title: `${coupleInfo.firstName} & ${coupleInfo.partnerFirstName}'s wedding`,
      date: weddingInfo.date || null,
      location: {
        address: "",
        coordinates: {
          lat: 0,
          lng: 0,
        },
      },
      budget: {
        total: weddingInfo.estimatedBudget || 0,
        spent: 0,
        allocated: DEFAULT_BUDGET_CATEGORIES.map((category: string) => ({
          category,
          spent: 0,
          tasks: [],
        })),
      },
      couple: partnerUser ? [userId, partnerUser._id] : [userId],
      guests: [],
    });

    const savedWedding = await wedding.save();
    return savedWedding;
  }
}
