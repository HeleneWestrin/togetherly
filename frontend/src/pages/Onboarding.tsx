import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import { useAuthStore } from "../stores/useAuthStore";
import WeddingRings from "../assets/illustrations/wedding-rings-divider.svg?react";
import RadioButtonToggle from "../components/ui/RadioButtonToggle";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { BouncingBall } from "react-svg-spinners";

interface CoupleInfo {
  firstName: string;
  lastName: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerEmail: string;
  role: "wife" | "husband" | "";
  partnerRole: "wife" | "husband" | "";
}

interface WeddingInfo {
  date: string;
  estimatedGuests: number;
  estimatedBudget: number;
  location?: string;
}

const STORAGE_KEYS = {
  COUPLE_INFO: "onboarding_couple_info",
  WEDDING_INFO: "onboarding_wedding_info",
} as const;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Fetch existing onboarding progress
  const { data: onboardingData, isLoading } = useQuery({
    queryKey: ["onboardingProgress"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/onboarding/progress");
      return response.data.data;
    },
  });

  // State initialization with backend data
  const [step, setStep] = useState(1);
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    firstName: "",
    lastName: "",
    partnerFirstName: "",
    partnerLastName: "",
    partnerEmail: "",
    role: "wife",
    partnerRole: "wife",
  });
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo>({
    date: "",
    estimatedGuests: 0,
    estimatedBudget: 0,
  });

  // Initialize state from backend data
  useEffect(() => {
    if (onboardingData) {
      setStep(onboardingData.step);
      if (onboardingData.coupleInfo) {
        setCoupleInfo(onboardingData.coupleInfo);
      } else if (!onboardingData.coupleInfo && user?.profile) {
        // Only set from user profile if no onboarding data exists
        setCoupleInfo((current) => ({
          ...current,
          firstName: user.profile?.firstName || "",
          lastName: user.profile?.lastName || "",
        }));
      }
      if (onboardingData.weddingInfo) {
        setWeddingInfo(onboardingData.weddingInfo);
      }
    }
  }, [onboardingData, user?.profile]);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPLE_INFO, JSON.stringify(coupleInfo));
  }, [coupleInfo]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.WEDDING_INFO,
      JSON.stringify(weddingInfo)
    );
  }, [weddingInfo]);

  // Clear localStorage after successful submission
  const clearLocalStorage = () => {
    // Clear specific onboarding keys
    localStorage.removeItem(STORAGE_KEYS.COUPLE_INFO);
    localStorage.removeItem(STORAGE_KEYS.WEDDING_INFO);

    // Clear any other potential onboarding-related data
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("onboarding_")) {
        localStorage.removeItem(key);
      }
    }

    // Force a state reset
    setCoupleInfo({
      firstName: "",
      lastName: "",
      partnerFirstName: "",
      partnerLastName: "",
      partnerEmail: "",
      role: "wife",
      partnerRole: "husband",
    });

    setWeddingInfo({
      date: "",
      estimatedGuests: 0,
      estimatedBudget: 0,
    });
  };

  // Mutation to update progress
  const updateProgressMutation = useMutation({
    mutationFn: async (data: {
      step: number;
      coupleInfo?: CoupleInfo;
      weddingInfo?: WeddingInfo;
      completed?: boolean;
    }) => {
      const response = await axiosInstance.put(
        "/api/onboarding/progress",
        data
      );
      return response.data;
    },
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
      // Validate required roles before submission
      if (!coupleInfo.role || !coupleInfo.partnerRole) {
        throw new Error("Please select roles for both partners");
      }

      clearLocalStorage();

      // Create wedding and wait for response
      const weddingResponse = await createWeddingMutation.mutateAsync({
        coupleInfo: {
          ...coupleInfo,
          role: coupleInfo.role as "wife" | "husband",
          partnerRole: coupleInfo.partnerRole as "wife" | "husband",
        },
        weddingInfo,
      });

      // Wait for all updates to complete before navigation
      await Promise.all([
        updateProgressMutation.mutateAsync({
          step: 2,
          weddingInfo,
          completed: true,
        }),

        axiosInstance.patch("/api/users/complete-onboarding", {
          firstName: coupleInfo.firstName,
          lastName: coupleInfo.lastName,
        }),
      ]);

      // Update local user state
      useAuthStore.getState().updateUser({
        isNewUser: false,
        profile: {
          firstName: coupleInfo.firstName,
          lastName: coupleInfo.lastName,
        },
      });

      // Add small delay to ensure backend updates are complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to wedding page
      navigate(`/wedding/${weddingResponse.data.slug}/budget`);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw error;
    }
  };

  const createWeddingMutation = useMutation({
    mutationFn: async (data: {
      coupleInfo: CoupleInfo;
      weddingInfo: WeddingInfo;
    }) => {
      const response = await axiosInstance.post(
        "/api/weddings/onboarding",
        data
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (step === 1) {
    return (
      <div className="min-h-svh flex flex-col items-center lg:items-stretch lg:flex-row relative">
        <div className="w-full lg:flex-1 lg:p-6 xl:p-8 2xl:p-12">
          <div className="bg-gradient h-full rounded-br-3xl rounded-bl-3xl lg:rounded-3xl flex flex-col justify-center items-center pt-8 pb-10 px-6 lg:p-6 xl:p-8 2xl:p-12">
            <div className="flex relative items-center gap-8 after:content-[''] after:absolute after:top-1/2 after:bg-dark-800 after:left-0 after:w-full after:h-[2px] mb-8 lg:mb-0">
              <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center z-10">
                1
              </div>
              <div className="w-8 h-8 rounded-full bg-white border-2 border-dark-800 font-bold flex items-center justify-center z-10">
                2
              </div>
            </div>
            <div className="flex flex-col items-center justify-center grow w-full">
              <WeddingRings className="w-5/6 lg:w-3/5 mb-8" />
              <Typography
                element="h1"
                styledAs="h1Large"
                className="text-center mb-3 lg:mb-6"
              >
                Welcome to Togetherly!
              </Typography>
              <Typography
                element="p"
                styledAs="bodyLarge"
                className="text-center text-pretty"
              >
                ...and congratulations to your upcoming wedding!
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full md:max-w-2xl lg:max-w-none px-6 py-10 lg:px-6 xl:px-8 2xl:px-12 lg:py-16 xl:py-20 2xl:py-32 space-y-6 lg:space-y-8 xl:space-y-12 2xl:space-y-16 flex flex-col lg:justify-center">
          <Typography
            element="h2"
            styledAs="h2Large"
          >
            Let's get started 🩷
          </Typography>
          <form
            onSubmit={handleCoupleInfoSubmit}
            className="space-y-10 lg:space-y-16"
          >
            <div>
              <Typography
                element="h3"
                className="mb-6"
              >
                Who are you?
              </Typography>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5 mb-4">
                <FormInput
                  id="firstName"
                  name="firstName"
                  label="First name"
                  value={coupleInfo.firstName}
                  onChange={(e) =>
                    setCoupleInfo({ ...coupleInfo, firstName: e.target.value })
                  }
                  required
                />
                <FormInput
                  id="lastName"
                  label="Last name"
                  name="lastName"
                  value={coupleInfo.lastName}
                  onChange={(e) =>
                    setCoupleInfo({ ...coupleInfo, lastName: e.target.value })
                  }
                  required
                />
                <RadioButtonToggle
                  name="role"
                  legend="Who are you in the wedding?"
                  srOnly={true}
                  options={[
                    { label: "Wife", value: "wife" },
                    { label: "Husband", value: "husband" },
                  ]}
                  value={coupleInfo.role}
                  onChange={(value) =>
                    setCoupleInfo({
                      ...coupleInfo,
                      role: value as "wife" | "husband",
                    })
                  }
                  className="self-end"
                />
              </div>
            </div>

            <div>
              <Typography
                element="h3"
                className="mb-6"
              >
                Who's your partner?
              </Typography>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5 mb-4">
                <FormInput
                  id="partnerFirstName"
                  name="partnerFirstName"
                  label="First name"
                  value={coupleInfo.partnerFirstName}
                  onChange={(e) =>
                    setCoupleInfo({
                      ...coupleInfo,
                      partnerFirstName: e.target.value,
                    })
                  }
                  required
                />
                <FormInput
                  id="partnerLastName"
                  name="partnerLastName"
                  label="Last name"
                  value={coupleInfo.partnerLastName}
                  onChange={(e) =>
                    setCoupleInfo({
                      ...coupleInfo,
                      partnerLastName: e.target.value,
                    })
                  }
                  required
                />
                <RadioButtonToggle
                  name="partnerRole"
                  legend="Who is your partner in the wedding?"
                  srOnly={true}
                  options={[
                    { label: "Wife", value: "wife" },
                    { label: "Husband", value: "husband" },
                  ]}
                  value={coupleInfo.partnerRole}
                  onChange={(value) =>
                    setCoupleInfo({
                      ...coupleInfo,
                      partnerRole: value as "wife" | "husband",
                    })
                  }
                  className="self-end"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Continue to the last step{" "}
              <ArrowRightIcon className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col lg:flex-row relative">
      <div className="lg:flex-1 lg:p-6 xl:p-8 2xl:p-12">
        <div className="bg-gradient h-full rounded-br-3xl rounded-bl-3xl lg:rounded-3xl flex flex-col justify-center items-center pt-8 pb-10 px-6 lg:p-6 xl:p-8 2xl:p-12">
          <div className="flex relative items-center gap-8 after:content-[''] after:absolute after:top-1/2 after:bg-dark-800 after:left-0 after:w-full after:h-[2px] mb-8 lg:mb-0">
            <div className="w-8 h-8 rounded-full bg-dark-800 text-white font-bold flex items-center justify-center z-10">
              <CheckIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center z-10">
              2
            </div>
          </div>
          <div className="flex flex-col items-center justify-center grow w-full">
            <WeddingRings className="w-5/6 lg:w-3/5 mb-8" />
            <Typography
              element="h1"
              styledAs="h1Large"
              className="text-center mb-3 lg:mb-6"
            >
              Almost there!
            </Typography>
            <Typography
              element="p"
              styledAs="bodyLarge"
              className="text-center text-pretty"
            >
              Let us know a few details about your big day
            </Typography>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-10 lg:px-6 xl:px-12 lg:py-16 xl:py-20 2xl:py-32 space-y-6 lg:space-y-8 xl:space-y-12 2xl:space-y-16 flex flex-col lg:justify-center">
        <Typography
          element="h2"
          styledAs="h2Large"
        >
          Wedding details ✨
        </Typography>
        <form
          onSubmit={handleWeddingInfoSubmit}
          className="space-y-16"
        >
          <FormInput
            id="date"
            name="date"
            label="Wedding date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            max="2100-12-31"
            value={weddingInfo.date}
            onChange={(e) => {
              const inputDate = e.target.value;
              // Allow empty value or validate YYYY-MM-DD format
              if (inputDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
                setWeddingInfo({ ...weddingInfo, date: inputDate });
              }
            }}
          />
          <FormInput
            id="estimatedGuests"
            name="estimatedGuests"
            label="Estimated number of guests"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weddingInfo.estimatedGuests}
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Tab" &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setWeddingInfo({
                  ...weddingInfo,
                  estimatedGuests: value === "" ? 0 : Number(value),
                });
              }
            }}
          />
          <FormInput
            id="estimatedBudget"
            isCurrency={true}
            currencySuffix=" kr"
            name="estimatedBudget"
            label="Estimated budget"
            type="tel"
            inputMode="numeric"
            value={weddingInfo.estimatedBudget}
            onChange={(e) =>
              setWeddingInfo({
                ...weddingInfo,
                estimatedBudget: Number(e.target.value),
              })
            }
          />
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                updateProgressMutation.isPending ||
                createWeddingMutation.isPending
              }
              aria-busy={
                updateProgressMutation.isPending ||
                createWeddingMutation.isPending
              }
            >
              {updateProgressMutation.isPending ||
              createWeddingMutation.isPending ? (
                <BouncingBall
                  color="#fff"
                  width={24}
                  height={24}
                />
              ) : updateProgressMutation.isSuccess &&
                createWeddingMutation.isSuccess ? (
                <CheckIcon
                  color="#fff"
                  className="w-6 h-6"
                />
              ) : (
                <>
                  Complete setup{" "}
                  <ArrowRightIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
