import { useAuthStore } from "../stores/useAuthStore";

export const forceLogout = (): void => {
  useAuthStore.getState().logout();
  window.location.href = "/login";
};
