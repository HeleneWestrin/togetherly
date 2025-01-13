import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import Button from "../components/ui/Button";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

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
    allocated: Array<{
      category: string;
      amount: number;
    }>;
  };
}

const fetchWeddingDetails = async (slug: string) => {
  const response = await axiosInstance.get<{ status: string; data: Wedding }>(
    `/weddings/by-slug/${slug}`
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

const WeddingDetails: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const {
    data: wedding,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
  });

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) return <div className="p-6">Loading wedding details...</div>;

  if (error) {
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
    <main
      id="main"
      className="min-h-screen bg-gradient-landscape"
    >
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">
              {wedding.couple
                .map((partner) => partner.profile.firstName)
                .join(" & ")}
            </h1>
            <p className="text-dark-600">
              <span>{new Date(wedding.date).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{getWeddingDateStatus(wedding.date)}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>

            <div className="space-y-1">
              <p className="font-semibold">Location:</p>
              <p>{wedding.location.venue}</p>
              <p>{wedding.location.address}</p>
              <p>
                {wedding.location.city}, {wedding.location.country}
              </p>
            </div>
          </div>

          {/* Couple Information */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">The Happy Couple</h2>
            <div className="space-y-4">
              {wedding.couple.map((partner) => (
                <div key={partner._id}>
                  <p className="font-semibold">
                    {partner.profile.firstName} {partner.profile.lastName}
                  </p>
                  <p className="text-gray-600">{partner.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Section (only shown if available) */}
          {wedding.budget?.total && (
            <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Budget</h2>
              <p className="mb-4">
                <span className="font-semibold">Total Budget:</span> $
                {wedding.budget.total.toLocaleString()}
              </p>
              {wedding.budget.allocated?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Allocated Budget:</h3>
                  <div className="space-y-2">
                    {wedding.budget.allocated?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between"
                      >
                        <span>{item.category}</span>
                        <span>${item.amount?.toLocaleString() ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
  );
};

export default WeddingDetails;
