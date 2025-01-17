import { Typography } from "../ui/Typography";
import { ITask } from "../../types/wedding";
import Button from "../ui/Button";
import { Plus, ChevronDown } from "lucide-react";
import Badge, { BadgeProps } from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import TaskItem from "./TaskItem";
import { useState } from "react";

interface BudgetCategoryProps {
  category: string;
  tasks: ITask[];
  progress: number;
  estimatedCost: number;
  spent: number;
  onAddTask: (category: string) => void;
  onEditTask: (taskId: string) => void;
}

const getProgressColor = (progress: number): BadgeProps["color"] => {
  if (progress === 0) return "blue";
  if (progress === 100) return "green";
  return "yellow";
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
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      aria-live="polite"
      className="bg-white p-6 rounded-3xl"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
        aria-expanded={isExpanded}
        aria-controls={`category-content-${category}`}
      >
        <div className="flex flex-col items-start gap-1">
          <Typography element="h3">{category}</Typography>
          <Badge color={getProgressColor(progress)}>
            {tasks.length === 0 ? "No tasks yet" : `${progress}% done`}
          </Badge>
        </div>
        <ChevronDown
          className={`transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`category-content-${category}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="overflow-hidden">
          <div className="py-1 mt-4">
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

            <ProgressBar
              progress={progress}
              className="mb-2"
            />

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
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEditTask={onEditTask}
                  tabIndex={isExpanded ? 0 : -1}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="inline"
              className="mt-4"
              onClick={() => onAddTask(category)}
              tabIndex={isExpanded ? 0 : -1}
            >
              <Plus /> Add new task{" "}
              <span className="sr-only">for {category}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCategory;
