import { create } from "zustand";

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
