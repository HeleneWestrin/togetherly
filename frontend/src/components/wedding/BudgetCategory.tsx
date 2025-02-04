import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskData,
  TaskResponse,
  BudgetCategory as BudgetCategoryType,
  Task,
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
import BudgetCategorySkeleton from "./BudgetCategorySkeleton";

interface BudgetCategoryProps {
  budgetCategory: BudgetCategoryType;
  onEditTask: (taskId: string) => void;
  budget: {
    total: number;
    spent: number;
    allocated: BudgetCategoryType[];
  };
  isLoading: boolean;
  wedding?: {
    _id: string;
  };
}

// Helper function to determine progress indicator color
const getProgressColor = (progress: number): BadgeProps["color"] => {
  if (progress === 0) return "blue";
  if (progress === 100) return "green";
  return "yellow";
};

// Custom hook for task creation mutation
const useCreateTaskMutation = (onSuccess: () => void) => {
  return useMutation<TaskResponse, Error, CreateTaskData>({
    mutationFn: async (data: CreateTaskData) => {
      return createTask({
        ...data,
        dueDate: data.dueDate,
      });
    },
    onSuccess,
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
};

const BudgetCategory: React.FC<BudgetCategoryProps> = ({
  budgetCategory,
  onEditTask,
  budget,
  isLoading,
  wedding,
}) => {
  // Prevent rendering if no wedding ID
  if (!wedding?._id) {
    console.error("No wedding ID available");
    return null;
  }

  // Show skeleton loader while data is loading
  if (isLoading) {
    return <BudgetCategorySkeleton />;
  }

  // Local state for category expansion
  const [isExpanded, setIsExpanded] = useState(true);

  // Global UI state management
  const { activePanels, openPanel, closePanel } = useUIStore();
  const queryClient = useQueryClient();

  // Panel management handlers
  const handleClosePanel = () => closePanel("addTask");
  const createTaskMutation = useCreateTaskMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["wedding"] });
    handleClosePanel();
  });

  // Safely access tasks with a default empty array
  const tasks: Task[] = budgetCategory.tasks || [];
  const progress = getCategoryProgress(tasks);
  const isAddTaskPanelOpen =
    activePanels.addTask?.isOpen &&
    activePanels.addTask.category === budgetCategory.category;

  const handleOpenPanel = () =>
    openPanel("addTask", { isOpen: true, category: budgetCategory.category });

  // Helper function to create category names without special characters
  const sanitizeCategoryName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  return (
    <div
      aria-live="polite"
      className="bg-white p-6 rounded-3xl"
    >
      {/* Category Header/Toggle Button */}
      <button
        id={`category-header-${sanitizeCategoryName(budgetCategory.category)}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-controls={`category-content-${sanitizeCategoryName(
          budgetCategory.category
        )}`}
      >
        <div className="flex flex-col items-start gap-1.5">
          <Typography
            element="h3"
            className="!leading-none"
          >
            {budgetCategory.category}
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

      {/* Expandable Content Section */}
      <div
        id={`category-content-${sanitizeCategoryName(budgetCategory.category)}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-labelledby={`category-header-${sanitizeCategoryName(
          budgetCategory.category
        )}`}
        aria-hidden={!isExpanded}
      >
        <div className={`${isExpanded ? "" : "overflow-hidden"}`}>
          <div className="py-1 mt-4">
            {/* Task Progress Summary */}
            <Typography
              element="p"
              styledAs="bodySmall"
              className="flex justify-between mb-2"
            >
              <span className="text-dark-800 font-bold">Tasks:</span>
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

            {/* Task List */}
            <div className="space-y-4">
              {tasks.map((task) => {
                return (
                  <TaskItem
                    key={task._id}
                    task={task}
                    budgetCategoryId={budgetCategory._id}
                    weddingId={wedding._id}
                    onEditTask={onEditTask}
                  />
                );
              })}
            </div>

            {/* Cost Summary Section - Only shown if tasks have budget/costs */}
            {tasks.length > 0 &&
              tasks.some((task) => task.budget > 0 || task.actualCost > 0) && (
                <>
                  <hr className="mt-6 mb-3 border-dark-300" />
                  <Typography
                    element="p"
                    styledAs="bodySmall"
                    className="flex justify-between mb-6"
                  >
                    <span className="text-dark-800 font-bold">Cost: </span>
                    <span className="text-dark-600">
                      {`${budgetCategory.spent.toLocaleString()} kr out of ${budgetCategory.estimatedCost.toLocaleString()} kr`}
                    </span>
                  </Typography>
                </>
              )}

            {/* Add Task Button */}
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

      {/* Add Task Side Panel */}
      <SidePanel
        isOpen={isAddTaskPanelOpen || false}
        onClose={handleClosePanel}
        title={`Add task to ${budgetCategory.category}`}
      >
        <TaskForm
          budgetCategoryId={budgetCategory._id}
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
