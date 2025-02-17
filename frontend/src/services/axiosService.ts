import axios, { AxiosError, AxiosInstance } from "axios";
import { forceLogout } from "../utils/logoutHandler";
import { useAuthStore } from "../stores/useAuthStore";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

// ====================
//  REQUEST INTERCEPTOR
// ====================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Attach token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

// ====================
//  RESPONSE INTERCEPTOR
// ====================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

// ====================
//  AUTH SERVICE METHODS
// ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // add any other fields that the backend returns (e.g., user info)
}

/**
 * Authenticates a user with email & password.
 * Stores the token in localStorage and returns it.
 */
export const login = async (credentials: LoginCredentials): Promise<string> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/api/users/login",
    credentials
  );
  const { token } = response.data;
  localStorage.setItem("token", token);
  return token;
};

/**
 * Example "create account" or registration function.
 */
export const register = async (
  userData: Record<string, unknown>
): Promise<void> => {
  await axiosInstance.post("/api/users", userData);
};

/**
 * Example of retrieving a protected resource.
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get("/api/users/profile");
  return response.data;
};

// Optionally export your axiosInstance if needed elsewhere
export { axiosInstance };
