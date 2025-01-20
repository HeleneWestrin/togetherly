import { Wedding } from "../types/wedding";

export const getBudgetProgress = (wedding: Wedding) => {
  if (!wedding?.budget) return 0;
  return (wedding.budget.spent / wedding.budget.total) * 100;
};

export const getTasksByCategory = (wedding: Wedding, category: string) => {
  if (!wedding?.budget?.allocated) return [];
  const budgetItem = wedding.budget.allocated.find(
    (item) => item.category === category
  );
  return budgetItem?.tasks || [];
};

export const getCategoryProgress = (
  tasks: Wedding["budget"]["allocated"][0]["tasks"]
) => {
  return tasks.length
    ? (tasks.filter((t) => t.completed).length / tasks.length) * 100
    : 0;
};

export const getDaysUntilWedding = (weddingDate: string): number => {
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeddingDateStatus = (weddingDate: string): string => {
  const daysUntil = getDaysUntilWedding(weddingDate);
  if (daysUntil < 0) return "Congratulations on your wedding!";
  if (daysUntil === 0) return "Happy Wedding Day! Let the celebration begin!";
  return `${daysUntil} days to go`;
};
