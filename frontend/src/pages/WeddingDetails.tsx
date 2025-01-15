import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import Button from "../components/ui/Button";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import BudgetOverview from "../components/wedding/BudgetOverview";
import BudgetCategory from "../components/wedding/BudgetCategory";

interface Wedding {
  _id: string;
  title: string;
  date: string;
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
  };
  couple: Array<{
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  }>;
  guests: Array<{
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  }>;
  budget?: {
    total: number;
    spent: number;
    allocated: Array<{
      _id: string;
      category: string;
      estimatedCost: number;
      spent: number;
      progress: number;
      tasks: Array<{
        _id: string;
        title: string;
        budget: number;
        actualCost: number;
        completed: boolean;
      }>;
    }>;
  };
}

const fetchWeddingDetails = async (slug: string) => {
  const response = await axiosInstance.get<{ status: string; data: Wedding }>(
    `/api/weddings/by-slug/${slug}`
  );
  return response.data.data;
};

const getDaysUntilWedding = (weddingDate: string): number => {
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getWeddingDateStatus = (weddingDate: string): string => {
  const daysUntil = getDaysUntilWedding(weddingDate);

  if (daysUntil < 0) return "Congratulations on your wedding!";
  if (daysUntil === 0) return "Happy Wedding Day! Let the celebration begin!";
  return `${daysUntil} days to go`;
};

const handleAddTask = (category: string) => {
  // TODO: Implement modal or navigation to add task form
  console.log("Add task to category:", category);
};

const WeddingDetails: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const {
    data: wedding,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
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

  const handleLogout = () => {
    forceLogout();
  };

  if (isLoading) return <div className="p-6">Loading wedding details...</div>;

  if (error) {
    // Check if it's an axios error with status code
    const axiosError = error as { response?: { status: number } };
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      forceLogout();
      return null;
    }

    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading wedding details: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!wedding) return null;

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
      >
        <div className="p-6 max-w-4xl mx-auto">
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
                <span>{new Date(wedding.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{getWeddingDateStatus(wedding.date)}</span>
              </Typography>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            {/* Budget Section (only shown if available) */}
            {wedding.budget?.total && (
              <div className="space-y-6">
                <BudgetOverview budget={wedding.budget} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wedding.budget.allocated.map((category) => {
                    return (
                      <BudgetCategory
                        key={category._id}
                        category={category.category}
                        tasks={category.tasks}
                        progress={category.progress}
                        estimatedCost={category.estimatedCost}
                        spent={category.spent}
                        onAddTask={(category) => handleAddTask(category)}
                        onEditTask={(taskId) => handleEditTask(taskId)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guest List */}
            <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Guest List</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {wedding.guests.map((guest) => (
                  <div
                    key={guest._id}
                    className="p-3 bg-gray-50 rounded"
                  >
                    <p className="font-semibold">
                      {guest.profile.firstName} {guest.profile.lastName}
                    </p>
                    <p className="text-gray-600 text-sm">{guest.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="bg-gradient-landscape"></div>
    </>
  );
};

export default WeddingDetails;
