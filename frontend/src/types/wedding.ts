export interface Task {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  completed: boolean;
  dueDate?: string;
  budgetItem: string;
  weddingId: string;
}

export type CreateTaskData = Omit<Task, "_id" | "completed">;

export interface TaskResponse extends Task {
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  _id: string;
  category: string;
  estimatedCost: number;
  spent: number;
  progress: number;
  tasks: Task[];
}

export interface WeddingLocation {
  venue: string;
  address: string;
  city: string;
  country: string;
}

export interface CoupleProfile {
  firstName: string;
  lastName: string;
}

export interface CoupleUser {
  _id: string;
  email: string;
  profile: CoupleProfile;
}

export interface GuestProfile {
  firstName: string;
  lastName: string;
}

export interface GuestDetails {
  weddingId: string;
  rsvpStatus: "pending" | "confirmed" | "declined";
  dietaryPreferences?: string;
  relationship: "wife" | "husband" | "both";
  trivia?: string;
}

export interface GuestUser {
  _id: string;
  email?: string;
  profile: GuestProfile;
  guestDetails: GuestDetails[];
}

export interface Wedding {
  _id: string;
  slug: string;
  title: string;
  date: string;
  location: WeddingLocation;
  couple: Array<CoupleUser>;
  budget?: {
    total: number;
    spent: number;
    allocated: Array<BudgetCategory>;
  };
  guests?: GuestUser[];
}

export interface WeddingListItem
  extends Pick<Wedding, "_id" | "title" | "slug" | "date"> {
  location: Pick<WeddingLocation, "venue" | "city" | "country">;
  couple: Array<{
    profile: CoupleProfile;
  }>;
}
