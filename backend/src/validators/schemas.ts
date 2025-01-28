import { z } from "zod";

export const userSchemas = {
  email: z.string().email("Invalid email format"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  profile: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
};

export const weddingSchemas = {
  rsvpStatus: z.enum(["pending", "confirmed", "declined"]),
  relationship: z.enum(["wife", "husband", "both"]),
  guestData: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    relationship: z.enum(["wife", "husband", "both"]),
    weddingRole: z.enum([
      "Guest",
      "Maid of Honor",
      "Best Man",
      "Bridesmaid",
      "Groomsman",
      "Flower girl",
      "Ring bearer",
      "Parent",
      "Family",
      "Other",
    ]),
    rsvpStatus: z.enum(["pending", "confirmed", "declined"]),
    dietaryPreferences: z.string().optional().or(z.literal("")),
    trivia: z.string().optional().or(z.literal("")),
  }),
  budget: z.object({
    total: z.number().min(0),
    allocated: z.array(
      z.object({
        category: z.string(),
        spent: z.number().min(0),
      })
    ),
  }),
};
