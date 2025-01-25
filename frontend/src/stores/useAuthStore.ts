import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Interface defining the structure of a user in the auth store
 */
interface User {
  id: string;
  email: string;
  role: "admin" | "couple" | "guest"; // Strict union type for user roles
  isNewUser?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Interface defining the complete auth store state and actions
 *
 * State properties:
 * - token: JWT token for API authentication
 * - user: Currently logged in user data
 * - isAuthenticated: Quick check for auth status
 * - isLoading: Loading state for auth operations
 *
 * Actions:
 * - login: Sets user data and token
 * - logout: Clears auth state
 * - setLoading: Updates loading state
 * - updateUser: Updates user data
 */
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Zustand store for managing authentication state
 * Uses persist middleware to save auth state to localStorage
 *
 * Features:
 * - Persists auth state across page reloads
 * - Provides simple login/logout actions
 * - Manages loading states for auth operations
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token, user) => {
        console.log("Login action called with:", { token, user });
        set({
          token,
          user: {
            ...user,
            isNewUser: user.isNewUser || false,
          },
          isAuthenticated: true,
        });
        console.log("New state after login:", useAuthStore.getState());
      },
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      // Persistence configuration
      name: "togetherly-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
