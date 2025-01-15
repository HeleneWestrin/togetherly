import { Typography } from "../ui/Typography";

interface BudgetProps {
  budget: {
    total: number;
    spent: number;
  };
}

const BudgetOverview: React.FC<BudgetProps> = ({ budget }) => {
  const remaining = budget.total - budget.spent;
  const progress = (budget.spent / budget.total) * 100;

  return (
    <div className="flex flex-col gap-4">
      <Typography element="h2">Budget overview</Typography>
      <div className="bg-white p-6 rounded-xl">
        <Typography
          element="h3"
          className="mb-4 flex justify-between"
        >
          <span className="font-semibold font-sans text-dark-600 text-base md:text-lg">
            Total budget:
          </span>{" "}
          <span>{budget.total.toLocaleString()} kr</span>
        </Typography>

        <div className="w-full bg-pink-300 rounded-full h-3 mb-4">
          <div
            className="bg-pink-600 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <Typography
              element="p"
              className="text-gray-600"
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
          <div className="text-right">
            <Typography
              element="p"
              className="text-gray-600"
            >
              Remaining
            </Typography>
            <Typography
              element="p"
              className="font-semibold"
            >
              {remaining.toLocaleString()} kr
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
