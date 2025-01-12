import { useMutation, UseMutationResult } from "react-query";
import { axiosInstance } from "../services/axiosService";
import { AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";

interface LoginResponse {
  status: "success";
  data: {
    userId: string;
    token: string;
  };
}

interface ErrorResponse {
  message: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const loginApiCall = async (
  credentials: LoginCredentials
): Promise<LoginResponse["data"]> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/users/login",
    credentials
  );
  return response.data.data;
};

export const useLogin = () => {
  return useMutation(loginApiCall, {
    onSuccess: (data) => {
      useAuthStore.getState().login(data.token);
    },
    onError: (error: AxiosError) => {
      console.error("Login error:", error.response?.data);
    },
  });
};
