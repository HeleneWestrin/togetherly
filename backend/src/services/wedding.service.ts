import mongoose, { Types } from "mongoose";
import { Wedding } from "../models/wedding.model";
import { User } from "../models/user.model";
import { Task } from "../models/task.model";
import {
  createForbiddenError,
  createNotFoundError,
  createValidationError,
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
import { leanQuery } from "../utils/leanQuery";

/**
 * Get weddings for a user
 */
export const getWeddingsForUser = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw createNotFoundError("User not found");

    const populateOptions =
      "profile.firstName profile.lastName email isRegistered";
    let weddings;

    if (user.isAdmin) {
      // Admins can see all weddings
      weddings = await leanQuery(
        Wedding.find()
          .populate("couple", populateOptions)
          .populate("guests", populateOptions)
          .select("title slug date location couple")
      );
    } else {
      // Non-admins: find all weddings where the user has any role
      const weddingIds = user.weddings.map((wr) => wr.weddingId);
      weddings = await leanQuery(
        Wedding.find({ _id: { $in: weddingIds } })
          .populate("couple", populateOptions)
          .populate("guests", populateOptions)
          .select("title slug date location couple guests")
      );
    }

    // Process nested fields like "categories" if they exist.
    if (weddings && Array.isArray(weddings)) {
      weddings.forEach((wedding) => {
        const w = wedding as any;
        if (w.categories && Array.isArray(w.categories)) {
          w.categories = w.categories.map((category: any) =>
            category &&
            category.toObject &&
            typeof category.toObject === "function"
              ? category.toObject()
              : category
          );
        }
      });
    }

    return weddings;
  } catch (error) {
    console.error("Error in getWeddingsForUser:", error);
    throw error;
  }
};

/**
 * Get a wedding by its id
 */
export const getWeddingById = async (weddingId: string, userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  const populatedWedding = await Wedding.findById(weddingId)
    .populate("couple", "profile.firstName profile.lastName email isRegistered")
    .populate(
      "guests",
      "profile.firstName profile.lastName email isRegistered"
    );

  if (!populatedWedding) throw createNotFoundError("Wedding not found");

  const userWeddingRole = user.weddings.find(
    (wr) => wr.weddingId.toString() === weddingId
  );

  // If user is a guest, remove sensitive information
  if (userWeddingRole?.accessLevel === "guest") {
    return populatedWedding.toObject({
      transform: (_, ret) => {
        delete ret.budget;
        return ret;
      },
    });
  }

  return populatedWedding;
};

/**
 * Create a new wedding
 */
export const createWedding = async (weddingData: {
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
}) => {
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
};

/**
 * Add a guest to a wedding
 */
export const addGuest = async (
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
) => {
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) throw createNotFoundError("Wedding not found");

  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  const userWedding = user.weddings.find(
    (w) => w.weddingId.toString() === weddingId
  );

  if (userWedding?.accessLevel !== "couple" && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can add guests");
  }

  // Ensure that wedding.couple exists and is valid.
  if (!wedding.couple || wedding.couple.length === 0) {
    throw createValidationError("Wedding couple information is missing");
  }

  // Now validate that each partnerId in guestData exists in wedding.couple.
  for (const partnerId of guestData.connection.partnerIds) {
    if (!wedding.couple.some((id) => id.toString() === partnerId)) {
      throw createValidationError(`Invalid partner ID: ${partnerId}`);
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
};

/**
 * Update RSVP status for a user in a wedding
 */
export const updateRSVP = async (
  weddingId: string,
  userId: string,
  rsvpStatus: unknown
): Promise<User> => {
  try {
    const validatedStatus = weddingSchemas.rsvpStatus.parse(
      rsvpStatus
    ) as RSVPStatusType;
    const user = await User.findById(userId);
    if (!user) throw createNotFoundError("User not found");

    const guestDetail = user.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    if (!guestDetail) {
      throw createForbiddenError("You are not invited to this wedding");
    }

    if (guestDetail.guestDetails) {
      guestDetail.guestDetails.rsvpStatus = validatedStatus;
      await user.save();
    }

    return user;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(error.errors[0].message);
    }
    throw error;
  }
};

/**
 * Get wedding by its slug identifier
 */
