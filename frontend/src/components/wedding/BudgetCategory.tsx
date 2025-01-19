import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITask, CreateTaskData, TaskResponse } from "../../types/wedding";
import { createTask } from "../../services/taskService";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import Badge, { BadgeProps } from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import SidePanel from "../ui/SidePanel";
import { Plus, ChevronDown } from "lucide-react";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

interface BudgetCategoryProps {
  category: string;
  tasks: ITask[];
  progress: number;
  estimatedCost: number;
  spent: number;
  onAddTask?: (
    category: string,
    taskData: {
      title: string;
      budget: number;
      actualCost: number;
      dueDate: string;
    }
  ) => void;
  onEditTask: (taskId: string) => void;
  budgetItemId: string;
  weddingId: string;
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
  onEditTask,
  budgetItemId,
  weddingId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddTaskPanelOpen, setIsAddTaskPanelOpen] = useState(false);
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation<
    TaskResponse,
    Error,
    CreateTaskData,
    unknown
  >({
    mutationFn: async (data: CreateTaskData): Promise<TaskResponse> => {
      return createTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding"] });
      setIsAddTaskPanelOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  return (
    <div
      aria-live="polite"
      className="bg-white p-6 rounded-3xl"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-controls={`category-content-${category}`}
      >
        <div className="flex flex-col items-start gap-1.5">
          <Typography
            element="h3"
            className="!leading-none"
          >
            {category}
          </Typography>
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
                : `${spent.toLocaleString()} kr spent out of ${estimatedCost.toLocaleString()} kr`}
            </Typography>

            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEditTask={onEditTask}
                  tabIndex={isExpanded ? 0 : -1}
                  budgetItemId={budgetItemId}
                  weddingId={weddingId}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="inline"
              className="mt-4"
              onClick={() => setIsAddTaskPanelOpen(true)}
              tabIndex={isExpanded ? 0 : -1}
              aria-expanded={isAddTaskPanelOpen}
              aria-controls="add-task-panel"
              aria-haspopup="dialog"
            >
              <Plus aria-hidden="true" />
              Add new task
              <span className="sr-only">for {category}</span>
            </Button>
          </div>
        </div>
      </div>

      <SidePanel
        isOpen={isAddTaskPanelOpen}
        onClose={() => setIsAddTaskPanelOpen(false)}
        title={`Add task to ${category}`}
      >
        <TaskForm
          category={category}
          budgetItemId={budgetItemId}
          weddingId={weddingId}
          onSubmit={createTaskMutation.mutateAsync}
          onCancel={() => setIsAddTaskPanelOpen(false)}
          isError={createTaskMutation.isError}
          error={createTaskMutation.error ?? undefined}
        />
      </SidePanel>
    </div>
  );
};

export default BudgetCategory;
