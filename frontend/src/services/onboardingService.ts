import { CoupleInfo, WeddingInfo } from "../types/onboarding";
import { axiosInstance } from "./axiosService";
import { useAuthStore } from "../stores/useAuthStore";

const STORAGE_KEYS = {
  COUPLE_INFO: "onboarding_couple_info",
  WEDDING_INFO: "onboarding_wedding_info",
} as const;

class OnboardingService {
  // Local storage management
  private saveToStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getFromStorage<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // State persistence
  saveCoupleInfo(data: CoupleInfo): void {
    this.saveToStorage(STORAGE_KEYS.COUPLE_INFO, data);
  }

  saveWeddingInfo(data: WeddingInfo): void {
    this.saveToStorage(STORAGE_KEYS.WEDDING_INFO, data);
  }

  getCoupleInfo(): CoupleInfo | null {
    return this.getFromStorage(STORAGE_KEYS.COUPLE_INFO);
  }

  getWeddingInfo(): WeddingInfo | null {
    return this.getFromStorage(STORAGE_KEYS.WEDDING_INFO);
  }

  // API interactions
  async getProgress() {
    const response = await axiosInstance.get("/api/onboarding/progress");
    return response.data.data;
  }

  async updateProgress(data: {
    step: number;
    coupleInfo?: CoupleInfo;
    weddingInfo?: WeddingInfo;
    completed?: boolean;
  }) {
    const response = await axiosInstance.put("/api/onboarding/progress", data);
    return response.data;
  }

  async createWedding(data: {
    coupleInfo: CoupleInfo;
    weddingInfo: WeddingInfo;
  }) {
    const response = await axiosInstance.post("/api/weddings/onboarding", data);
    return response.data;
  }

  async completeOnboarding(firstName: string, lastName: string) {
    await axiosInstance.patch("/api/users/complete-onboarding", {
      firstName,
      lastName,
    });

    useAuthStore.getState().updateUser({
      isNewUser: false,
      profile: { firstName, lastName },
    });
  }

  // Cleanup
  clearOnboardingData(): void {
    localStorage.removeItem(STORAGE_KEYS.COUPLE_INFO);
    localStorage.removeItem(STORAGE_KEYS.WEDDING_INFO);

    // Clear any other onboarding-related data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("onboarding_")) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const onboardingService = new OnboardingService();