export const getWeddingBySlug = async (slug: string, userId: string) => {
  try {
    // Verify that the user exists.
    const user = await User.findById(userId);
    if (!user) throw createNotFoundError("User not found");

    // Retrieve the wedding by slug, populating nested fields.
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

    if (!wedding) throw createNotFoundError("Wedding not found");

    // Calculate budget totals and progress for each category.
    if (wedding.budget?.budgetCategories) {
      const populatedBudgetCategories = wedding.budget.budgetCategories.map(
        async (category) => ({
          _id: category._id,
          // Convert category to a plain object if possible.
          ...(typeof (category as any).toObject === "function"
            ? (category as unknown as mongoose.Document).toObject()
            : category),
          spent: await (category as any).calculatedSpent,
        })
      );
      const budgetCategoriesWithSpent = await Promise.all(
        populatedBudgetCategories
      );
      wedding.budget.budgetCategories = budgetCategoriesWithSpent;

      // Calculate overall budget totals.
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
  } catch (error) {
    console.error("Error in getWeddingBySlug:", error);
    throw error;
  }
};

/**
 * Update task completion status
 */
export const updateTask = async (
  taskId: string,
  completed: boolean,
  userId: string
) => {
  const task = await Task.findById(taskId);
  if (!task) throw createNotFoundError("Task not found");

  // Get the wedding to check permissions
  const wedding = await Wedding.findById(task.weddingId);
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Get user to check if they're an admin
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  // Check if user has permission (is admin or part of couple)
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  if (!isCouple && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can update tasks");
  }

  // Update the task
  task.completed = completed;
  await task.save();

  return task;
};

/**
 * Create a new task for a wedding
 */
export const createTask = async (
  weddingId: string,
  taskData: {
    title: string;
    budget?: number;
    actualCost?: number;
    dueDate?: Date;
    budgetCategoryId: string;
  },
  userId: string
) => {
  const wedding = await Wedding.findById(weddingId).populate({
    path: "budget.budgetCategories.tasks",
    select: "actualCost",
  });
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Check permissions
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  if (!isCouple && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can create tasks");
  }

  // Find the budget category by ID instead of name
  const budgetCategory = wedding.budget.budgetCategories.find(
    (cat) => cat?._id?.toString() === taskData.budgetCategoryId
  );
  if (!budgetCategory) {
    throw createValidationError("Invalid budget category");
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
      budget: await getBudgetDetails(weddingId),
    },
  };
};

/**
 * Delete a task from a wedding
 */
export const deleteTask = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw createNotFoundError("Task not found");

  const wedding = await Wedding.findById(task.weddingId).populate({
    path: "budget.budgetCategories.tasks",
    select: "actualCost",
  });
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Check permissions
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  if (!isCouple && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can delete tasks");
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
  return getBudgetDetails(wedding._id as string);
};

/**
 * Update task details for a wedding task
 */
export const updateTaskDetails = async (
  taskId: string,
  taskData: {
    title?: string;
    budget?: number;
    actualCost?: number;
    completed?: boolean;
    dueDate?: Date;
  },
  userId: string
) => {
  const task = await Task.findById(taskId);
  if (!task) throw createNotFoundError("Task not found");

  const wedding = await Wedding.findById(task.weddingId).populate({
    path: "budget.budgetCategories.tasks",
    select: "actualCost",
  });
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Check permissions
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  if (!isCouple && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can update tasks");
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
      budget: await getBudgetDetails(wedding._id as string),
    },
  };
};

/**
 * Update the wedding budget
 */
export const updateBudget = async (
  weddingId: string,
  total: number,
  userId: string
) => {
  const wedding = await Wedding.findById(weddingId).populate({
    path: "budget.budgetCategories.tasks",
    select: "actualCost",
  });
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Check if user has permission (is admin or part of couple)
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  if (!isCouple && !user.isAdmin) {
    throw createForbiddenError("Only couples or admins can update the budget");
  }

  if (total < 0) {
    throw createValidationError("Budget cannot be negative");
  }

  wedding.budget.total = total;
  // Let the virtual handle spent calculation
  await wedding.save();

  return wedding;
};

/**
 * Get detailed budget information for a wedding
 */
export const getBudgetDetails = async (weddingId: string) => {
  const wedding = await Wedding.findById(weddingId).populate({
    path: "budget.budgetCategories.tasks",
    select: "actualCost",
  });

  if (!wedding) throw createNotFoundError("Wedding not found");

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
};

