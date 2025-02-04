import { Task } from "../types/wedding";

type CategoryTask = Pick<
  Task,
  "_id" | "completed" | "title" | "budget" | "actualCost" | "dueDate"
>;

// Calculate percentage of total budget that has been spent
export const getBudgetProgress = (budget: { total: number; spent: number }) => {
  if (!budget) return 0;
  return (budget.spent / budget.total) * 100;
};

// Calculate percentage of completed tasks in a category
export const getCategoryProgress = (tasks: CategoryTask[]) => {
  return tasks.length
    ? (tasks.filter((t) => t.completed).length / tasks.length) * 100
    : 0;
};

// Calculate number of days until the wedding
export const getDaysUntilWedding = (weddingDate: string): number => {
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get a user-friendly status message based on wedding date
export const getWeddingDateStatus = (weddingDate: string): string => {
  const daysUntil = getDaysUntilWedding(weddingDate);
  if (daysUntil < 0) return "Congratulations on your wedding!";
  if (daysUntil === 0) return "Happy Wedding Day! Let the celebration begin!";
  return `${daysUntil} days to go`;
};
