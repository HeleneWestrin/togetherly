import Skeleton from "react-loading-skeleton";

const TaskSkeleton = () => {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton
          width={28}
          height={28}
        />
        <div>
          <Skeleton
            width={140}
            height={18}
            className="mb-1"
          />
          <Skeleton
            width={80}
            height={14}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton
          width={32}
          height={32}
          circle
        />
        <Skeleton
          width={32}
          height={32}
          circle
        />
      </div>
    </div>
  );
};

export default TaskSkeleton;
