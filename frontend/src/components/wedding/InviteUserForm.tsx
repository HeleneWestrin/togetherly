import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import FormSelect from "../ui/FormSelect";
import { GuestUser } from "../../types/wedding";

interface InviteUserFormProps {
  onSubmit: (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: "weddingAdmin" | "couple" | "guest";
    weddingRole:
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Parent"
      | "Other"
      | "Guest";
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
    role: "weddingAdmin" as "weddingAdmin" | "couple" | "guest",
    weddingRole: "Guest" as
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Parent"
      | "Other"
      | "Guest",
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
      role: formData.role,
      weddingRole: existingGuest
        ? (existingGuest.guestDetails[0]?.weddingRole === "Flower girl" ||
          existingGuest.guestDetails[0]?.weddingRole === "Ring bearer" ||
          existingGuest.guestDetails[0]?.weddingRole === "Family"
            ? "Other"
            : existingGuest.guestDetails[0]?.weddingRole) || "Other"
        : formData.weddingRole,
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
              id="weddingRole"
              label="Role in wedding"
              value={formData.weddingRole}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weddingRole: e.target.value as typeof formData.weddingRole,
                })
              }
            >
              <option value="Maid of Honor">Maid of Honor</option>
              <option value="Best Man">Best Man</option>
              <option value="Bridesmaid">Bridesmaid</option>
              <option value="Groomsman">Groomsman</option>
              <option value="Parent">Parent</option>
              <option value="Other">Other</option>
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
