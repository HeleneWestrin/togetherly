import { axiosInstance } from "./axiosService";
import { Wedding } from "../types/wedding";

export const fetchWeddingDetails = async (slug: string) => {
  const response = await axiosInstance.get<{
    status: string;
    data: Wedding;
  }>(`/api/weddings/by-slug/${slug}`);
  return response.data.data;
};
