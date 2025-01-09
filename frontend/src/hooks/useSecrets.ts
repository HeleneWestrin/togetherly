import { useQuery } from "react-query";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";

interface SecretData {
  secret: string;
  userId: string;
}

const fetchSecrets = async (): Promise<SecretData> => {
  const response = await axiosInstance.get<SecretData>("/users/secrets");
  return response.data;
};

export const useSecrets = () => {
  return useQuery<SecretData, AxiosError>("secretData", fetchSecrets, {
    retry: false,
  });
};
