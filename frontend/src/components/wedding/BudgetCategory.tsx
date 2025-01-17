import { Typography } from "../ui/Typography";
import { ITask } from "../../types/wedding";
import Button from "../ui/Button";
import FormLabel from "../ui/FormLabel";
import { Plus } from "lucide-react";

interface BudgetCategoryProps {
  category: string;
  tasks: ITask[];
  progress: number;
  estimatedCost: number;
  spent: number;
  onAddTask: (category: string) => void;
  onEditTask: (taskId: string) => void;
}

const getProgressColor = (progress: number): string => {
  if (progress === 0) return "bg-blue-300";
  if (progress === 100) return "bg-green-300";
  return "bg-yellow-300";
};

const BudgetCategory: React.FC<BudgetCategoryProps> = ({
  category,
  tasks = [],
  progress,
  estimatedCost,
  spent,
  onAddTask,
  onEditTask,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex flex-col items-start gap-1 mb-4">
        <Typography element="h3">{category}</Typography>
        <div
          className={`${getProgressColor(progress)} px-2 pb-0.5 rounded-full`}
        >
          <Typography
            element="span"
            styledAs="bodyExtraSmall"
            className="font-semibold"
          >
            {tasks.length === 0 ? "No tasks yet" : `${progress}% done`}
          </Typography>
        </div>
      </div>

      <Typography
        element="p"
        styledAs="bodySmall"
        className="flex justify-between mb-2"
      >
        <span className="text-dark-850 font-bold">Tasks:</span>
        <span className="text-dark-600">
          {tasks.length === 0
            ? "0 tasks"
            : `${tasks.filter((t) => t.completed).length} of ${
                tasks.length
              } done`}
        </span>
      </Typography>

      <div className="w-full bg-pink-300 rounded-full h-3 mb-2">
        <div
          className="bg-pink-600 h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Typography
        element="p"
        styledAs="bodySmall"
        className="text-dark-600 mb-5"
      >
        {tasks.length === 0
          ? ""
          : `${spent.toLocaleString()} kr / ${estimatedCost.toLocaleString()} kr`}
      </Typography>

      <div className="space-y-3">
        {tasks.map((task) => {
          return (
            <div
              key={task._id}
              className="flex items-center justify-between bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  title={task.title}
                  id={task.title}
                  checked={task.completed}
                  className="w-6 h-6 accent-pink-600"
                  onChange={() => onEditTask(task._id)}
                />
                <div className="flex flex-col">
                  <FormLabel
                    htmlFor={task.title}
                    className="mb-0"
                  >
                    {task.title}
                  </FormLabel>
                  <Typography
                    element="p"
                    styledAs="bodyExtraSmall"
                    className="text-dark-600"
                  >
                    {task.actualCost.toLocaleString()} kr /{" "}
                    {task.budget.toLocaleString()} kr
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="inline"
        className="mt-4"
        onClick={() => onAddTask(category)}
      >
        <Plus /> Add new task <span className="sr-only">for {category}</span>
      </Button>
    </div>
  );
};

export default BudgetCategory;
