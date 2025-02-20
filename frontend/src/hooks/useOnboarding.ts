import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { onboardingService } from "../services/onboardingService";
import { useOnboardingStore } from "../stores/useOnboardingStore";
import { useAuthStore } from "../stores/useAuthStore";
import { OnboardingProgress } from "../types/onboarding";
import { useEffect } from "react";

export function useOnboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const {
    step,
    coupleInfo,
    weddingInfo,
    setStep,
    setCoupleInfo,
    setWeddingInfo,
    reset,
  } = useOnboardingStore();

  // Fetch existing progress
  const { data, isLoading } = useQuery<OnboardingProgress>({
    queryKey: ["onboardingProgress"],
    queryFn: onboardingService.getProgress,
  });

  // Handle onboarding progress update when data is fetched
  useEffect(() => {
    if (data) {
      setStep(data.step);
      if (data.coupleInfo) {
        setCoupleInfo(data.coupleInfo);
      } else if (!data.coupleInfo && user?.profile) {
        setCoupleInfo({
          firstName: user.profile?.firstName || "",
          lastName: user.profile?.lastName || "",
        });
      }
      if (data.weddingInfo) {
        setWeddingInfo(data.weddingInfo);
      }
    }
  }, [data, setStep, setCoupleInfo, setWeddingInfo, user?.profile]);

  const updateProgressMutation = useMutation({
    mutationFn: onboardingService.updateProgress,
  });

  const createWeddingMutation = useMutation({
    mutationFn: onboardingService.createWedding,
  });

  const handleCoupleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProgressMutation.mutateAsync({
      step: 2,
      coupleInfo,
    });
    setStep(2);
  };

  const handleWeddingInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!coupleInfo.role || !coupleInfo.partnerRole) {
        throw new Error("Please select roles for both partners");
      }

      const weddingResponse = await createWeddingMutation.mutateAsync({
        coupleInfo,
        weddingInfo,
      });

      await Promise.all([
        updateProgressMutation.mutateAsync({
          step: 2,
          weddingInfo,
          completed: true,
        }),
        onboardingService.completeOnboarding(
          coupleInfo.firstName,
          coupleInfo.lastName
        ),
      ]);

      reset(); // Clear onboarding state
      navigate(`/wedding/${weddingResponse.data.slug}/budget`);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw error;
    }
  };

  return {
    step,
    coupleInfo,
    weddingInfo,
    isLoading,
    setCoupleInfo,
    setWeddingInfo,
    handleCoupleInfoSubmit,
    handleWeddingInfoSubmit,
    updateProgressMutation,
    createWeddingMutation,
  };
}
