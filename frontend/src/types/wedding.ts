import {
  RSVPStatusType,
  WeddingPartyRoleType,
  WeddingAccessLevelType,
  CoupleRoleType,
} from "./constants";

export interface Task {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  completed: boolean;
  dueDate?: string;
  budgetCategoryId: string;
  weddingId: string;
}

export type CreateTaskData = Omit<Task, "_id" | "completed"> & {
  dueDate?: string;
};

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

export interface GuestProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
}

export interface UserWedding {
  weddingId: string;
  accessLevel: WeddingAccessLevelType;
  coupleDetails: {
    role: CoupleRoleType;
  };
  guestDetails: {
    rsvpStatus: RSVPStatusType;
    partyRole: WeddingPartyRoleType;
    connection: {
      partnerIds: string[];
    };
    trivia?: string;
    dietaryPreferences?: string;
  };
}
export interface CoupleUser {
  _id: string;
  email?: string;
  profile: CoupleProfile;
  accessLevel: WeddingAccessLevelType;
  weddings: UserWedding[];
  isRegistered?: boolean;
}

export interface GuestUser {
  _id: string;
  accessLevel: WeddingAccessLevelType;
  email?: string;
  profile: GuestProfile;
  weddings: UserWedding[];
  isAdmin?: boolean;
  isRegistered?: boolean;
}

export interface Wedding {
  _id: string;
  slug: string;
  title: string;
  date?: string;
  location?: WeddingLocation;
  budget: {
    total: number;
    spent: number;
    budgetCategories: BudgetCategory[];
  };
  weddingAccess?: string;
  guests: GuestUser[];
  couple: CoupleUser[];
}

export interface WeddingListItem
  extends Pick<Wedding, "_id" | "title" | "slug" | "date"> {
  location: Pick<WeddingLocation, "venue" | "city" | "country">;
  couple: Array<{
    profile: CoupleProfile;
  }>;
}
