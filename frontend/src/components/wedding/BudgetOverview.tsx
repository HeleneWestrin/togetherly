import { Typography } from "../ui/Typography";
import ProgressBar from "../ui/ProgressBar";
import { getBudgetProgress } from "../../utils/weddingCalculations";
import { BudgetCategory } from "../../types/wedding";

interface BudgetOverviewProps {
  budget: {
    total: number;
    spent: number;
    budgetCategories: BudgetCategory[];
  };
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  // Calculate the overall budget progress percentage
  const progress = getBudgetProgress(budget);

  // Calculate remaining budget (can be negative if overspent)
  const remaining = budget.total - budget.spent;

  // Sum up all estimated costs across all categories
  const totalEstimatedCost =
    budget.budgetCategories?.reduce(
      (sum, category) => sum + category.estimatedCost,
      0
    ) ?? 0;

  // Determine warning states for budget alerts
  const isOverSpent = remaining < 0;
  const isOverEstimatedBudget = totalEstimatedCost > budget.total;

  // Early return if no budget data is available
  if (!budget) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <Typography element="h2">Budget overview</Typography>
      </div>

      {/* Main budget card */}
      <div className="bg-white p-6 rounded-3xl">
        {/* Total budget display */}
        <Typography
          element="h3"
          className="mb-4 flex justify-between"
        >
          <span className="font-medium tracking-normal font-sans text-dark-700 text-base md:text-lg">
            Total budget:
          </span>{" "}
          <span>{budget.total.toLocaleString()} kr</span>
        </Typography>

        {/* Visual progress indicator */}
        <ProgressBar
          progress={progress}
          height="medium"
          className="mb-4"
        />

        {/* Budget statistics */}
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
              {budget.spent.toLocaleString()} kr
            </Typography>
          </div>

          {/* Remaining budget or overspent amount */}
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

        {/* Warning Messages Section */}
        {(isOverSpent || isOverEstimatedBudget) && (
          <div className="mt-4 pt-4 border-t border-dark-200 space-y-2">
            {/* Display when actual spending exceeds budget */}
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

            {/* Display when estimated costs exceed budget but not yet overspent */}
            {!isOverSpent && isOverEstimatedBudget && (
              <Typography
                element="p"
                styledAs="bodySmall"
                className="text-dark-700"
              >
                <span className="text-red-700 font-bold">Heads up!</span> Your
                estimated costs are{" "}
                {(totalEstimatedCost - budget.total).toLocaleString()} kr over
                your total budget. Update your total budget or adjust your
                estimated costs by editing your tasks.
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;
