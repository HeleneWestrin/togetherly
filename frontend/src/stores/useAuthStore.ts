import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Interface defining the structure of a user in the auth store.
 * Notice there is no "role" field at this level.
 */
interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
  isNewUser?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  weddings?: any[]; // You can replace 'any' with a proper type if available
}

/**
 * Interface defining the complete auth store state and actions.
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
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

/**
 * Zustand store for managing authentication state.
 * This store uses the persist middleware to save the auth state to localStorage.
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
        // Normalize the user without a global "role". Instead, each wedding will have its own role info.
        const normalizedUser: AuthUser = {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          isNewUser: user.isNewUser || false,
          profile: user.profile,
          weddings: user.weddings,
        };
        set({
          token,
          user: normalizedUser,
          isAuthenticated: true,
        });
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
