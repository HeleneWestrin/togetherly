import { create } from "zustand";
import { GuestUser } from "../types/wedding";
import { CoupleUser } from "../types/wedding";

interface UIState {
  activePanels: {
    editBudget?: boolean;
    editTask?: {
      isOpen: boolean;
      taskId: string | null;
    };
    addTask?: {
      isOpen: boolean;
      category: string | null;
    };
    addGuest?: {
      isOpen: boolean;
    };
    editGuest?: {
      isOpen: boolean;
      guestId: string | null;
    };
    inviteUser?: {
      isOpen: boolean;
      email: string;
    };
    editUser?: {
      isOpen: boolean;
      user: CoupleUser | GuestUser;
    };
  };
  openPanel: (panel: keyof UIState["activePanels"], data?: any) => void;
  closePanel: (panel: keyof UIState["activePanels"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanels: {},
  openPanel: (panel, data) =>
    set((state) => ({
      activePanels: {
        ...state.activePanels,
        [panel]: data || true,
      },
    })),
  closePanel: (panel) =>
    set((state) => ({
      activePanels: {
        ...state.activePanels,
        [panel]: undefined,
      },
    })),
}));
