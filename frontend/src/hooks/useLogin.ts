import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";

// Define the wrapper response structure
interface ApiResponse<T> {
  status: string;
  data: T;
  timestamp: string;
}

// Define the expected successful response structure from the login API
interface LoginResponse {
  token: string;
  user: {
    id: string;
    isAdmin: boolean;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    weddings: [];
  };
}

// Define the required credentials for login
interface LoginCredentials {
  email: string;
  password: string;
}

// Function that makes the actual API call to the backend
const loginApiCall = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/api/users/login",
    credentials
  );
  return response.data.data; // Extract the data from the wrapper
};

// Custom hook for handling login functionality
export const useLogin = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Use TanStack Query's useMutation hook to manage the login API call
  return useMutation({
    mutationFn: loginApiCall,
    // On successful login:
    onSuccess: async (data) => {
      // Update the auth store with the user's token and info
      useAuthStore.getState().login(data.token, data.user);
      // Navigate the user to the appropriate page based on their wedding data
      await navigateBasedOnWeddings(navigate);
    },
    // On login error:
    onError: (error: AxiosError) => {
      console.error("Login error:", error.response?.data);
    },
  });
};
