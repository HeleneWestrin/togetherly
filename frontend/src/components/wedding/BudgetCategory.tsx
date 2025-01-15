import { Typography } from "../ui/Typography";
import { ITask } from "../../types/wedding";
import Button from "../ui/Button";
import FormLabel from "../ui/FormLabel";

interface BudgetCategoryProps {
  category: string;
  tasks: ITask[];
  progress: number;
  estimatedCost: number;
  spent: number;
  onAddTask: (category: string) => void;
  onEditTask: (taskId: string) => void;
}

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
      <div className="flex items-center justify-between mb-4">
        <Typography element="h3">{category}</Typography>
        <div className="bg-yellow-100 px-3 py-1 rounded-full">
          <Typography element="span">{progress}% done</Typography>
        </div>
      </div>

      <Typography
        element="p"
        className="text-gray-600 mb-2"
      >
        Tasks: {tasks.filter((t) => t.completed).length} of {tasks.length} done
      </Typography>

      <div className="w-full bg-pink-300 rounded-full h-2 mb-4">
        <div
          className="bg-pink-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Typography
        element="p"
        className="text-gray-600 mb-4"
      >
        {spent.toLocaleString()} kr / {estimatedCost.toLocaleString()} kr
      </Typography>

      <div className="space-y-3">
        {tasks.map((task) => {
          return (
            <div
              key={task._id}
              className="flex items-center justify-between bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
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
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => onAddTask(category)}
      >
        Add new task
      </Button>
    </div>
  );
};

export default BudgetCategory;
