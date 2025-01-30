import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Typography } from "../ui/Typography";

const BudgetOverviewSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Typography element="h2">Budget overview</Typography>
      </div>
      <div className="bg-white p-6 rounded-3xl">
        {/* Total budget */}
        <div className="mb-3 flex justify-between">
          <Skeleton
            width={100}
            height={18}
          />
          <Skeleton
            width={120}
            height={18}
          />
        </div>

        {/* Progress bar */}
        <Skeleton
          height={16}
          className="mb-3"
          borderRadius={12}
        />

        {/* Spent and Remaining sections */}
        <div className="flex justify-between">
          <div>
            <Skeleton
              width={40}
              height={16}
              className="mb-1"
            />
            <Skeleton
              width={100}
              height={16}
            />
          </div>
          <div className="text-right">
            <Skeleton
              width={70}
              height={16}
              className="mb-1"
            />
            <Skeleton
              width={100}
              height={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewSkeleton;
