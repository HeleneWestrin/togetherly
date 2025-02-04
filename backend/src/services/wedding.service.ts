import mongoose, { Types } from "mongoose";
import {
  Wedding,
  PopulatedBudgetCategory,
  BudgetCategory,
} from "../models/wedding.model";
import { User } from "../models/user.model";
import { Task } from "../models/task.model";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { weddingSchemas } from "../validators/schemas";
import { z } from "zod";
import {
  RSVPStatusType,
  DEFAULT_BUDGET_CATEGORIES,
  WeddingAccessLevelType,
  WeddingPartyRoleType,
  RSVPStatus,
  WeddingPartyRoles,
} from "../types/constants";

export class WeddingService {
  static async getWeddingsForUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    let weddings;
    const populateOptions =
      "profile.firstName profile.lastName email isRegistered";

    if (user.isAdmin) {
      // Admins can see all weddings
      weddings = await Wedding.find()
        .populate("couple", populateOptions)
        .populate("guests", populateOptions)
        .select("title slug date location couple");
    } else {
      // Find all weddings where user has any role
      const weddingIds = user.weddings.map((wr) => wr.weddingId);
      weddings = await Wedding.find({ _id: { $in: weddingIds } })
        .populate("couple", populateOptions)
        .populate("guests", populateOptions)
        .select("title slug date location couple guests");
    }

