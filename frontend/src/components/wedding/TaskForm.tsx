import { useState } from "react";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
import { CreateTaskData, TaskResponse, Task } from "../../types/wedding";
import { BouncingBall } from "react-svg-spinners";

interface TaskFormProps {
  task?: Task;
  budgetItemId: string;
  weddingId: string;
  onSubmit: (data: CreateTaskData) => Promise<TaskResponse>;
  onCancel: () => void;
  isError?: boolean;
  error?: Error | null;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  budgetItemId,
  weddingId,
  onSubmit,
  onCancel,
  isError = false,
  error = null,
}) => {
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formatted = date.toISOString().split("T")[0];
    return formatted;
  };

  const [formData, setFormData] = useState({
    title: task?.title ?? "",
    budget: task?.budget ?? 0,
    actualCost: task?.actualCost ?? 0,
    dueDate: formatDateForInput(task?.dueDate),
    budgetItem: budgetItemId,
    weddingId: weddingId,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!task;
  const submitButtonText = isEditing ? "Update task" : "Create task";
  const loadingText = (
    <BouncingBall
      color="#fff"
      width={24}
      height={24}
    />
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Task name is required";
    if (formData.budget < 0) errors.budget = "Budget cannot be negative";
    if (formData.actualCost < 0)
      errors.actualCost = "Actual cost cannot be negative";

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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {isError && (
          <Typography
            element="p"
            className="text-red-600 mb-4"
          >
            {error instanceof Error ? error.message : "Failed to save task"}
          </Typography>
        )}

        <FormInput
          id="title"
          name="title"
          label="Task name"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          error={validationErrors.title}
        />

        <FormInput
          id="budget"
          isCurrency={true}
          currencySuffix=" kr"
          name="budget"
          numericType="tel"
          inputMode="numeric"
          label="Estimated cost"
          value={formData.budget}
          onChange={(e) =>
            setFormData({ ...formData, budget: Number(e.target.value) })
          }
          required
          error={validationErrors.budget}
        />

        <FormInput
          id="actualCost"
          name="actualCost"
          isCurrency={true}
          currencySuffix=" kr"
          numericType="tel"
          inputMode="numeric"
          label="Actual cost"
          value={formData.actualCost}
          onChange={(e) =>
            setFormData({ ...formData, actualCost: Number(e.target.value) })
          }
          error={validationErrors.actualCost}
        />

        <FormInput
          id="dueDate"
          className="w-full"
          name="dueDate"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          max="2100-12-31"
          label="Due date"
          value={formData.dueDate}
          onChange={(e) => {
            const inputDate = e.target.value;
            // Allow empty value or validate YYYY-MM-DD format
            if (inputDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
              setFormData({ ...formData, dueDate: inputDate });
            }
          }}
          error={validationErrors.dueDate}
        />

        <div className="flex flex-col gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? loadingText : submitButtonText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