/**
 * Create a wedding from onboarding data
 */
export const createWeddingFromOnboarding = async (
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
) => {
  const { coupleInfo, weddingInfo } = data;

  // Validate roles
  if (!coupleInfo.role || !coupleInfo.partnerRole) {
    throw createValidationError("Roles must be specified for both partners");
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
  const wedding = await createWedding(weddingData);
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
};

/**
 * Update a guest's details in a wedding
 */
export const updateGuest = async (
  weddingId: string,
  guestId: string,
  guestData: any,
  userId: string
): Promise<any> => {
  // Find the guest's user document
  const guestUser = await User.findById(guestId);
  if (!guestUser) {
    throw createNotFoundError("Guest not found");
  }

  // Update the guest's profile fields if provided
  if (guestData.profile) {
    if (guestData.profile.firstName !== undefined) {
      guestUser.profile.firstName = guestData.profile.firstName.trim();
    }
    if (guestData.profile.lastName !== undefined) {
      guestUser.profile.lastName = guestData.profile.lastName.trim();
    }
  }

  if (guestData.email !== undefined) {
    guestUser.email = guestData.email ? guestData.email.trim() : undefined;
  }

  // Look for the wedding entry in the guest's weddings array
  const weddingEntry = guestUser.weddings.find(
    (entry: any) => entry.weddingId.toString() === weddingId
  );
  if (!weddingEntry) {
    throw createNotFoundError("Guest wedding entry not found");
  }

  // Update guestDetails using the provided guestData.guestDetails
  if (guestData.guestDetails) {
    weddingEntry.guestDetails = {
      ...weddingEntry.guestDetails,
      ...guestData.guestDetails,
    };
  }

  // Save the updated guest user document
  await guestUser.save();

  // Re-fetch and return the updated wedding details (with population as needed)
  const updatedWedding = await Wedding.findById(weddingId)
    .populate("couple", "profile.firstName profile.lastName email isRegistered")
    .populate(
      "guests",
      "profile.firstName profile.lastName email isRegistered"
    );

  return updatedWedding;
};

/**
 * Delete multiple guests from a wedding
 */
export const deleteGuests = async (
  weddingId: string,
  guestIds: string[],
  userId: string
) => {
  try {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) throw createNotFoundError("Wedding not found");

    // Only couples of the wedding or admins can delete guests
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const user = await User.findById(userId);
    if (!isCouple && !user?.isAdmin) {
      throw createForbiddenError("Only couples or admins can delete guests");
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
};

/**
 * Invite a user to a wedding
 */
export const inviteUser = async (
  weddingId: string,
  inviteData: {
    email: string;
    firstName: string;
    lastName: string;
    accessLevel: WeddingAccessLevelType;
    existingGuestId?: string;
  },
  userId: string
): Promise<Wedding> => {
  const wedding = await Wedding.findById(weddingId).populate("couple");
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Validate permissions
  const requestingUser = await User.findById(userId);
  if (!requestingUser) throw createNotFoundError("Requesting user not found");

  const isCouple = wedding.couple.some(
    (partner) => partner._id.toString() === userId
  );

  if (!isCouple && !requestingUser.isAdmin) {
    throw createForbiddenError("Only couples or admins can invite users");
  }

  // If we're promoting an existing guest
  if (inviteData.existingGuestId) {
    const existingGuest = await User.findById(inviteData.existingGuestId);
    if (!existingGuest) throw createNotFoundError("Guest not found");

    // Verify this guest belongs to this wedding
    const existingRole = existingGuest.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    if (!existingRole) {
      throw createValidationError("Selected guest is not part of this wedding");
    }

    // Update the guest's role to weddingAdmin
    existingRole.accessLevel = "weddingAdmin";
    await existingGuest.save();

    const updatedWedding = await Wedding.findById(weddingId)
      .populate(
        "couple",
        "profile.firstName profile.lastName email isRegistered"
      )
      .populate(
        "guests",
        "profile.firstName profile.lastName email isRegistered"
      );
    if (!updatedWedding) throw createNotFoundError("Wedding not found");
    return updatedWedding;
  }

  // Handle new user invitation
  const cleanedEmail = inviteData.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: cleanedEmail });

  if (existingUser) {
    // Check if user already has a role in this wedding
    const existingRole = existingUser.weddings.find(
      (wr) => wr.weddingId.toString() === weddingId
    );

    if (existingRole) {
      if (existingRole.accessLevel === "couple") {
        throw createValidationError("User is already a couple member");
      }
      existingRole.accessLevel = inviteData.accessLevel;
    } else {
      existingUser.weddings.push({
        weddingId: new Types.ObjectId(weddingId),
        accessLevel: inviteData.accessLevel,
        guestDetails: {
          rsvpStatus: "pending" as RSVPStatusType,
          partyRole: "Guest" as WeddingPartyRoleType,
          connection: { partnerIds: [] },
        },
      });
    }
    await existingUser.save();
    return wedding;
  }

  // Create new user
  const newUser = await User.create({
    email: cleanedEmail,
    profile: {
      firstName: inviteData.firstName,
      lastName: inviteData.lastName,
    },
    isRegistered: false,
    isActive: false,
    weddings: [
      {
        weddingId: new Types.ObjectId(weddingId),
        accessLevel: inviteData.accessLevel,
        guestDetails: {
          rsvpStatus: "pending",
          partyRole: "Guest",
          connection: { partnerIds: [] },
        },
      },
    ],
  });

  // Only add to guests array if they should be a guest
  if (inviteData.accessLevel === "guest") {
    wedding.guests.push(newUser._id as Types.ObjectId);
    await wedding.save();
  }

  return wedding;
};

