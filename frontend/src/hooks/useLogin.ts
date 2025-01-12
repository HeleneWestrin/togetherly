import { useMutation } from "react-query";
import { axiosInstance } from "../services/axiosService";
import { AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";

interface LoginResponse {
  status: "success";
  data: {
    userId: string;
    token: string;
    user: {
      id: string;
      email: string;
      role: "admin" | "couple" | "guest";
    };
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
  const navigate = useNavigate();

  return useMutation(loginApiCall, {
    onSuccess: async (data) => {
      useAuthStore.getState().login(data.token, data.user);
      await navigateBasedOnWeddings(navigate);
    },
    onError: (error: AxiosError) => {
      console.error("Login error:", error.response?.data);
    },
  });
};
