import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import RadioButtonToggle from "../ui/RadioButtonToggle";

interface AddGuestFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email?: string;
    relationship: "wife" | "husband" | "both";
    rsvpStatus: "pending" | "confirmed" | "declined";
    dietaryPreferences?: string;
    trivia?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const AddGuestForm: React.FC<AddGuestFormProps> = ({
  onSubmit,
  onCancel,
  isError = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    relationship: "wife" as "wife" | "husband" | "both",
    rsvpStatus: "pending" as "pending" | "confirmed" | "declined",
    dietaryPreferences: "",
    trivia: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {isError && (
        <Typography
          element="p"
          className="text-red-600"
        >
          {error instanceof Error ? error.message : "Failed to add guest"}
        </Typography>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="firstName"
          name="firstName"
          label="First name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
          error={validationErrors.firstName}
          autoFocus
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
          error={validationErrors.lastName}
        />
      </div>

      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email (optional)"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={validationErrors.email}
      />

      <RadioButtonToggle
        name="relationship"
        legend="Relationship to couple"
        srOnly={false}
        options={["Wife", "Husband", "Both"]}
        value={
          formData.relationship.charAt(0).toUpperCase() +
          formData.relationship.slice(1)
        }
        onChange={(value) =>
          setFormData({
            ...formData,
            relationship: value.toLowerCase() as "wife" | "husband" | "both",
          })
        }
      />

      <RadioButtonToggle
        name="rsvpStatus"
        legend="RSVP Status"
        srOnly={false}
        options={["Pending", "Confirmed", "Declined"]}
        value={
          formData.rsvpStatus.charAt(0).toUpperCase() +
          formData.rsvpStatus.slice(1)
        }
        onChange={(value) =>
          setFormData({
            ...formData,
            rsvpStatus: value.toLowerCase() as
              | "pending"
              | "confirmed"
              | "declined",
          })
        }
      />

      <FormInput
        id="dietaryPreferences"
        name="dietaryPreferences"
        label="Dietary preferences (optional)"
        value={formData.dietaryPreferences}
        onChange={(e) =>
          setFormData({ ...formData, dietaryPreferences: e.target.value })
        }
      />

      <FormInput
        id="trivia"
        name="trivia"
        label="Trivia (optional)"
        value={formData.trivia}
        onChange={(e) => setFormData({ ...formData, trivia: e.target.value })}
        type="textarea"
      />

      <div className="flex flex-col gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding guest..." : "Add guest"}
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
