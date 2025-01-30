import { Typography } from "../ui/Typography";
import ProgressBar from "../ui/ProgressBar";
import { getBudgetProgress } from "../../utils/weddingCalculations";
import { Wedding } from "../../types/wedding";

interface BudgetOverviewProps {
  wedding: Wedding;
  onUpdateBudget: (total: number) => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  wedding,
  onUpdateBudget,
}) => {
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

  if (!wedding?.budget) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Typography element="h2">Budget overview</Typography>
      </div>
      <div className="bg-white p-6 rounded-3xl">
        <Typography
          element="h3"
          className="mb-4 flex justify-between"
        >
          <span className="font-medium tracking-normal font-sans text-dark-700 text-base md:text-lg">
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
    </div>
  );
};

export default BudgetOverview;
