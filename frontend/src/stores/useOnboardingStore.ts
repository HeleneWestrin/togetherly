import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CoupleInfo, WeddingInfo } from "../types/onboarding";

interface OnboardingState {
  step: number;
  coupleInfo: CoupleInfo;
  weddingInfo: WeddingInfo;
  setStep: (step: number) => void;
  setCoupleInfo: (info: Partial<CoupleInfo>) => void;
  setWeddingInfo: (info: Partial<WeddingInfo>) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  coupleInfo: {
    firstName: "",
    lastName: "",
    partnerFirstName: "",
    partnerLastName: "",
    partnerEmail: "",
    role: "wife",
    partnerRole: "wife",
  } as CoupleInfo,
  weddingInfo: {
    date: "",
    estimatedGuests: 0,
    estimatedBudget: 0,
  } as WeddingInfo,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setCoupleInfo: (info) =>
        set((state) => ({
          coupleInfo: { ...state.coupleInfo, ...info },
        })),
      setWeddingInfo: (info) =>
        set((state) => ({
          weddingInfo: { ...state.weddingInfo, ...info },
        })),
      reset: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
