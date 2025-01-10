import { useMutation, UseMutationResult } from "react-query";
import { axiosInstance } from "../services/axiosService";
import { AxiosError } from "axios";

interface LoginResponse {
  token: string;
  // Add more fields when the backend returns them
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
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/users/login",
    credentials
  );
  return response.data;
};

export const useLogin = (): UseMutationResult<
  LoginResponse,
  AxiosError<ErrorResponse>,
  LoginCredentials
> => {
  return useMutation(loginApiCall, {
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
