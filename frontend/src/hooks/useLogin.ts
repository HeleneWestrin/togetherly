import { useMutation, UseMutationResult } from "react-query";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";

interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  message: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
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
  return useMutation(login, {
    onSuccess: (data) => {
      // Store the JWT token when login succeeds
      localStorage.setItem("token", data.token);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
