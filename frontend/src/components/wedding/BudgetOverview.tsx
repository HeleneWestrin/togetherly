import { useState, useEffect } from "react";
import { Typography } from "../ui/Typography";
import ProgressBar from "../ui/ProgressBar";
import { Button } from "../ui/Button";
import { Edit2 } from "lucide-react";
import SidePanel from "../ui/SidePanel";
import FormInput from "../ui/FormInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../services/axiosService";
import { useUIStore } from "../../stores/useUIStore";
import { getBudgetProgress } from "../../utils/weddingCalculations";
import { Wedding } from "../../types/wedding";
interface BudgetOverviewProps {
  wedding: Wedding;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ wedding }) => {
  const { activePanels, openPanel, closePanel } = useUIStore();
  const [newBudget, setNewBudget] = useState(wedding?.budget?.total || 0);
  const [error, setError] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (wedding?.budget?.total) {
      setNewBudget(wedding.budget.total);
    }
  }, [wedding?.budget?.total]);

  const updateBudgetMutation = useMutation({
    mutationFn: async (total: number) => {
      const response = await axiosInstance.patch(
        `/api/weddings/${wedding?._id}/budget`,
        {
          total,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding"] });
      closePanel("editBudget");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const progress = getBudgetProgress(wedding);
  const remaining = wedding.budget
    ? wedding.budget.total - wedding.budget.spent
    : 0;

  // Calculate total estimated costs from all categories
  const totalEstimatedCost =
    wedding?.budget?.allocated?.reduce(
      (sum, category) => sum + category.estimatedCost,
      0
    ) ?? 0;

  // Check warning conditions
  const isOverSpent = remaining < 0;
  const isOverEstimatedBudget =
    totalEstimatedCost > (wedding?.budget?.total ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget < 0) {
      setError("Budget cannot be negative");
      return;
    }
    updateBudgetMutation.mutate(newBudget);
  };

  const handleOpenPanel = () => openPanel("editBudget");
  const handleClosePanel = () => closePanel("editBudget");

  if (!wedding?.budget) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Typography element="h2">Budget overview</Typography>
        <Button
          variant="ghost"
          size="small"
          onClick={handleOpenPanel}
        >
          <Edit2 className="h-4 w-4" />
          Edit budget
        </Button>
      </div>
      <div className="bg-white p-6 rounded-3xl">
        <Typography
          element="h3"
          className="mb-4 flex justify-between"
        >
          <span className="font-semibold font-sans text-dark-600 text-base md:text-lg">
            Total budget:
          </span>{" "}
          <span>{wedding.budget.total.toLocaleString()} kr</span>
        </Typography>

        <ProgressBar
          progress={progress}
          height="medium"
          className="mb-4"
        />

        <div className="flex justify-between">
          <div>
            <Typography
              element="p"
              styledAs="bodySmall"
              className="text-dark-600"
            >
              Spent
            </Typography>
            <Typography
              element="p"
              className="font-semibold"
            >
              {wedding.budget.spent.toLocaleString()} kr
            </Typography>
          </div>
          <div className="text-right">
            <Typography
              element="p"
              styledAs="bodySmall"
              className="text-dark-600"
            >
              {remaining >= 0 ? "Remaining" : "Over budget"}
            </Typography>
            <Typography
              element="p"
              className="font-semibold"
            >
              {remaining >= 0
                ? remaining.toLocaleString()
                : (remaining * -1).toLocaleString()}{" "}
              kr
            </Typography>
          </div>
        </div>

        {/* Warning Messages */}
        {(isOverSpent || isOverEstimatedBudget) && (
          <div className="mt-4 pt-4 border-t border-dark-200 space-y-2">
            {isOverSpent && (
              <Typography
                element="p"
                styledAs="bodySmall"
                className="text-dark-700"
              >
                <span className="text-red-700 font-bold">Uh oh!</span> You have
                exceeded your total budget by{" "}
                {Math.abs(remaining).toLocaleString()} kr. You can increase your
                total budget or adjust the estimated cost on the remaining
                tasks.
              </Typography>
            )}

            {!isOverSpent && isOverEstimatedBudget && (
              <Typography
                element="p"
                styledAs="bodySmall"
                className="text-dark-700"
              >
                <span className="text-red-700 font-bold">Heads up!</span> Your
                estimated costs are{" "}
                {(totalEstimatedCost - wedding.budget.total).toLocaleString()}{" "}
                kr over your total budget. Update your total budget or adjust
                your estimated costs by editing your tasks.
              </Typography>
            )}
          </div>
        )}
      </div>

      <SidePanel
        isOpen={activePanels.editBudget || false}
        onClose={handleClosePanel}
        title="Update total budget"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <Typography
              element="p"
              className="text-red-600"
            >
              {error}
            </Typography>
          )}

          <FormInput
            id="budget"
            isCurrency={true}
            currencySuffix=" kr"
            name="budget"
            type="text"
            inputMode="numeric"
            label="Total budget"
            value={newBudget}
            onChange={(e) => setNewBudget(Number(e.target.value))}
            required
            autoFocus
          />

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? "Updating..." : "Update budget"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClosePanel}
              disabled={updateBudgetMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SidePanel>
    </div>
  );
};

export default BudgetOverview;
