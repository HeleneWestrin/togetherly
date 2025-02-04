import { z } from "zod";
import {
  weddingAccessLevelSchema,
  rsvpStatusSchema,
  budgetCategorySchema,
  WeddingPartyRoles,
  RSVPStatus,
} from "../types/constants";

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
  rsvpStatus: rsvpStatusSchema,
  guestData: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    connection: z.object({
      partnerIds: z.array(z.string()).min(1).max(2),
    }),
    partyRole: z.nativeEnum(WeddingPartyRoles),
    rsvpStatus: z.nativeEnum(RSVPStatus),
    dietaryPreferences: z.string().optional().or(z.literal("")),
    trivia: z.string().optional().or(z.literal("")),
  }),
  budget: z.object({
    total: z.number().min(0),
    budgetCategories: z.array(
      z.object({
        category: budgetCategorySchema,
        spent: z.number().min(0),
      })
    ),
  }),
};
