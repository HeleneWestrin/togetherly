import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { axiosInstance } from "../services/axiosService";

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
