import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Check if there is a token in localStorage
const initialToken = localStorage.getItem("token") || null;
const initialIsAuthenticated = Boolean(initialToken);

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  isAuthenticated: initialIsAuthenticated,
  login: (token: string) => {
    localStorage.setItem("token", token);
    set(() => ({
      token,
      isAuthenticated: true,
    }));
  },
  logout: () => {
    localStorage.removeItem("token");
    set(() => ({
      token: null,
      isAuthenticated: false,
    }));
  },
}));
