import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import WeddingRings from "../assets/illustrations/wedding-rings-divider.svg?react";
import RadioButtonToggle from "../components/ui/RadioButtonToggle";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { BouncingBall } from "react-svg-spinners";
import { useOnboarding } from "../hooks/useOnboarding";

const Onboarding: React.FC = () => {
  const {
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
  } = useOnboarding();

  if (isLoading) {
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
        <div className="flex-1 w-full md:max-w-2xl lg:max-w-none px-6 py-10 lg:px-6 xl:px-8 2xl:px-12 lg:py-16 xl:py-20 2xl:py-32 space-y-6 lg:space-y-8 xl:space-y-12 2xl:space-y-16 flex flex-col items-center justify-center">
          <BouncingBall
            color="#000"
            width={44}
            height={44}
          />
        </div>
      </div>
    );
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
              disabled={updateProgressMutation.isPending}
              aria-busy={updateProgressMutation.isPending}
            >
              {updateProgressMutation.isPending ||
              updateProgressMutation.isSuccess ? (
                <BouncingBall
                  color="#fff"
                  width={24}
                  height={24}
                />
              ) : (
                <>
                  Continue <ArrowRightIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                </>
              )}
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
            disabled={
              createWeddingMutation.isPending || createWeddingMutation.isSuccess
            }
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
            disabled={
              createWeddingMutation.isPending || createWeddingMutation.isSuccess
            }
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
            disabled={
              createWeddingMutation.isPending || createWeddingMutation.isSuccess
            }
          />
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                createWeddingMutation.isPending ||
                createWeddingMutation.isSuccess
              }
              aria-busy={
                createWeddingMutation.isPending ||
                createWeddingMutation.isSuccess
              }
            >
              {createWeddingMutation.isPending ||
              createWeddingMutation.isSuccess ? (
                <BouncingBall
                  color="#fff"
                  width={24}
                  height={24}
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
