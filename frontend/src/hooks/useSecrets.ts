import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { axiosInstance } from "../services/axiosService";

interface SecretResponse {
  status: "success";
  data: {
    secret: string;
    userId: string;
  };
}

const fetchSecrets = async (): Promise<SecretResponse["data"]> => {
  const response = await axiosInstance.get<SecretResponse>("/users/secrets");
  return response.data.data;
};

export const useSecrets = () => {
  return useQuery<SecretResponse["data"], AxiosError>(
    "secretData",
    fetchSecrets,
    {
      retry: false,
    }
  );
};
