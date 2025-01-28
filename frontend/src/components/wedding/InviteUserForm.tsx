import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import FormSelect from "../ui/FormSelect";

interface InviteUserFormProps {
  onSubmit: (data: {
    email: string;
    role: "couple" | "guest";
    weddingRole:
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Parent"
      | "Other";
  }) => Promise<void>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  onSubmit,
  onCancel,
  isError,
  error,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    role: "guest" as "couple" | "guest",
    weddingRole: "Other" as
      | "Maid of Honor"
      | "Best Man"
      | "Bridesmaid"
      | "Groomsman"
      | "Parent"
      | "Other",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-4">
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div>
          <FormSelect
            id="weddingRole"
            label="Role in wedding"
            value={formData.weddingRole}
            onChange={(e) =>
              setFormData({
                ...formData,
                weddingRole: e.target.value as typeof formData.weddingRole,
                role: ["Maid of Honor", "Best Man"].includes(e.target.value)
                  ? "guest"
                  : formData.role,
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
        </div>

        {isError && error && (
          <Typography
            element="p"
            className="text-red-600"
          >
            {error.message}
          </Typography>
        )}
      </div>

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
