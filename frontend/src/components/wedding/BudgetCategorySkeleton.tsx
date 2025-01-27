import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TaskSkeleton from "./TaskSkeleton";

const BudgetCategorySkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1.5">
          <Skeleton
            width={150}
            height={18}
            borderRadius={18}
          />
          <Skeleton
            width={60}
            height={18}
            borderRadius={18}
          />
        </div>
        <Skeleton
          circle
          width={24}
          height={24}
        />
      </div>

      <div className="py-1 mt-4">
        <div className="flex justify-between mb-1">
          <Skeleton width={40} />
          <Skeleton width={60} />
        </div>

        <Skeleton
          height={12}
          className="mb-6"
          borderRadius={12}
        />

        <div className="space-y-4">
          <TaskSkeleton />
        </div>
      </div>
    </div>
  );
};

export default BudgetCategorySkeleton;
