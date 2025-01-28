import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import RadioButtonToggle from "../ui/RadioButtonToggle";
import { GuestUser } from "../../types/wedding";
import FormLabel from "../ui/FormLabel";

interface AddGuestFormProps {
  guest?: GuestUser;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email?: string;
    relationship: "wife" | "husband" | "both";
    rsvpStatus: "pending" | "confirmed" | "declined";
    dietaryPreferences?: string;
    weddingRole:
      | "Guest"
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Flower girl"
      | "Ring bearer"
      | "Parent"
      | "Family"
      | "Other";
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const AddGuestForm: React.FC<AddGuestFormProps> = ({
  guest,
  onSubmit,
  onCancel,
  isError,
  error,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: guest?.profile.firstName || "",
    lastName: guest?.profile.lastName || "",
    email: guest?.email || "",
    relationship: guest?.guestDetails[0]?.relationship || "wife",
    rsvpStatus: guest?.guestDetails[0]?.rsvpStatus || "pending",
    dietaryPreferences: guest?.guestDetails[0]?.dietaryPreferences || "",
    weddingRole: guest?.guestDetails[0]?.weddingRole || "Guest",
  });

  const submitButtonText = guest ? "Save changes" : "Add guest";
  const loadingText = guest ? "Saving changes..." : "Adding guest...";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            htmlFor="weddingRole"
            className="mb-2"
            required
          >
            Role
          </FormLabel>
          <select
            id="weddingRole"
            name="weddingRole"
            value={formData.weddingRole}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-dark-500 px-3 py-4"
            required
          >
            <option value="Guest">Guest</option>
            <option value="Maid of Honor">Maid of Honor</option>
            <option value="Best Man">Best Man</option>
            <option value="Bridesmaid">Bridesmaid</option>
            <option value="Groomsman">Groomsman</option>
            <option value="Flower girl">Flower girl</option>
            <option value="Ring bearer">Ring bearer</option>
            <option value="Parent">Parent</option>
            <option value="Family">Family</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <Typography
            element="p"
            styledAs="label"
            className="mb-2"
          >
            Side
          </Typography>
          <RadioButtonToggle
            name="relationship"
            options={[
              { label: "Bride", value: "wife" },
              { label: "Groom", value: "husband" },
              { label: "Both", value: "both" },
            ]}
            value={formData.relationship}
            onChange={(value: "wife" | "husband" | "both") =>
              setFormData((prev) => ({ ...prev, relationship: value }))
            }
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
