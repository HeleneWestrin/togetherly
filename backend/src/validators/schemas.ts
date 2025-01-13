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
