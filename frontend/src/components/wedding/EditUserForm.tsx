import { useState } from "react";
import { Button } from "../ui/Button";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { CoupleUser, GuestUser } from "../../types/wedding";

interface EditUserFormProps {
  user: CoupleUser | GuestUser;
  onSubmit: (data: {
    userId: string;
    userData: {
      email?: string;
      weddingRole?: string;
      firstName?: string;
      lastName?: string;
    };
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isError,
  error,
}) => {
  const [formData, setFormData] = useState({
    firstName: user.profile?.firstName || "",
    lastName: user.profile?.lastName || "",
    email: user.email || "",
    weddingRole:
      "guestDetails" in user
        ? user.guestDetails[0]?.weddingRole || "Guest"
        : "Couple",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      userId: user._id,
      userData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        weddingRole: formData.weddingRole,
      },
    });
  };

  const roleOptions = [
    { value: "Maid of Honor", label: "Maid of Honor" },
    { value: "Best Man", label: "Best Man" },
    { value: "Bridesmaid", label: "Bridesmaid" },
    { value: "Groomsman", label: "Groomsman" },
    { value: "Parent", label: "Parent" },
    { value: "Other", label: "Other" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <FormInput
        id="firstName"
        name="firstName"
        label="First name"
        value={formData.firstName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, firstName: e.target.value }))
        }
        required
      />

      <FormInput
        id="lastName"
        name="lastName"
        label="Last name"
        value={formData.lastName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, lastName: e.target.value }))
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
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
      />

      {"guestDetails" in user && (
        <FormSelect
          id="role"
          name="role"
          label="Role"
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value }))
          }
        >
          {roleOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </FormSelect>
      )}

      {isError && error && (
        <p className="text-red-600 text-sm">{error.message}</p>
      )}

      <div className="flex flex-col justify-end gap-3 pt-4">
        <Button type="submit">Save changes</Button>
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

export default EditUserForm;
