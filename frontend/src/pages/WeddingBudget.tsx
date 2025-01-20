import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import { Button } from "../components/ui/Button";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import BudgetOverview from "../components/wedding/BudgetOverview";
import BudgetCategory from "../components/wedding/BudgetCategory";
import { fetchWeddingDetails } from "../services/weddingService";
import { getWeddingDateStatus } from "../utils/weddingCalculations";

const WeddingBudget: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: wedding,
  } = useQuery({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
    staleTime: 5 * 60 * 1000,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; completed: boolean }) =>
      axiosInstance.patch(`/api/tasks/${data.taskId}`, {
        completed: data.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
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

  if (isLoading) return <div className="p-5">Loading wedding details...</div>;

  if (error) {
    const axiosError = error as { response?: { status: number } };
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
          Error loading wedding details: {(error as Error).message}
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
        <div className="p-5 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <Typography element="h1">
                {wedding.couple
                  .map((partner) => partner.profile.firstName)
                  .join(" & ")}
              </Typography>
              <Typography
                element="p"
                className="text-dark-600"
              >
                <span>
                  {wedding.date && new Date(wedding.date).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {wedding.date && getWeddingDateStatus(wedding.date)}
                </span>
              </Typography>
            </div>
            <Button
              variant="secondary"
              onClick={forceLogout}
            >
              Log out
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            {wedding.budget?.total && (
              <div className="space-y-8">
                <BudgetOverview wedding={wedding} />
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
                      category={category.category}
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
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingBudget;
