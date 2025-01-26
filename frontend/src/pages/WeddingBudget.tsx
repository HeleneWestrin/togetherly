import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import BudgetOverview from "../components/wedding/BudgetOverview";
import BudgetCategory from "../components/wedding/BudgetCategory";
import { fetchWeddingDetails } from "../services/weddingService";
import WeddingHeader from "../components/wedding/WeddingHeader";
import { Edit2 } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import SidePanel from "../components/ui/SidePanel";
import FormInput from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";
import { useEffect, useState } from "react";

const WeddingBudget: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { openPanel, closePanel, activePanels } = useUIStore();
  const [newBudget, setNewBudget] = useState(0);
  const [error, setError] = useState<string>("");

  const {
    isLoading,
    error: queryError,
    data: wedding,
  } = useQuery({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (wedding?.budget?.total) {
      setNewBudget(wedding.budget.total);
    }
  }, [wedding?.budget?.total]);

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; completed: boolean }) =>
      axiosInstance.patch(`/api/tasks/${data.taskId}`, {
        completed: data.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
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
    const task = wedding?.budget?.allocated
      .flatMap((cat) => cat.tasks)
      .find((t) => t._id === taskId);

    if (task) {
      updateTaskMutation.mutate({
        taskId,
        completed: !task.completed,
      });
    }
  };

  const handleEditBudget = () => {
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

  if (isLoading) return <div className="p-5">Loading wedding details...</div>;

  if (queryError) {
    const axiosError = queryError as { response?: { status: number } };
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      forceLogout();
      return null;
    }
    return (
      <div className="p-5">
        <p className="text-red-600">
          Error loading wedding details: {(queryError as Error).message}
        </p>
      </div>
    );
  }

  if (!wedding) return <div className="p-5">No wedding data available.</div>;

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
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
        <div className="px-5 lg:px-8 py-6 lg:py-8 2xl:py-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            {wedding.budget && (
              <div className="space-y-8">
                <BudgetOverview
                  wedding={wedding}
                  onUpdateBudget={updateBudgetMutation.mutate}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                  <Typography
                    element="h2"
                    className="md:col-span-2"
                  >
                    Wedding checklist
                  </Typography>
                  {wedding.budget.allocated.map((category) => (
                    <BudgetCategory
                      key={category._id}
                      category={category}
                      onEditTask={handleEditTask}
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
            type="text"
            inputMode="numeric"
            isCurrency={true}
            currencySuffix=" kr"
            value={wedding.budget?.total ?? 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewBudget(Number(e.target.value))
            }
            required
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
              Update budget
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
