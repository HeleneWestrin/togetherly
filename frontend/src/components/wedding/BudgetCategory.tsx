import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskData,
  TaskResponse,
  Wedding,
  BudgetCategory as BudgetCategoryType,
} from "../../types/wedding";
import { createTask } from "../../services/taskService";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import Badge, { BadgeProps } from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import SidePanel from "../ui/SidePanel";
import { Plus, ChevronDown } from "lucide-react";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import { useUIStore } from "../../stores/useUIStore";
import { getCategoryProgress } from "../../utils/weddingCalculations";

interface BudgetCategoryProps {
  category: BudgetCategoryType;
  onEditTask: (taskId: string) => void;
  wedding: Wedding;
}

const getProgressColor = (progress: number): BadgeProps["color"] => {
  if (progress === 0) return "blue";
  if (progress === 100) return "green";
  return "yellow";
};

const useCreateTaskMutation = (onSuccess: () => void) => {
  return useMutation<TaskResponse, Error, CreateTaskData>({
    mutationFn: async (data: CreateTaskData) => {
      return createTask({
        ...data,
        dueDate: data.dueDate || new Date().toISOString(),
      });
    },
    onSuccess,
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
};

const BudgetCategory: React.FC<BudgetCategoryProps> = ({
  category,
  onEditTask,
  wedding,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { activePanels, openPanel, closePanel } = useUIStore();
  const queryClient = useQueryClient();

  const handleClosePanel = () => closePanel("addTask");
  const createTaskMutation = useCreateTaskMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["wedding"] });
    handleClosePanel();
  });

  // Safely access tasks with a default empty array
  const tasks = category?.tasks || [];
  const progress = getCategoryProgress(tasks);
  const isAddTaskPanelOpen =
    activePanels.addTask?.isOpen &&
    activePanels.addTask.category === category.category;

  const handleOpenPanel = () =>
    openPanel("addTask", { isOpen: true, category: category.category });

  return (
    <div
      aria-live="polite"
      className="bg-white p-6 rounded-3xl"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-controls={`category-content-${category?.category}`}
      >
        <div className="flex flex-col items-start gap-1.5">
          <Typography
            element="h3"
            className="!leading-none"
          >
            {category?.category}
          </Typography>
          <Badge color={getProgressColor(progress)}>
            {tasks.length === 0
              ? "No tasks yet"
              : `${progress.toFixed(0)}% done`}
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
        id={`category-content-${category?.category}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isExpanded}
      >
        <div className={`${isExpanded ? "" : "overflow-hidden"}`}>
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
              className="mb-6"
            />

            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  budgetItemId={category._id}
                  weddingId={wedding._id}
                  onEditTask={onEditTask}
                />
              ))}
            </div>

            {tasks.length > 0 &&
              tasks.some((task) => task.budget > 0 || task.actualCost > 0) && (
                <>
                  <hr className="mt-6 mb-3 border-dark-300" />
                  <Typography
                    element="p"
                    styledAs="bodySmall"
                    className="flex justify-between mb-6"
                  >
                    <span className="text-dark-850 font-bold">Cost: </span>
                    <span className="text-dark-600">
                      {`${category.spent.toLocaleString()} kr out of ${category.estimatedCost.toLocaleString()} kr`}
                    </span>
                  </Typography>
                </>
              )}

            <Button
              variant="inline"
              size="tiny"
              className="mt-4"
              onClick={handleOpenPanel}
            >
              <Plus aria-hidden="true" />
              Add new task
            </Button>
          </div>
        </div>
      </div>

      <SidePanel
        isOpen={isAddTaskPanelOpen || false}
        onClose={handleClosePanel}
        title={`Add task to ${category.category}`}
      >
        <TaskForm
          budgetItemId={category._id}
          weddingId={wedding._id}
          onSubmit={createTaskMutation.mutateAsync}
          onCancel={handleClosePanel}
          isError={createTaskMutation.isError}
          error={createTaskMutation.error}
        />
      </SidePanel>
    </div>
  );
};

export default BudgetCategory;
