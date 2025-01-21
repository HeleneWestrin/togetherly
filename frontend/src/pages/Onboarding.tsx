import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import { useAuthStore } from "../stores/useAuthStore";

interface CoupleInfo {
  firstName: string;
  lastName: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerEmail: string;
  role: "Wife" | "Husband" | "";
}

interface WeddingInfo {
  date: string;
  estimatedGuests: number;
  estimatedBudget: number;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const user = useAuthStore((state) => state.user);

  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    partnerFirstName: "",
    partnerLastName: "",
    partnerEmail: "",
    role: "",
  });

  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo>({
    date: "",
    estimatedGuests: 0,
    estimatedBudget: 0,
  });

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
      navigate(`/wedding/${data.slug}/budget`);
    },
  });

  const handleCoupleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleWeddingInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWeddingMutation.mutate({ coupleInfo, weddingInfo });
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <Typography element="h1">Tell us about the couple</Typography>
          <form
            onSubmit={handleCoupleInfoSubmit}
            className="space-y-6"
          >
            <FormInput
              label="Your First Name"
              value={coupleInfo.firstName}
              onChange={(e) =>
                setCoupleInfo({ ...coupleInfo, firstName: e.target.value })
              }
              required
            />
            <FormInput
              label="Your Last Name"
              value={coupleInfo.lastName}
              onChange={(e) =>
                setCoupleInfo({ ...coupleInfo, lastName: e.target.value })
              }
              required
            />
            <FormInput
              label="Partner's First Name"
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
              label="Partner's Last Name"
              value={coupleInfo.partnerLastName}
              onChange={(e) =>
                setCoupleInfo({
                  ...coupleInfo,
                  partnerLastName: e.target.value,
                })
              }
              required
            />
            <FormInput
              label="Partner's Email (Optional)"
              type="email"
              value={coupleInfo.partnerEmail}
              onChange={(e) =>
                setCoupleInfo({ ...coupleInfo, partnerEmail: e.target.value })
              }
            />
            <select
              value={coupleInfo.role}
              onChange={(e) =>
                setCoupleInfo({
                  ...coupleInfo,
                  role: e.target.value as "Wife" | "Husband",
                })
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Your Role</option>
              <option value="Wife">Wife</option>
              <option value="Husband">Husband</option>
            </select>
            <Button type="submit">Next Step</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <Typography element="h1">Wedding Details</Typography>
        <form
          onSubmit={handleWeddingInfoSubmit}
          className="space-y-6"
        >
          <FormInput
            label="Wedding Date"
            type="date"
            value={weddingInfo.date}
            onChange={(e) =>
              setWeddingInfo({ ...weddingInfo, date: e.target.value })
            }
          />
          <FormInput
            label="Estimated Number of Guests"
            type="number"
            value={weddingInfo.estimatedGuests}
            onChange={(e) =>
              setWeddingInfo({
                ...weddingInfo,
                estimatedGuests: Number(e.target.value),
              })
            }
          />
          <FormInput
            label="Estimated Budget"
            type="number"
            value={weddingInfo.estimatedBudget}
            onChange={(e) =>
              setWeddingInfo({
                ...weddingInfo,
                estimatedBudget: Number(e.target.value),
              })
            }
          />
          <div className="flex gap-4">
            <Button type="submit">Complete Setup</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                createWeddingMutation.mutate({ coupleInfo, weddingInfo })
              }
            >
              Skip for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
