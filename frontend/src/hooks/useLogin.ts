import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";

// Define the expected successful response structure from the login API
interface LoginResponse {
  status: "success";
  data: {
    userId: string;
    token: string;
    user: {
      id: string;
      email: string;
      role: "admin" | "couple" | "guest"; // User can have one of these three roles
    };
  };
}

// Define the error response structure
interface ErrorResponse {
  message: string;
}

// Define the required credentials for login
interface LoginCredentials {
  email: string;
  password: string;
}

// Function that makes the actual API call to the backend
const loginApiCall = async (
  credentials: LoginCredentials
): Promise<LoginResponse["data"]> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/api/users/login",
    credentials
  );
  return response.data.data;
};

// Custom hook for handling login functionality
export const useLogin = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Use TanStack Query's useMutation hook to manage the login API call
  return useMutation({
    mutationFn: loginApiCall,
    // On successful login:
    onSuccess: async (data) => {
      // 1. Update the auth store with the user's token and info
      useAuthStore.getState().login(data.token, data.user);
      // 2. Navigate the user to the appropriate page based on their wedding data
      await navigateBasedOnWeddings(navigate);
    },
    // On login error:
    onError: (error: AxiosError) => {
      console.error("Login error:", error.response?.data);
    },
  });
};
