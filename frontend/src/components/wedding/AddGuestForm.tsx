import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import RadioButtonToggle from "../ui/RadioButtonToggle";
import { GuestUser } from "../../types/wedding";
import FormLabel from "../ui/FormLabel";
import {
  RSVPStatus,
  WeddingPartyRoles,
  WeddingPartyRoleType,
  RSVPStatusType,
} from "../../types/constants";

interface Couple {
  _id: string;
  profile: {
    firstName: string;
    lastName?: string;
  };
}

interface AddGuestFormProps {
  guest?: GuestUser;
  couple: Couple[];
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email?: string;
    connection: {
      partnerIds: string[];
    };
    rsvpStatus: RSVPStatusType;
    dietaryPreferences?: string;
    partyRole: WeddingPartyRoleType;
    trivia?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const AddGuestForm: React.FC<AddGuestFormProps> = ({
  guest,
  couple,
  onSubmit,
  onCancel,
  isError,
  error,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  if (!couple?.length) {
    return <div>Error: No couple information available</div>;
  }

  // Use the first partner's _id as default
  const defaultPartnerId = couple[0]._id;
  const existingPartnerIds =
    guest?.weddings?.[0]?.guestDetails?.connection?.partnerIds;

  const [formData, setFormData] = useState({
    firstName: guest?.profile?.firstName || "",
    lastName: guest?.profile?.lastName || "",
    email: guest?.email || "",
    connection: {
      partnerIds: existingPartnerIds || [defaultPartnerId],
    },
    rsvpStatus:
      guest?.weddings?.[0]?.guestDetails?.rsvpStatus || RSVPStatus.PENDING,
    dietaryPreferences:
      guest?.weddings?.[0]?.guestDetails?.dietaryPreferences || "",
    partyRole:
      guest?.weddings?.[0]?.guestDetails?.partyRole || WeddingPartyRoles.GUEST,
    trivia: guest?.weddings?.[0]?.guestDetails?.trivia || "",
  });

  const submitButtonText = guest ? "Save changes" : "Add guest";
  const loadingText = guest ? "Saving changes..." : "Adding guest...";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.connection.partnerIds.length) {
      setFormError("Please select a side for the guest");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-4">
        <FormInput
          id="firstName"
          label="First name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <FormInput
          id="lastName"
          label="Last name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <FormInput
          id="email"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />

        <div>
          <FormLabel
            htmlFor="partyRole"
            className="mb-2"
            required
          >
            Role
          </FormLabel>
          <select
            id="partyRole"
            name="partyRole"
            value={formData.partyRole}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-dark-500 px-3 py-4"
            required
          >
            {Object.values(WeddingPartyRoles).map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Typography
            element="p"
            styledAs="label"
            className="mb-2"
          >
            Side <span className="text-red-600">*</span>
          </Typography>
          <RadioButtonToggle
            name="connection.partnerIds"
            options={[
              {
                label: `${couple[0].profile.firstName}'s`,
                value: couple[0]._id,
              },
              {
                label: `${couple[1].profile.firstName}'s`,
                value: couple[1]._id,
              },
              {
                label: "Mutual",
                value: `${couple[0]._id},${couple[1]._id}`,
              },
            ]}
            value={formData.connection.partnerIds.join(",")}
            onChange={(value: string) => {
              const ids = value.split(",").filter(Boolean);
              if (ids.length === 0) return; // Prevent empty selection
              setFormData((prev) => ({
                ...prev,
                connection: {
                  partnerIds: ids,
                },
              }));
            }}
          />
        </div>

        <div>
          <Typography
            element="p"
            styledAs="label"
            className="mb-2"
          >
            RSVP status
          </Typography>
          <RadioButtonToggle
            name="rsvpStatus"
            options={[
              { label: "Pending", value: "pending" },
              { label: "Attending", value: "confirmed" },
              { label: "Not Coming", value: "declined" },
            ]}
            value={formData.rsvpStatus}
            onChange={(value: "pending" | "confirmed" | "declined") =>
              setFormData((prev) => ({ ...prev, rsvpStatus: value }))
            }
          />
        </div>

        <div>
          <FormInput
            type="text"
            id="dietaryPreferences"
            label="Dietary preferences"
            name="dietaryPreferences"
            value={formData.dietaryPreferences}
            onChange={handleChange}
            placeholder="e.g., Vegetarian, allergic to nuts, etc."
          />
        </div>
      </div>

      {isError && error && (
        <div className="rounded-md bg-red-50 p-4">
          <Typography
            element="p"
            className="text-red-700"
          >
            {error.message}
          </Typography>
        </div>
      )}

      <div className="flex flex-col justify-end gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? loadingText : submitButtonText}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddGuestForm;
