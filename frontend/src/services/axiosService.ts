import axios, { AxiosError, AxiosInstance } from "axios";
import { forceLogout } from "../utils/logoutHandler";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
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
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
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
  // add any other fields that your backend returns (e.g., user info)
}

/**
 * Authenticates a user with email & password.
 * Stores the token in localStorage and returns it.
 */
export const login = async (credentials: LoginCredentials): Promise<string> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/users/login",
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
  await axiosInstance.post("/users", userData);
};

/**
 * Example of retrieving a protected resource.
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get("/users/profile");
  return response.data;
};

// Optionally export your axiosInstance if needed elsewhere
export { axiosInstance };
