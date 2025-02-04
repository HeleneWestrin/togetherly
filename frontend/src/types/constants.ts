export const WeddingAccessLevel = {
  COUPLE: "couple",
  GUEST: "guest",
  WEDDING_ADMIN: "weddingAdmin",
} as const;

export const CoupleRole = {
  WIFE: "wife",
  HUSBAND: "husband",
} as const;

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

export const WeddingPartyRoles = {
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

export const RSVPStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
} as const;

// Type exports
export type WeddingAccessLevelType =
  (typeof WeddingAccessLevel)[keyof typeof WeddingAccessLevel];
export type CoupleRoleType = (typeof CoupleRole)[keyof typeof CoupleRole];
export type WeddingPartyRoleType =
  (typeof WeddingPartyRoles)[keyof typeof WeddingPartyRoles];
export type RSVPStatusType = (typeof RSVPStatus)[keyof typeof RSVPStatus];
export type BudgetCategoryType = (typeof DEFAULT_BUDGET_CATEGORIES)[number];
