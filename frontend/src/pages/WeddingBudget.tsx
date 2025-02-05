import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CheckIcon, Edit2 } from "lucide-react";
import { BouncingBall } from "react-svg-spinners";

import { useUIStore } from "../stores/useUIStore";
import { AxiosError } from "axios";
import { axiosInstance } from "../services/axiosService";
import { fetchWeddingDetails } from "../services/weddingService";
import { offlineStorage } from "../services/offlineStorage";
import { forceLogout } from "../utils/logoutHandler";

import { Typography } from "../components/ui/Typography";
import SidePanel from "../components/ui/SidePanel";
import FormInput from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";

import BudgetOverview from "../components/wedding/BudgetOverview";
import BudgetCategory from "../components/wedding/BudgetCategory";
import WeddingHeader from "../components/wedding/WeddingHeader";
import BudgetCategorySkeleton from "../components/wedding/BudgetCategorySkeleton";
import BudgetOverviewSkeleton from "../components/wedding/BudgetOverviewSkeleton";

import type { Wedding } from "../types/wedding";

const WeddingBudget: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { openPanel, closePanel, activePanels } = useUIStore();
  const [newBudget, setNewBudget] = useState(0);
  const [error, setError] = useState<string>("");

  const {
    isLoading: isWeddingLoading,
    error: queryError,
    data: wedding,
  } = useQuery<Wedding, AxiosError>({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (wedding?.budget.total) {
      setNewBudget(wedding.budget.total);
    }
  }, [wedding?.budget.total]);

  const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return useCallback(
      (...args: any[]) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    );
  };

  const debouncedTaskUpdate = useDebounce(
    (taskId: string, completed: boolean) => {
      updateTaskMutation.mutate(
        { taskId, completed },
        {
          onError: () => {
            offlineStorage.saveTask(taskId, completed);
          },
        }
      );
    },
    100
  );

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; completed: boolean }) =>
      axiosInstance
        .patch(`/api/tasks/${data.taskId}`, { completed: data.completed })
        .then((response) => response.data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["wedding", weddingSlug] });
      const previousWedding = queryClient.getQueryData([
        "wedding",
        weddingSlug,
      ]);
      queryClient.setQueryData(["wedding", weddingSlug], (old: any) => {
        const updatedWedding = { ...old };
        if (updatedWedding.budget && updatedWedding.budget.budgetCategories) {
          updatedWedding.budget.budgetCategories =
            updatedWedding.budget.budgetCategories.map((category: any) => ({
              ...category,
              tasks: category.tasks.map((task: any) =>
                task._id === newData.taskId
                  ? { ...task, completed: newData.completed }
                  : task
              ),
            }));
        }
        return updatedWedding;
      });
      return { previousWedding };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        ["wedding", weddingSlug],
        context?.previousWedding
      );
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(["wedding", weddingSlug], (old: any) => {
        if (!old || !old.budget || !old.budget.budgetCategories) return old;
        return {
          ...old,
          budget: {
            ...old.budget,
            budgetCategories: old.budget.budgetCategories.map(
              (category: any) => ({
                ...category,
                tasks: category.tasks.map((task: any) =>
                  task._id === updatedTask._id
                    ? { ...task, ...updatedTask }
                    : task
                ),
              })
            ),
          },
        };
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (total: number) => {
      const response = await axiosInstance.patch(
        `/api/weddings/${wedding?._id}/budget`,
        {
          total,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("editBudget");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleEditTask = (taskId: string) => {
    const task = wedding?.budget.budgetCategories
      .flatMap((cat) => cat.tasks)
      .find((t) => t._id === taskId);

    if (task) {
      const newCompleted = !task.completed;
      debouncedTaskUpdate(taskId, newCompleted);
    }
  };

  const handleEditBudget = () => {
    updateBudgetMutation.reset();
    openPanel("editBudget");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget < 0) {
      setError("Budget cannot be negative");
      return;
    }
    updateBudgetMutation.mutate(newBudget);
  };

  useEffect(() => {
    const handleOnline = () => {
      offlineStorage.syncTasks();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  if (queryError) {
    const axiosError = queryError as { response?: { status: number } };
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      forceLogout();
      return null;
    }
  }

  return (
    <>
      <main
        id="main"
        className="min-h-svh"
      >
        <WeddingHeader
          title="Budget"
          iconBefore={
            <Edit2
              width={16}
              height={16}
            />
          }
          buttonText="Edit budget"
          onClick={handleEditBudget}
        />
        <div className="px-5 lg:px-8 py-6 lg:py-8 2xl:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            {queryError && (
              <div className="space-y-4">
                <Typography element="h1">
                  {queryError.response?.status === 404 && "Wedding not found"}
                </Typography>
                <Typography
                  element="p"
                  styledAs="bodyLarge"
                >
                  {queryError.response?.status === 404 &&
                    "This wedding doesn't seem to exist."}
                </Typography>
              </div>
            )}
            {isWeddingLoading ? (
              <div className="space-y-8">
                <BudgetOverviewSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
                  <Typography
                    element="h2"
                    className="lg:col-span-2"
                  >
                    Wedding checklist
                  </Typography>
                  <BudgetCategorySkeleton />
                  <BudgetCategorySkeleton />
                </div>
              </div>
            ) : !wedding ? (
              <div></div>
            ) : (
              <div className="space-y-8">
                <BudgetOverview budget={wedding.budget} />
                <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
                  <div className="flex justify-between items-center lg:col-span-2">
                    <Typography element="h2">Wedding checklist</Typography>
                  </div>
                  {wedding.budget.budgetCategories.map((budgetCategory) => (
                    <BudgetCategory
                      key={budgetCategory._id}
                      budgetCategory={budgetCategory}
                      onEditTask={handleEditTask}
                      budget={wedding.budget}
                      isLoading={isWeddingLoading}
                      wedding={wedding}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <SidePanel
        isOpen={!!activePanels.editBudget}
        onClose={() => closePanel("editBudget")}
        title="Update total budget"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <FormInput
            id="totalBudget"
            name="totalBudget"
            label="Total budget"
            type="tel"
            inputMode="numeric"
            isCurrency={true}
            currencySuffix=" kr"
            value={newBudget}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewBudget(Number(e.target.value))
            }
          />
          {error && (
            <Typography
              element="p"
              className="text-red-600"
            >
              {error}
            </Typography>
          )}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="flex-1"
            >
              {updateBudgetMutation.isPending ? (
                <BouncingBall
                  color="#fff"
                  className="w-6 h-6"
                />
              ) : updateBudgetMutation.isSuccess ? (
                <CheckIcon
                  color="#fff"
                  className="w-6 h-6"
                />
              ) : (
                "Update budget"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => closePanel("editBudget")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SidePanel>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingBudget;
