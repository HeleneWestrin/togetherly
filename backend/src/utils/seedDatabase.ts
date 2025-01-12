import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Wedding } from "../models/wedding.model";
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

    // Create wedding with initial budget structure
    const wedding = await Wedding.create({
      title: "John & Jane's Wedding",
      slug: "john-janes-wedding",
      date: new Date("2025-12-31"),
      location: {
        address: "123 Wedding Venue St, City, Country",
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
      budget: {
        total: 50000,
        allocated: [
          {
            category: "Venue",
            spent: 18000,
            taskIds: [],
          },
          {
            category: "Catering",
            spent: 14000,
            taskIds: [],
          },
          {
            category: "Photography",
            spent: 4500,
            taskIds: [],
          },
        ],
      },
      couple: [partner1._id, partner2._id],
      guests: [guest1._id, guest2._id],
    });

    // Fetch the created wedding to get the proper budget item IDs
    const createdWedding = await Wedding.findById(wedding._id);
    if (!createdWedding || !createdWedding.budget.allocated) {
      throw new Error("Failed to create wedding with budget items");
    }

    // Create tasks using the actual budget item IDs
    const tasks = await Task.create([
      {
        weddingId: wedding._id,
        title: "Book Wedding Venue",
        budget: 20000,
        actualCost: 18000,
        budgetItem: createdWedding.budget.allocated[0]._id,
        dueDate: new Date("2024-06-01"),
      },
      {
        weddingId: wedding._id,
        title: "Hire Catering Service",
        budget: 15000,
        actualCost: 14000,
        budgetItem: createdWedding.budget.allocated[1]._id,
        dueDate: new Date("2024-08-01"),
      },
      {
        weddingId: wedding._id,
        title: "Book Photographer",
        budget: 5000,
        actualCost: 4500,
        budgetItem: createdWedding.budget.allocated[2]._id,
        dueDate: new Date("2024-07-01"),
      },
    ]);

    // Update wedding with task references
    await Wedding.findByIdAndUpdate(wedding._id, {
      $set: {
        "budget.allocated.0.taskIds": [tasks[0]._id],
        "budget.allocated.1.taskIds": [tasks[1]._id],
        "budget.allocated.2.taskIds": [tasks[2]._id],
        tasks: tasks.map((task) => task._id),
      },
    });

    // After creating the wedding, update the user's weddings array
    await User.updateMany(
      { _id: { $in: [partner1._id, partner2._id] } },
      { $push: { weddings: wedding._id } }
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