    return weddings;
  }

  static async getWeddingById(weddingId: string, userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const wedding = await Wedding.findById(weddingId)
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered weddings"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered weddings"
      );

    if (!wedding) throw new NotFoundError("Wedding not found");

    const userWeddingRole = user.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    // If user is a guest, remove sensitive information
    if (userWeddingRole?.accessLevel === "guest") {
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
    couple: string[];
  }) {
    const wedding = new Wedding({
      ...weddingData,
      couple: weddingData.couple as string[],
      guests: [],
      tasks: [],
      budget: {
        ...weddingData.budget,
        spent: 0,
        budgetCategories: DEFAULT_BUDGET_CATEGORIES.map((category) => ({
          category,
          tasks: [],
        })),
      },
    });

    const savedWedding = await wedding.save();
    return savedWedding;
  }

  static async addGuest(
    weddingId: string,
    guestData: {
      firstName: string;
      lastName: string;
      email?: string;
      connection: {
        partnerIds: string[];
      };
      partyRole: WeddingPartyRoleType;
      rsvpStatus: RSVPStatusType;
      dietaryPreferences?: string;
      trivia?: string;
    },
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const userWedding = user.weddings.find(
      (w) => w.weddingId.toString() === weddingId
    );

    if (userWedding?.accessLevel !== "couple" && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can add guests");
    }

    // Ensure that wedding.couple exists and is valid.
    if (!wedding.couple || wedding.couple.length === 0) {
      throw new ValidationError("Wedding couple information is missing");
    }

    // Now validate that each partnerId in guestData exists in wedding.couple.
    for (const partnerId of guestData.connection.partnerIds) {
      if (!wedding.couple.some((id) => id.toString() === partnerId)) {
        throw new ValidationError(`Invalid partner ID: ${partnerId}`);
      }
    }

    // Clean the email field
    const cleanedEmail = guestData.email?.trim() || undefined;

    // Check for existing user
    let guest;
    if (cleanedEmail) {
      guest = await User.findOne({ email: cleanedEmail });
    }

    if (!guest) {
      // Create new user
      const userData = {
        profile: {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
        },
        email: cleanedEmail,
        weddings: [
          {
            weddingId: new Types.ObjectId(weddingId),
            accessLevel: "guest",
            guestDetails: {
              rsvpStatus: guestData.rsvpStatus,
              dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
              connection: {
                partnerIds: guestData.connection.partnerIds.map(
                  (id) => new Types.ObjectId(id)
                ),
              },
              partyRole: guestData.partyRole,
              trivia: guestData.trivia?.trim() || "",
            },
          },
        ],
      };

      guest = await User.create(userData);
    } else {
      // Update existing user's wedding role
      const existingWeddingRole = guest.weddings?.find(
        (wr) => wr.weddingId && wr.weddingId.toString() === weddingId
      );

      if (!existingWeddingRole) {
        guest.weddings.push({
          weddingId: new Types.ObjectId(weddingId),
          accessLevel: "guest",
          guestDetails: {
            rsvpStatus: guestData.rsvpStatus,
            dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
            connection: {
              partnerIds: guestData.connection.partnerIds.map(
                (id) => new Types.ObjectId(id)
              ),
            },
            partyRole: guestData.partyRole,
            trivia: guestData.trivia?.trim() || "",
          },
        });
      } else {
        // Update existing guest details
        existingWeddingRole.guestDetails = {
          rsvpStatus: guestData.rsvpStatus,
          dietaryPreferences: guestData.dietaryPreferences?.trim() || "",
          connection: {
            partnerIds: guestData.connection.partnerIds.map(
              (id) => new Types.ObjectId(id)
            ),
          },
          partyRole: guestData.partyRole,
          trivia: guestData.trivia?.trim() || "",
        };
      }
      await guest.save();
    }

    // Add guest to wedding if not already there
    if (!wedding.guests.some((id) => id.toString() === guest._id.toString())) {
      wedding.guests.push(guest._id as Types.ObjectId);
      await wedding.save();
    }

    // Return populated wedding
    return Wedding.findById(wedding._id)
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered weddings"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered weddings"
      );
  }

  static async updateRSVP(
    weddingId: string,
    userId: string,
    rsvpStatus: unknown
  ): Promise<User> {
    try {
      const validatedStatus = weddingSchemas.rsvpStatus.parse(
        rsvpStatus
      ) as RSVPStatusType;
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      const guestDetail = user.weddings.find(
        (wr) => wr.weddingId.toString() === weddingId
      );

      if (!guestDetail) {
        throw new ForbiddenError("You are not invited to this wedding");
      }

      if (guestDetail.guestDetails) {
        guestDetail.guestDetails.rsvpStatus = validatedStatus;
        await user.save();
      }

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

    const wedding = await Wedding.findOne({ slug })
      .populate(
        "couple",
        "_id profile.firstName profile.lastName email isRegistered weddings"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered weddings"
      )
      .populate({
        path: "budget.budgetCategories",
        populate: {
          path: "tasks",
          model: "Task",
          select: "title completed budget actualCost dueDate",
        },
      });

    if (!wedding) throw new NotFoundError("Wedding not found");

    // Calculate budget totals and progress for each category
    if (wedding.budget?.budgetCategories) {
      const populatedBudgetCategories = wedding.budget.budgetCategories.map(
        async (category) => ({
          _id: category._id,
          ...(category as unknown as mongoose.Document).toObject(),
          spent: await (category as any).calculatedSpent,
        })
      );
      const budgetCategoriesWithSpent = await Promise.all(
        populatedBudgetCategories
      );
      wedding.budget.budgetCategories = budgetCategoriesWithSpent;

      // Calculate overall budget totals
      wedding.budget.spent = wedding.budget.budgetCategories.reduce(
        (sum, category) => sum + (category.spent || 0),
        0
      );
    }

    return {
      _id: wedding._id,
      title: wedding.title,
      slug: wedding.slug,
      couple: wedding.couple,
      guests: wedding.guests,
      budget: wedding.budget,
    };
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
    if (!isCouple && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can update tasks");
    }

    // Update the task
    task.completed = completed;
    await task.save();

    return task;
  }

  static async createTask(
    weddingId: string,
    taskData: {
      title: string;
      budget?: number;
      actualCost?: number;
      dueDate?: Date;
      budgetCategoryId: string;
    },
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId).populate({
      path: "budget.budgetCategories.tasks",
      select: "actualCost",
    });
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check permissions
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can create tasks");
    }

    // Find the budget category by ID instead of name
    const budgetCategory = wedding.budget.budgetCategories.find(
      (cat) => cat?._id?.toString() === taskData.budgetCategoryId
    );
    if (!budgetCategory) {
      throw new ValidationError("Invalid budget category");
    }

    // Create task
    const task = await Task.create({
      weddingId: wedding._id,
      title: taskData.title,
      budget: taskData.budget || 0,
      actualCost: taskData.actualCost || 0,
      dueDate: taskData.dueDate,
      budgetCategoryId: budgetCategory._id,
    });

    // Add task to budget category
    budgetCategory.tasks.push(task._id as Types.ObjectId);
    await wedding.save();

    // Return created task with wedding budget info
    return {
      ...task.toObject(),
      wedding: {
        budget: await this.getBudgetDetails(weddingId),
      },
    };
  }

  static async deleteTask(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const wedding = await Wedding.findById(task.weddingId).populate({
      path: "budget.budgetCategories.tasks",
      select: "actualCost",
    });
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check permissions
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can delete tasks");
    }

    // Remove task from budget category
    const budgetCategory = wedding.budget.budgetCategories.find(
      (cat) => cat._id?.toString() === task.budgetCategoryId.toString()
    );
    if (budgetCategory) {
      budgetCategory.tasks = budgetCategory.tasks.filter(
        (t) => t.toString() !== task._id?.toString()
      );
    }

    // Delete task and save wedding
    await Task.deleteOne({ _id: task._id });
    await wedding.save();

    // Return updated budget info
    return this.getBudgetDetails(wedding._id as string);
  }

  static async updateTaskDetails(
    taskId: string,
    taskData: {
      title?: string;
      budget?: number;
      actualCost?: number;
      completed?: boolean;
      dueDate?: Date;
    },
    userId: string
  ) {
    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const wedding = await Wedding.findById(task.weddingId).populate({
      path: "budget.budgetCategories.tasks",
      select: "actualCost",
    });
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check permissions
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can update tasks");
    }

    // Update task
    Object.assign(task, taskData);
    await task.save();

    // Let the virtual handle spent calculation
    await wedding.save();

    // Return updated task with wedding budget info
    return {
      ...task.toObject(),
      wedding: {
        budget: await this.getBudgetDetails(wedding._id as string),
      },
    };
  }

  static async updateBudget(weddingId: string, total: number, userId: string) {
    const wedding = await Wedding.findById(weddingId).populate({
      path: "budget.budgetCategories.tasks",
      select: "actualCost",
    });
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check if user has permission (is admin or part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!isCouple && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can update the budget");
    }

    if (total < 0) {
      throw new ValidationError("Budget cannot be negative");
    }

    wedding.budget.total = total;
    // Let the virtual handle spent calculation
    await wedding.save();

    return wedding;
  }

  static async getBudgetDetails(weddingId: string) {
    const wedding = await Wedding.findById(weddingId).populate({
      path: "budget.budgetCategories.tasks",
      select: "actualCost",
    });

    if (!wedding) throw new NotFoundError("Wedding not found");

    // Force virtual field calculation
    const populatedBudgetCategories = await Promise.all(
      wedding.budget.budgetCategories.map(async (category) => ({
        ...(category as unknown as mongoose.Document).toObject(),
        spent: await (category as any).calculatedSpent,
      }))
    );

    return {
      ...(wedding.budget as unknown as mongoose.Document).toObject(),
      budgetCategories: populatedBudgetCategories,
    };
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
        role: "Wife" | "Husband";
        partnerRole: "Wife" | "Husband";
      };
      weddingInfo: {
        date: string;
        estimatedGuests: number;
        estimatedBudget: number;
      };
    }
  ) {
    const { coupleInfo, weddingInfo } = data;

    // Validate roles
    if (!coupleInfo.role || !coupleInfo.partnerRole) {
      throw new ValidationError("Roles must be specified for both partners");
    }

    // Find or create the partner shell user
    let partner;
    if (coupleInfo.partnerEmail && coupleInfo.partnerEmail.trim() !== "") {
      partner = await User.findOne({ email: coupleInfo.partnerEmail });
    }

    if (!partner) {
      partner = await User.create({
        email: coupleInfo.partnerEmail,
        isRegistered: false,
        isActive: false,
        profile: {
          firstName: coupleInfo.partnerFirstName,
          lastName: coupleInfo.partnerLastName,
        },
        weddings: [],
      });
    }

    // Prepare wedding data
    const weddingData = {
      title: `${coupleInfo.firstName} & ${coupleInfo.partnerFirstName}'s wedding`,
      date: weddingInfo.date ? new Date(weddingInfo.date) : new Date(),
      location: {
        venue: "",
        address: "",
        city: "",
        country: "",
      },
      budget: {
        total: weddingInfo.estimatedBudget || 0,
      },
      // Ensure a valid couple array – using both user IDs here
      couple: [userId, partner._id] as unknown as string[],
    };

    // Create and save the wedding.
    const wedding = await WeddingService.createWedding(weddingData);
    const savedWedding = await wedding.save();

    // Update both users' weddings arrays with the correct defaults.
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $push: {
          weddings: {
            weddingId: savedWedding._id,
            accessLevel: "couple",
            coupleDetails: { role: coupleInfo.role },
            guestDetails: {
              rsvpStatus: RSVPStatus.CONFIRMED,
              partyRole: WeddingPartyRoles.COUPLE,
            },
          },
        },
      }),
      User.findByIdAndUpdate(partner._id, {
        $push: {
          weddings: {
            weddingId: savedWedding._id,
            accessLevel: "couple",
            coupleDetails: { role: coupleInfo.partnerRole },
            guestDetails: {
              rsvpStatus: RSVPStatus.CONFIRMED,
              partyRole: WeddingPartyRoles.COUPLE,
            },
          },
        },
      }),
    ]);

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
      guestDetails: {
        connection: {
          partnerIds: string[];
        };
        rsvpStatus: RSVPStatusType;
        dietaryPreferences?: string;
        trivia?: string;
        partyRole: WeddingPartyRoleType;
      };
    },
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const userWedding = user.weddings.find(
      (w) => w.weddingId.toString() === weddingId
    );

    if (userWedding?.accessLevel !== "couple" && !user.isAdmin) {
      throw new ForbiddenError("Only couples or admins can update guests");
    }

    // Validate that partnerIds exist in the wedding's couple array
    if (guestData.guestDetails?.connection.partnerIds) {
      for (const partnerId of guestData.guestDetails.connection.partnerIds) {
        if (!wedding.couple.some((id) => id.toString() === partnerId)) {
          throw new ValidationError(`Invalid partner ID: ${partnerId}`);
        }
      }
    }

    const guest = await User.findById(guestId);
    if (!guest) throw new NotFoundError("Guest not found");

    // Update profile and email
    if (guestData.profile) {
      guest.profile = {
        ...guest.profile,
        ...guestData.profile,
      };
    }
    if (guestData.email) guest.email = guestData.email;

    // Update wedding-specific details
    const weddingIndex = guest.weddings.findIndex(
      (w) => w.weddingId.toString() === weddingId
    );

    if (weddingIndex === -1) {
      // If guest doesn't have this wedding yet, add it
      guest.weddings.push({
        weddingId: new Types.ObjectId(weddingId),
        accessLevel: "guest",
        guestDetails: {
          ...guestData.guestDetails,
          connection: {
            partnerIds: guestData.guestDetails.connection.partnerIds.map(
              (id) => new Types.ObjectId(id)
            ),
          },
        },
      });
    } else if (guestData.guestDetails) {
      // Update existing wedding details
      guest.weddings[weddingIndex].guestDetails = {
        ...guest.weddings[weddingIndex].guestDetails,
        ...guestData.guestDetails,
        connection: {
          partnerIds: guestData.guestDetails.connection.partnerIds.map(
            (id) => new Types.ObjectId(id)
          ),
        },
      };
    }

    await guest.save();
    return guest;
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
      if (!isCouple && !user?.isAdmin) {
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
      firstName: string;
      lastName: string;
      accessLevel: WeddingAccessLevelType;
      partyRole?: WeddingPartyRoleType;
    },
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId).populate("couple");
    if (!wedding) {
      throw new NotFoundError("Wedding not found");
    }

    // Check if user has permission to invite
    const isCouple = wedding.couple.some(
      (partner) => partner._id.toString() === userId
    );

    // Only allow couples to assign weddingAdmin role
    if (inviteData.accessLevel === "weddingAdmin" && !isCouple) {
      throw new ForbiddenError("Only couples can assign wedding admin roles");
    }

    // Check if email already exists
    const existingUser = (await User.findOne({
      email: inviteData.email,
    })) as User;

    if (existingUser) {
      const existingRole = existingUser.weddings.find(
        (wr) => wr.weddingId.toString() === weddingId
      );

      if (existingRole) {
        // If already has a role in this wedding
        if (existingRole.accessLevel === "couple") {
          throw new ValidationError(
            "User is already a couple member in this wedding"
          );
        }
        // Allow upgrading from guest to weddingAdmin while preserving guest details
        if (
          inviteData.accessLevel === "weddingAdmin" &&
          existingRole.accessLevel === "guest"
        ) {
          existingRole.accessLevel = "weddingAdmin";
          // Keep existing guestDetails intact
        }
      } else {
        // Add new role for this wedding while preserving other wedding roles
        existingUser.weddings.push({
          weddingId: new Types.ObjectId(weddingId),
          accessLevel: inviteData.accessLevel,
          guestDetails: {
            rsvpStatus: "pending",
            dietaryPreferences: "",
            connection: {
              partnerIds: [], // Empty array until connections are set
            },
            partyRole: inviteData.partyRole || "Guest",
            trivia: "",
          },
        });
      }

      // Add user to wedding's guests array if not already there
      if (
        !wedding.guests.some(
          (id: Types.ObjectId) =>
            id.toString() === (existingUser._id as Types.ObjectId).toString()
        )
      ) {
        wedding.guests.push(existingUser._id as Types.ObjectId);
        await wedding.save();
      }

      await existingUser.save();
    } else {
      // Create new user
      const newUser = await User.create({
        email: inviteData.email,
        profile: {
          firstName: inviteData.firstName,
          lastName: inviteData.lastName,
        },
        isRegistered: false,
        isActive: false,
        guestDetails: [
          {
            weddingId: new Types.ObjectId(weddingId),
            accessLevel: inviteData.accessLevel,
            partyRole: inviteData.partyRole,
            rsvpStatus: "pending",
            connection: {
              partnerIds: [], // Empty array until connections are set
            },
          },
        ],
      });

      // Add new user to wedding's guests array
      wedding.guests.push(newUser._id as Types.ObjectId);
      await wedding.save();
    }

    return wedding;
  }

  static async updateGuestsRSVP(
    weddingId: string,
    guestIds: string[],
    rsvpStatus: RSVPStatusType,
    userId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw new NotFoundError("Wedding not found");

    // Check if user has permission (is admin or part of couple)
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const userWeddingRole = user.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    if (
      !isCouple &&
      userWeddingRole?.accessLevel !== "weddingAdmin" &&
      !user.isAdmin
    ) {
      throw new ForbiddenError(
        "Only couples or admins can update guest RSVP status"
      );
    }

    // Update RSVP status for all selected guests
    await User.updateMany(
      {
        _id: { $in: guestIds },
        "weddings.weddingId": wedding._id,
      },
      {
        $set: {
          "weddings.$.guestDetails.rsvpStatus": rsvpStatus,
        },
      }
    );

    // Return updated wedding with populated guests
    return Wedding.findById(weddingId)
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered weddings"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered weddings"
      );
  }

  static async updateUser(
    weddingId: string,
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      accessLevel?: WeddingAccessLevelType;
      partyRole?: WeddingPartyRoleType;
    },
    requestingUserId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) {
      throw new NotFoundError("Wedding not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update profile information
    if (!user.profile) {
      user.profile = {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        profilePicture: "",
      };
    }
    if (userData.firstName) user.profile.firstName = userData.firstName;
    if (userData.lastName) user.profile.lastName = userData.lastName;
    if (userData.email) user.email = userData.email;

    // Update role if user is a guest
    if (userData.accessLevel && user.weddings?.length > 0) {
      const guestDetail = user.weddings.find(
        (wr) => wr.weddingId.toString() === weddingId
      );
      if (guestDetail?.guestDetails) {
        guestDetail.guestDetails.partyRole = userData.partyRole || "Guest";
      }
    }

    await user.save();
    return user;
  }

  static async deleteUser(
    weddingId: string,
    userId: string,
    requestingUserId: string
  ) {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) {
      throw new NotFoundError("Wedding not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If user is a guest, remove their guest details for this wedding
    if (user.weddings?.length > 0) {
      user.weddings = user.weddings.filter(
        (wr) => wr.weddingId.toString() !== weddingId
      );
      await user.save();
    }

    // If user is part of the couple, remove them from the wedding
    if (wedding.couple.includes(new Types.ObjectId(userId))) {
      wedding.couple = wedding.couple.filter((id) => id.toString() !== userId);
      await wedding.save();
    }

    return { message: "User removed from wedding successfully" };
  }

  static async getUserWeddingAccess(userId: string, weddingId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.isAdmin) return "admin";

    const weddingAccess = user.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    return weddingAccess?.accessLevel || null;
  }

  static async addUserToWedding(
    userId: string,
    weddingId: string,
    accessLevel: WeddingAccessLevelType,
    partyRole?: WeddingPartyRoleType // e.g., "Maid of Honor", "Best Man", etc.
  ) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Remove any existing role for this wedding
    user.weddings = user.weddings.filter(
      (wr) => wr.weddingId.toString() !== weddingId
    );

    // Add new role
    user.weddings.push({
      weddingId: new mongoose.Types.ObjectId(weddingId),
      accessLevel,
      guestDetails:
        accessLevel === "guest"
          ? {
              rsvpStatus: "pending",
              dietaryPreferences: "",
              connection: {
                partnerIds: [], // Empty array until connections are set
              },
              partyRole: partyRole || "Guest",
            }
          : undefined,
    });

    await user.save();
  }
}
