import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Wedding } from "../models/wedding.model";
import { DEFAULT_BUDGET_CATEGORIES } from "../types/constants";
import { Task } from "../models/task.model";
import bcrypt from "bcryptjs";

export const seedDatabase = async (): Promise<void> => {
  try {
    // Drop all indexes first
    await User.collection.dropIndexes();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Wedding.deleteMany({}),
      Task.deleteMany({}),
    ]);

    // Recreate only the necessary indexes
    await User.collection.createIndex(
      { email: 1 },
      { sparse: true, unique: true }
    );

    // Create admin user (super user)
    const adminHashedPassword = await bcrypt.hash("AdminPassword123", 10);
    const admin = await User.create({
      email: "helene.westrin@alphadev.se",
      password: adminHashedPassword,
      isAdmin: true,
      isRegistered: true,
      isActive: true,
      profile: {
        firstName: "Helene",
        lastName: "Westrin",
        phoneNumber: "123-456-7894",
      },
      weddings: [],
    });

    // Create couple (2 users)
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const [partner1, partner2] = await User.create([
      {
        email: "partner1@example.com",
        password: hashedPassword,
        isAdmin: false,
        profile: {
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "123-456-7890",
        },
        weddings: [],
      },
      {
        email: "partner2@example.com",
        password: hashedPassword,
        isAdmin: false,
        profile: {
          firstName: "Jane",
          lastName: "Smith",
          phoneNumber: "123-456-7891",
        },
        weddings: [],
      },
    ]);

    // Create guests first
    const [guest1, guest2] = await Promise.all([
      User.create({
        email: "guest1@example.com",
        password: hashedPassword,
        isAdmin: false,
        isRegistered: true,
        isActive: true,
        profile: {
          firstName: "Bob",
          lastName: "Wilson",
          phoneNumber: "123-456-7892",
        },
        weddings: [],
      }),
      User.create({
        email: "guest2@example.com",
        password: hashedPassword,
        isAdmin: false,
        isRegistered: true,
        isActive: true,
        profile: {
          firstName: "Alice",
          lastName: "Johnson",
          phoneNumber: "123-456-7893",
        },
        weddings: [],
      }),
    ]);

    // Then create the wedding with the guest references
    const wedding = await Wedding.create({
      title: `${partner1.profile.firstName} & ${partner2.profile.firstName}'s wedding`,
      date: new Date("2025-06-17"),
      location: {
        address: "123 Wedding Venue St, City, Country",
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
      budget: {
        total: 0,
        spent: 0,
        budgetCategories: DEFAULT_BUDGET_CATEGORIES.map((category) => ({
          category,
          spent: 0,
          tasks: [],
        })),
      },
      couple: [partner1._id, partner2._id],
      guests: [guest1._id, guest2._id],
    });

    // Fetch the created wedding to get the proper budget item IDs
    const createdWedding = await Wedding.findById(wedding._id);
    if (!createdWedding || !createdWedding.budget.budgetCategories) {
      throw new Error("Failed to create wedding with budget items");
    }

    // Create multiple tasks for each budget category
    const tasks = [];
    const taskTemplates = {
      "Venue & catering": [
        {
          title: "Book main venue",
          budget: 45000,
          spent: 44000,
          completed: true,
        },
        {
          title: "Arrange catering",
          budget: 30000,
          spent: 28000,
          completed: true,
        },
      ],
      "Photography & videography": [
        {
          title: "Hire photographer",
          budget: 15000,
          spent: 14500,
          completed: true,
        },
        {
          title: "Book videographer",
          budget: 10000,
          spent: 0,
          completed: false,
        },
      ],
      "Attire & accessories": [
        {
          title: "Wedding dress",
          budget: 12000,
          spent: 11500,
          completed: true,
        },
        { title: "Suits", budget: 8000, spent: 0, completed: false },
      ],
      Ceremony: [],
      "Decor & styling": [
        {
          title: "Book florist",
          budget: 8000,
          spent: 7500,
          completed: true,
        },
      ],
      Entertainment: [
        {
          title: "Book band",
          budget: 12000,
          spent: 0,
          completed: false,
        },
      ],
    };

    for (const category of DEFAULT_BUDGET_CATEGORIES) {
      const budgetCategory = createdWedding.budget.budgetCategories.find(
        (item) => item.category === category
      );

      if (budgetCategory) {
        const categoryTasks =
          (
            taskTemplates as Record<
              string,
              Array<{
                title: string;
                budget: number;
                spent: number;
                completed: boolean;
              }>
            >
          )[category] || [];

        for (const taskTemplate of categoryTasks) {
          const task = await Task.create({
            weddingId: wedding._id,
            title: taskTemplate.title,
            budget: taskTemplate.budget,
            actualCost: taskTemplate.spent,
            completed: taskTemplate.completed,
            budgetCategoryId: budgetCategory._id,
            dueDate: new Date("2025-06-17"),
          });
          tasks.push(task);

          await Wedding.findOneAndUpdate(
            {
              _id: wedding._id,
              "budget.budgetCategories._id": budgetCategory._id,
            },
            {
              $push: {
                "budget.budgetCategories.$.tasks": task._id,
              },
            }
          );
        }
      }
    }

    // Calculate total budget from all tasks
    const totalBudget = tasks.reduce((sum, task) => sum + task.budget, 0);
    const totalSpent = tasks.reduce((sum, task) => sum + task.actualCost, 0);

    // Update wedding with total budget and spent
    await Wedding.findByIdAndUpdate(wedding._id, {
      $set: {
        "budget.total": totalBudget,
        "budget.spent": totalSpent,
      },
    });

    // Update couple roles
    await User.updateMany(
      { _id: { $in: [partner1._id, partner2._id] } },
      {
        $push: {
          weddings: {
            weddingId: wedding._id,
            accessLevel: "couple",
          },
        },
      }
    );

    // Update guest roles
    await User.updateMany(
      { _id: guest1._id },
      {
        $push: {
          weddings: {
            weddingId: wedding._id,
            accessLevel: "guest",
            guestDetails: {
              rsvpStatus: "pending",
              connection: {
                partnerIds: [partner1._id, partner2._id],
              },
              partyRole: "Guest",
              dietaryPreferences: "No preferences",
              trivia: "Loves dancing",
            },
          },
        },
      }
    );

    // Update wedding admin role
    await User.updateMany(
      { _id: guest2._id },
      {
        $push: {
          weddings: {
            weddingId: wedding._id,
            accessLevel: "weddingAdmin",
            guestDetails: {
              rsvpStatus: "pending",
              connection: {
                partnerIds: [partner1._id],
              },
              partyRole: "Guest",
              dietaryPreferences: "No preferences",
              trivia: "Helps with planning",
            },
          },
        },
      }
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
