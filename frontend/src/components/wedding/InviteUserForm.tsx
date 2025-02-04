import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import FormSelect from "../ui/FormSelect";
import { GuestUser } from "../../types/wedding";
import {
  WeddingAccessLevel,
  WeddingPartyRoles,
  WeddingAccessLevelType,
  WeddingPartyRoleType,
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
    accessLevel: "guest" as WeddingAccessLevelType,
    partyRole: "Guest" as WeddingPartyRoleType,
    existingGuestId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingGuest = existingGuests?.find(
      (g) => g._id === formData.existingGuestId
    );
    await onSubmit({
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
        {existingGuests && existingGuests.length > 0 && (
          <FormSelect
            id="existingGuest"
            label="Select existing guest (optional)"
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
            <option value="">Add new user</option>
            {existingGuests.map((guest) => (
              <option
                key={guest._id}
                value={guest._id}
              >
                {guest.profile.firstName} {guest.profile.lastName}
              </option>
            ))}
          </FormSelect>
        )}

        {!formData.existingGuestId && (
          <>
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
            <FormInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <FormInput
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />

            <FormSelect
              id="accessLevel"
              label="Access Level"
              value={formData.accessLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accessLevel: e.target.value as WeddingAccessLevelType,
                })
              }
            >
              {Object.values(WeddingAccessLevel).map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level}
                </option>
              ))}
            </FormSelect>

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
        <Button type="submit">Invite user</Button>
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
