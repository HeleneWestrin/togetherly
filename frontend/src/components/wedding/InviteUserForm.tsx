import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BouncingBall } from "react-svg-spinners";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import FormSelect from "../ui/FormSelect";
import { GuestUser } from "../../types/wedding";
import {
  WeddingAccessLevelType,
  WeddingPartyRoleType,
  WeddingPartyRoles,
} from "../../types/constants";

interface InviteUserFormProps {
  onSubmit: (data: {
    email: string;
    firstName: string;
    lastName: string;
    accessLevel: WeddingAccessLevelType;
    partyRole: WeddingPartyRoleType;
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
  existingGuests?: GuestUser[];
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  onSubmit,
  onCancel,
  isError,
  error,
  existingGuests,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    accessLevel: "weddingAdmin" as WeddingAccessLevelType,
    partyRole: "Guest" as WeddingPartyRoleType,
    existingGuestId: "",
  });

  // Use React Query's useMutation instead of managing a local isLoading state
  const mutation = useMutation({
    mutationFn: (data: {
      email: string;
      firstName: string;
      lastName: string;
      accessLevel: WeddingAccessLevelType;
      partyRole: WeddingPartyRoleType;
    }) => onSubmit(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingGuest = existingGuests?.find(
      (g) => g._id === formData.existingGuestId
    );
    mutation.mutate({
      email: existingGuest?.email || formData.email,
      firstName: existingGuest?.profile.firstName || formData.firstName,
      lastName: existingGuest?.profile.lastName || formData.lastName,
      accessLevel: formData.accessLevel,
      partyRole: existingGuest
        ? existingGuest.weddings[0]?.guestDetails?.partyRole || "Guest"
        : formData.partyRole,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-4">
        {existingGuests &&
          existingGuests.length > 0 &&
          existingGuests.some(
            (guest) => guest.weddings[0]?.accessLevel !== "weddingAdmin"
          ) && (
            <>
              <FormSelect
                id="existingGuest"
                label="Add existing guest"
                value={formData.existingGuestId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    existingGuestId: e.target.value,
                    email: e.target.value ? "" : formData.email,
                    accessLevel: e.target.value ? "weddingAdmin" : "guest",
                  })
                }
              >
                <option value="">Select guest</option>
                {existingGuests
                  .filter(
                    (guest) => guest.weddings[0]?.accessLevel !== "weddingAdmin"
                  )
                  .map((guest) => (
                    <option
                      key={guest._id}
                      value={guest._id}
                    >
                      {guest.profile.firstName} {guest.profile.lastName}
                    </option>
                  ))}
              </FormSelect>
              {!formData.existingGuestId && (
                <div className="relative flex my-8 items-center justify-center">
                  <hr className="h-0.5 grow" />
                  <span className="w-12 shrink-0 text-center text-compact-bold text-dark-800">
                    or
                  </span>
                  <hr className="h-0.5 grow" />
                </div>
              )}
            </>
          )}

        {!formData.existingGuestId && (
          <>
            <FormInput
              id="firstName"
              name="firstName"
              label="First name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <FormInput
              id="lastName"
              name="lastName"
              label="Last name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
            <FormInput
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <FormSelect
              id="partyRole"
              label="Role in wedding"
              value={formData.partyRole}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  partyRole: e.target.value as WeddingPartyRoleType,
                })
              }
            >
              {Object.values(WeddingPartyRoles).map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </FormSelect>
          </>
        )}
      </div>

      {isError && error && (
        <Typography
          element="p"
          className="text-red-600"
        >
          {error.message}
        </Typography>
      )}

      <div className="flex flex-col justify-end gap-3">
        <Button
          type="submit"
          disabled={mutation.isPending || mutation.isSuccess}
        >
          {mutation.isPending || mutation.isSuccess ? (
            <BouncingBall
              color="#fff"
              width={24}
              height={24}
            />
          ) : (
            "Add wedding admin"
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InviteUserForm;
