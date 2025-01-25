import mongoose from "mongoose";
import { User } from "../models/user.model";
import {
  Wedding,
  BudgetItem,
  DEFAULT_BUDGET_CATEGORIES,
} from "../models/wedding.model";
import { Task } from "../models/task.model";
import bcrypt from "bcryptjs";

export const seedDatabase = async (): Promise<void> => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Wedding.deleteMany({}),
      Task.deleteMany({}),
    ]);

    // Create admin user
    const adminHashedPassword = await bcrypt.hash("AdminPassword123", 10);
    const admin = await User.create({
      email: "helene.westrin@alphadev.se",
      password: adminHashedPassword,
      role: "admin",
      profile: {
        firstName: "Helene",
        lastName: "Westrin",
        phoneNumber: "123-456-7894",
      },
    });

    // Create couple (2 users)
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const [partner1, partner2] = await User.create([
      {
        email: "partner1@example.com",
        password: hashedPassword,
        role: "couple",
        profile: {
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "123-456-7890",
        },
      },
      {
        email: "partner2@example.com",
        password: hashedPassword,
        role: "couple",
        profile: {
          firstName: "Jane",
          lastName: "Smith",
          phoneNumber: "123-456-7891",
        },
      },
    ]);

    // Create guests
    const [guest1, guest2] = await User.create([
      {
        email: "guest1@example.com",
        password: hashedPassword,
        role: "guest",
        profile: {
          firstName: "Bob",
          lastName: "Wilson",
          phoneNumber: "123-456-7892",
        },
      },
      {
        email: "guest2@example.com",
        password: hashedPassword,
        role: "guest",
        profile: {
          firstName: "Alice",
          lastName: "Johnson",
          phoneNumber: "123-456-7893",
        },
      },
    ]);

    // First create the wedding with initial structure but no budget total
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
        allocated: DEFAULT_BUDGET_CATEGORIES.map((category) => ({
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
    if (!createdWedding || !createdWedding.budget.allocated) {
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
      const budgetItem = createdWedding.budget.allocated.find(
        (item) => item.category === category
      );

      if (budgetItem) {
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
            budgetItem: budgetItem._id,
            dueDate: new Date("2025-06-17"),
          });
          tasks.push(task);

          await Wedding.findOneAndUpdate(
            {
              _id: wedding._id,
              "budget.allocated._id": budgetItem._id,
            },
            {
              $push: {
                "budget.allocated.$.tasks": task._id,
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

    // After creating the wedding, update both couple and guests' references
    await User.updateMany(
      { _id: { $in: wedding.guests } },
      {
        $push: {
          weddings: wedding._id,
          guestDetails: {
            weddingId: wedding._id,
            rsvpStatus: "pending",
          },
        },
      }
    );

    // Update couple's wedding references separately (they don't need guestDetails)
    await User.updateMany(
      { _id: { $in: wedding.couple } },
      { $push: { weddings: wedding._id } }
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
