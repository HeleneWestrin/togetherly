import { axiosInstance } from "../services/axiosService";

export const navigateBasedOnWeddings = async (
  navigate: (path: string) => void,
  isNewUser?: boolean
) => {
  console.log("Helper: ", isNewUser);
  if (isNewUser) {
    navigate("/onboarding");
    return;
  }

  try {
    const response = await axiosInstance.get<{
      status: string;
      data: Array<{ slug: string }>;
    }>("/api/weddings");
    const weddings = response.data.data;

    if (weddings.length === 1) {
      navigate(`/wedding/${weddings[0].slug}/budget`);
    } else {
      navigate("/dashboard");
    }
  } catch (error) {
    console.error("Error fetching weddings:", error);
    navigate("/dashboard"); // Fallback to dashboard on error
  }
};
