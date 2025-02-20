import { axiosInstance } from "../services/axiosService";

export const navigateBasedOnWeddings = async (
  navigate: (path: string) => void,
  isNewUser?: boolean
) => {
  // Only check for onboarding if user is new
  if (isNewUser) {
    try {
      // First, delete any existing onboarding progress
      await axiosInstance.delete("/api/onboarding/progress");

      // Then create fresh onboarding progress
      await axiosInstance.post("/api/onboarding/progress", {
        step: 1,
        completed: false,
      });

      // Finally check the progress
      const onboardingResponse = await axiosInstance.get(
        "/api/onboarding/progress"
      );
      const onboardingData = onboardingResponse.data.data;

      // Only navigate to onboarding if it's not completed
      if (!onboardingData?.completed) {
        navigate("/onboarding");
        return;
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
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
