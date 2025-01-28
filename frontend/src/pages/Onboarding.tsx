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

interface CoupleInfo {
  firstName: string;
  lastName: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerEmail: string;
  role: "Wife" | "Husband" | "";
  partnerRole: "Wife" | "Husband" | "";
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
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>(() => {
    const savedInfo = localStorage.getItem(STORAGE_KEYS.COUPLE_INFO);
    return savedInfo
      ? JSON.parse(savedInfo)
      : {
          firstName: "",
          lastName: "",
          partnerFirstName: "",
          partnerLastName: "",
          partnerEmail: "",
          role: "",
          partnerRole: "",
        };
  });
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo>(() => {
    const savedInfo = localStorage.getItem(STORAGE_KEYS.WEDDING_INFO);
    return savedInfo
      ? JSON.parse(savedInfo)
      : {
          date: "",
          estimatedGuests: 0,
          estimatedBudget: 0,
        };
  });

  // Add this new useEffect to update form when user data changes
  useEffect(() => {
    if (user?.profile) {
      setCoupleInfo((current) => ({
        ...current,
        firstName: user?.profile?.firstName || current.firstName,
        lastName: user?.profile?.lastName || current.lastName,
      }));
    }
  }, [user?.profile]);

  // Initialize state from backend data
  useEffect(() => {
    if (onboardingData) {
      setStep(onboardingData.step);
      if (onboardingData.coupleInfo) {
        setCoupleInfo(onboardingData.coupleInfo);
      }
      if (onboardingData.weddingInfo) {
        setWeddingInfo(onboardingData.weddingInfo);
      }
    }
  }, [onboardingData]);

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
    localStorage.removeItem(STORAGE_KEYS.COUPLE_INFO);
    localStorage.removeItem(STORAGE_KEYS.WEDDING_INFO);
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
      const response = await createWeddingMutation.mutateAsync({
        coupleInfo,
        weddingInfo,
      });

      // Mark onboarding as completed
      await updateProgressMutation.mutateAsync({
        step: 2,
        weddingInfo,
        completed: true,
      });

      // Update user's isNewUser status
      await axiosInstance.patch("/api/users/complete-onboarding");

      // Update local auth store
      useAuthStore.getState().updateUser({ isNewUser: false });

      // Navigate to the wedding budget page using the slug from the response
      navigate(`/wedding/${response.data.slug}/budget`);
    } catch (error) {
      console.error("Failed to update onboarding status:", error);
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
    onSuccess: (data) => {
      clearLocalStorage(); // Clear stored data after successful submission
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row relative">
        <div className="lg:flex-1 lg:p-6 xl:p-8 2xl:p-12">
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
                className="text-center"
              >
                ...and congratulations to your upcoming wedding!
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex-1 px-6 py-10 lg:px-6 xl:px-8 2xl:px-12 lg:py-16 xl:py-20 2xl:py-32 space-y-6 lg:space-y-8 xl:space-y-12 2xl:space-y-16 flex flex-col lg:justify-center">
          <Typography
            element="h2"
            styledAs="h2Large"
          >
            Let's get started 🩷
          </Typography>
          <form
            onSubmit={handleCoupleInfoSubmit}
            className="space-y-16"
          >
            <div>
              <Typography
                element="h3"
                className="mb-6"
              >
                Who are you?
              </Typography>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xl:gap-4 mb-4">
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
                      role: value as "Wife" | "Husband",
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 xl:gap-4 mb-4">
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
                      partnerRole: value as "Wife" | "Husband",
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
    <div className="min-h-screen flex flex-col lg:flex-row relative">
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
              className="text-center"
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
              // Basic validation for YYYY-MM-DD format
              if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
                setWeddingInfo({ ...weddingInfo, date: inputDate });
              }
            }}
          />
          <FormInput
            id="estimatedGuests"
            name="estimatedGuests"
            label="Estimated number of guests"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weddingInfo.estimatedGuests}
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
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
            type="text"
            inputMode="numeric"
            value={weddingInfo.estimatedBudget}
            onChange={(e) =>
              setWeddingInfo({
                ...weddingInfo,
                estimatedBudget: Number(e.target.value),
              })
            }
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  const response = await createWeddingMutation.mutateAsync({
                    coupleInfo,
                    weddingInfo,
                  });

                  // Mark onboarding as completed
                  await updateProgressMutation.mutateAsync({
                    step: 2,
                    weddingInfo,
                    completed: true,
                  });

                  // Update user's isNewUser status
                  await axiosInstance.patch("/api/users/complete-onboarding");

                  // Clear localStorage
                  clearLocalStorage();

                  // Update local auth store
                  useAuthStore.getState().updateUser({ isNewUser: false });

                  navigate(`/wedding/${response.data.slug}/budget`);
                } catch (error) {
                  console.error("Error during onboarding completion:", error);
                }
              }}
              className="w-full"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              className="w-full"
            >
              Complete setup{" "}
              <ArrowRightIcon className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
