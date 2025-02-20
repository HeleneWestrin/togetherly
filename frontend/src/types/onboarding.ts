import { CoupleRoleType } from "./constants";

export interface CoupleInfo {
  firstName: string;
  lastName: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerEmail: string;
  role: CoupleRoleType;
  partnerRole: CoupleRoleType;
}

export interface WeddingInfo {
  date: string;
  estimatedGuests: number;
  estimatedBudget: number;
  location?: string;
}

export interface OnboardingProgress {
  step: number;
  coupleInfo?: CoupleInfo;
  weddingInfo?: WeddingInfo;
  completed?: boolean;
}
