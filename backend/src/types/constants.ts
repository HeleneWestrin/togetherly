import { z } from "zod";

// User Roles
export const WeddingAccessLevel = {
  COUPLE: "couple",
  WEDDING_ADMIN: "weddingAdmin",
  GUEST: "guest",
} as const;

export const CoupleRole = {
  WIFE: "wife",
  HUSBAND: "husband",
} as const;

// Wedding Roles
export const WeddingPartyRoles = {
  COUPLE: "Couple",
  GUEST: "Guest",
  MAID_OF_HONOR: "Maid of Honor",
  BEST_MAN: "Best Man",
  BRIDESMAID: "Bridesmaid",
  GROOMSMAN: "Groomsman",
  FLOWER_GIRL: "Flower girl",
  RING_BEARER: "Ring bearer",
  PARENT: "Parent",
  FAMILY: "Family",
  OTHER: "Other",
} as const;

// RSVP Status
export const RSVPStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
} as const;

// Budget Categories
export const DEFAULT_BUDGET_CATEGORIES = [
  "Attire & accessories",
  "Ceremony",
  "Decor & styling",
  "Entertainment",
  "Invitations & stationery",
  "Makeup & wellness",
  "Miscellaneous",
  "Photography & videography",
  "Transportation",
  "Venue & catering",
] as const;

// Type exports
export type WeddingAccessLevelType =
  (typeof WeddingAccessLevel)[keyof typeof WeddingAccessLevel];
export type CoupleRoleType = (typeof CoupleRole)[keyof typeof CoupleRole];
export type WeddingPartyRoleType =
  (typeof WeddingPartyRoles)[keyof typeof WeddingPartyRoles];
export type RSVPStatusType = (typeof RSVPStatus)[keyof typeof RSVPStatus];
export type BudgetCategoryType = (typeof DEFAULT_BUDGET_CATEGORIES)[number];

// Zod schemas for validation
export const weddingAccessLevelSchema = z.nativeEnum(WeddingAccessLevel);
export const coupleRoleSchema = z.nativeEnum(CoupleRole);
export const connectionSchema = z.object({
  partnerIds: z.array(z.string()).min(1).max(2),
});
export const weddingPartyRoleSchema = z.nativeEnum(WeddingPartyRoles);
export const rsvpStatusSchema = z.nativeEnum(RSVPStatus);
export const budgetCategorySchema = z.enum(DEFAULT_BUDGET_CATEGORIES);

// Arrays for mongoose enum validation
export const userRoleValues = Object.values(WeddingAccessLevel);
export const weddingRoleValues = Object.values(WeddingPartyRoles);
export const rsvpStatusValues = Object.values(RSVPStatus);