/**
 * Update RSVP status for multiple guests
 */
export const updateGuestsRSVP = async (
  weddingId: string,
  guestIds: string[],
  rsvpStatus: RSVPStatusType,
  userId: string
) => {
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) throw createNotFoundError("Wedding not found");

  // Check if user has permission (is admin or part of couple)
  const isCouple = wedding.couple.some((id) => id.toString() === userId);
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  const userWeddingRole = user.weddings.find(
    (wr) => wr.weddingId.toString() === weddingId
  );

  if (
    !isCouple &&
    userWeddingRole?.accessLevel !== "weddingAdmin" &&
    !user.isAdmin
  ) {
    throw createForbiddenError(
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
};

/**
 * Update a user's details for a wedding
 */
export const updateUser = async (
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
) => {
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) {
    throw createNotFoundError("Wedding not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createNotFoundError("User not found");
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
};

/**
 * Delete a user from a wedding
 */
export const deleteUser = async (
  weddingId: string,
  userId: string,
  requestingUserId: string
) => {
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) {
    throw createNotFoundError("Wedding not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createNotFoundError("User not found");
  }

  // If user is a guest, update their role instead of removing it
  const weddingRole = user.weddings?.find(
    (wr) => wr.weddingId.toString() === weddingId
  );

  if (weddingRole) {
    if (weddingRole.accessLevel === "weddingAdmin") {
      // Preserve their existing guest details and party role
      weddingRole.accessLevel = "guest";
      // Ensure guestDetails exists
      if (!weddingRole.guestDetails) {
        weddingRole.guestDetails = {
          rsvpStatus: "pending",
          partyRole: "Guest",
          connection: { partnerIds: [] },
        };
      }
    } else {
      // If they're not a weddingAdmin, remove them completely
      user.weddings = user.weddings.filter(
        (wr) => wr.weddingId.toString() !== weddingId
      );
    }
    await user.save();
  }

  // If user is part of the couple, remove them from the wedding
  if (wedding.couple.includes(new Types.ObjectId(userId))) {
    wedding.couple = wedding.couple.filter((id) => id.toString() !== userId);
    await wedding.save();
  }

  return { message: "User removed from wedding successfully" };
};

/**
 * Get a user's access level for a wedding
 */
export const getUserWeddingAccess = async (
  userId: string,
  weddingId: string
) => {
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

  if (user.isAdmin) return "admin";

  const weddingAccess = user.weddings.find(
    (wr) => wr.weddingId.toString() === weddingId
  );

  return weddingAccess?.accessLevel || null;
};

/**
 * Add a user to a wedding with a specific access level
 */
export const addUserToWedding = async (
  userId: string,
  weddingId: string,
  accessLevel: WeddingAccessLevelType,
  partyRole?: WeddingPartyRoleType // e.g., "Maid of Honor", "Best Man", etc.
) => {
  const user = await User.findById(userId);
  if (!user) throw createNotFoundError("User not found");

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
};
