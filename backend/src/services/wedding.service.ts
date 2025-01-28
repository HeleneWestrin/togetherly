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
    const populateOptions =
      "profile.firstName profile.lastName email isRegistered";

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
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered"
      );

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

  static async addGuest(
    weddingId: string,
    guestData: {
      firstName: string;
      lastName: string;
      email?: string;
      relationship: "wife" | "husband" | "both";
      role:
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
      rsvpStatus: "pending" | "confirmed" | "declined";
      dietaryPreferences?: string;
      trivia?: string;
    },
    userId: string
  ) {
    try {
      const wedding = await Wedding.findById(weddingId);
      if (!wedding) throw new NotFoundError("Wedding not found");

      // Only couples of the wedding or admins can add guests
      const isCouple = wedding.couple.some((id) => id.toString() === userId);
      const user = await User.findById(userId);
      if (!isCouple && user?.role !== "admin") {
        throw new ForbiddenError("Only couples or admins can add guests");
      }

      // Clean the email field - if it's empty or just whitespace, make it undefined
      const cleanedEmail = guestData.email?.trim() || undefined;

      // If email is provided and not empty, check if user exists
      let guest;
      if (cleanedEmail) {
        guest = await User.findOne({ email: cleanedEmail });
      }

      // If no existing user found or no email provided, create a new one
      if (!guest) {
        // Create user data object without email field
        const userData: any = {
          role: "guest",
          profile: {
            firstName: guestData.firstName,
            lastName: guestData.lastName,
          },
          guestDetails: [
            {
              weddingId: wedding._id as Types.ObjectId,
              rsvpStatus: guestData.rsvpStatus,
              dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
              relationship: guestData.relationship,
              role: guestData.role,
              trivia: guestData.trivia?.trim() || "",
            },
          ],
        };

        // Only add email field if it exists and is not empty
        if (cleanedEmail) {
          userData.email = cleanedEmail;
        }

        guest = await User.create(userData);
      } else {
        // Update existing user's guest details
        const existingGuestDetail = guest.guestDetails?.find(
          (detail) =>
            detail.weddingId.toString() ===
            (wedding._id as Types.ObjectId).toString()
        );

        if (!existingGuestDetail) {
          guest.guestDetails = guest.guestDetails || [];
          guest.guestDetails.push({
            weddingId: wedding._id as Types.ObjectId,
            rsvpStatus: guestData.rsvpStatus,
            dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
            relationship: guestData.relationship,
            role: guestData.role,
            trivia: guestData.trivia?.trim() || "",
          });
        } else {
          Object.assign(existingGuestDetail, {
            rsvpStatus: guestData.rsvpStatus,
            dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
            relationship: guestData.relationship,
            role: guestData.role,
            trivia: guestData.trivia?.trim() || "",
          });
        }
        await guest.save();
      }

      // Add guest to wedding if not already added
      if (
        !wedding.guests.some((id) => id.toString() === guest._id.toString())
      ) {
        wedding.guests.push(guest._id as Types.ObjectId);
        await wedding.save();
      }

      return wedding;
    } catch (error) {
      console.error("Error in addGuest:", error);
      throw error;
    }
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
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered guestDetails"
      )
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

    // Create partner user shell regardless of email
    const partnerUser = await User.create({
      email: coupleInfo.partnerEmail, // This might be undefined, which is fine
      role: "couple",
      profile: {
        firstName: coupleInfo.partnerFirstName,
        lastName: coupleInfo.partnerLastName,
      },
    });

    // Create the wedding with both users
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
      couple: [userId, partnerUser._id], // Always include both users
      guests: [],
    });

    const savedWedding = await wedding.save();

    // Update both users' weddings arrays
    await User.updateMany(
      { _id: { $in: savedWedding.couple } },
      { $push: { weddings: savedWedding._id } }
    );

    return savedWedding;
  }

  static async updateGuest(
    weddingId: string,
    guestId: string,
    guestData: {
      profile: {
        firstName: string;
        lastName: string;
      };
      email?: string;
      guestDetails: Array<{
        relationship: "wife" | "husband" | "both";
        rsvpStatus: "pending" | "confirmed" | "declined";
        dietaryPreferences?: string;
        role:
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
      }>;
    },
    userId: string
  ) {
    try {
      const wedding = await Wedding.findById(weddingId);
      if (!wedding) throw new NotFoundError("Wedding not found");

      // Only couples of the wedding or admins can update guests
      const isCouple = wedding.couple.some((id) => id.toString() === userId);
      const user = await User.findById(userId);
      if (!isCouple && user?.role !== "admin") {
        throw new ForbiddenError("Only couples or admins can update guests");
      }

      const guest = await User.findById(guestId);
      if (!guest) throw new NotFoundError("Guest not found");

      // Update the guest's profile and email
      guest.profile = {
        ...guest.profile,
        ...guestData.profile,
      };
      if (guestData.email) guest.email = guestData.email;

      // Update or add guest details for this wedding
      const guestDetailIndex = guest.guestDetails.findIndex(
        (detail) => detail.weddingId.toString() === weddingId
      );

      if (guestDetailIndex >= 0) {
        // Update existing guest details
        guest.guestDetails[guestDetailIndex] = {
          ...guest.guestDetails[guestDetailIndex],
          ...guestData.guestDetails[0],
          weddingId: wedding._id as Types.ObjectId,
          dietaryPreferences:
            guestData.guestDetails[0].dietaryPreferences || "",
          trivia: "", // Add default trivia field
        };
      } else {
        // Add new guest details
        guest.guestDetails.push({
          ...guestData.guestDetails[0],
          weddingId: wedding._id as Types.ObjectId,
          dietaryPreferences:
            guestData.guestDetails[0].dietaryPreferences || "",
          trivia: "", // Add default trivia field
        });
      }

      await guest.save();
      return wedding;
    } catch (error) {
      console.error("Error in updateGuest:", error);
      throw error;
    }
  }

  static async deleteGuests(
    weddingId: string,
    guestIds: string[],
    userId: string
  ) {
    try {
      const wedding = await Wedding.findById(weddingId);
      if (!wedding) throw new NotFoundError("Wedding not found");

      // Only couples of the wedding or admins can delete guests
      const isCouple = wedding.couple.some((id) => id.toString() === userId);
      const user = await User.findById(userId);
      if (!isCouple && user?.role !== "admin") {
        throw new ForbiddenError("Only couples or admins can delete guests");
      }

      // Remove guests from wedding
      wedding.guests = wedding.guests.filter(
        (guestId) => !guestIds.includes(guestId.toString())
      );
      await wedding.save();

      // Remove wedding from guests' guestDetails
      await User.updateMany(
        { _id: { $in: guestIds } },
        { $pull: { guestDetails: { weddingId: wedding._id } } }
      );

      return wedding;
    } catch (error) {
      console.error("Error in deleteGuests:", error);
      throw error;
    }
  }

  static async inviteUser(
    weddingId: string,
    inviteData: {
      email: string;
      role: "couple" | "guest";
      weddingRole:
        | "Maid of Honor"
        | "Best Man"
        | "Bridesmaid"
        | "Groomsman"
        | "Parent"
        | "Other";
    },
    userId: string
  ) {
    // Validate wedding access
    const wedding = await Wedding.findById(weddingId).populate("couple");
    if (!wedding) {
      throw new NotFoundError("Wedding not found");
    }

    // Check if user has permission to invite
    const isCouple = wedding.couple.some(
      (partner) => partner._id.toString() === userId
    );
    if (!isCouple) {
      throw new ForbiddenError("Only couples can invite users");
    }

    // Check if email already exists
    const existingUser = (await User.findOne({ email: inviteData.email })) as
      | (User & { _id: Types.ObjectId })
      | null;

    if (existingUser) {
      // If user exists, add them to the wedding
      if (inviteData.role === "couple") {
        // Add to couple array if not already there
        if (
          !wedding.couple.some(
            (id) => id.toString() === existingUser._id.toString()
          )
        ) {
          wedding.couple.push(existingUser._id);
        }
      } else {
        // Add to guests array if not already there
        if (!wedding.guests?.includes(existingUser._id)) {
          wedding.guests = wedding.guests || [];
          wedding.guests.push(existingUser._id);

          // Update guest details
          existingUser.guestDetails = existingUser.guestDetails || [];
          existingUser.guestDetails.push({
            weddingId: wedding._id as Types.ObjectId,
            role: inviteData.weddingRole,
            rsvpStatus: "pending",
            relationship: "wife", // Default value
            dietaryPreferences: "",
            trivia: "",
          });
          await existingUser.save();
        }
      }
    } else {
      // Create new user shell
      const newUser = await User.create({
        email: inviteData.email,
        role: inviteData.role,
        guestDetails:
          inviteData.role === "guest"
            ? [
                {
                  weddingId: wedding._id,
                  role: inviteData.weddingRole,
                  rsvpStatus: "pending",
                  relationship: "wife", // Default value
                  dietaryPreferences: "",
                  trivia: "",
                },
              ]
            : undefined,
      });

      // Add to appropriate array
      if (inviteData.role === "couple") {
        wedding.couple.push(newUser._id as Types.ObjectId);
      } else {
        wedding.guests = wedding.guests || [];
        wedding.guests.push(newUser._id as Types.ObjectId);
      }
    }

    await wedding.save();

    // TODO: Send invitation email

    return wedding;
  }

  static async updateGuestsRSVP(
    weddingId: string,
    guestIds: string[],
    rsvpStatus: "pending" | "confirmed" | "declined",
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check if user has permission (is admin or part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && user.role !== "admin") {
      throw new ForbiddenError(
        "Only couples or admins can update guest RSVP status"
      );
    }

    // Update RSVP status for all selected guests
    await User.updateMany(
      {
        _id: { $in: guestIds },
        "guestDetails.weddingId": wedding._id,
      },
      {
        $set: {
          "guestDetails.$.rsvpStatus": rsvpStatus,
        },
      }
    );

    // Return updated wedding with populated guests
    return Wedding.findById(weddingId)
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered guestDetails"
      );
  }
}
