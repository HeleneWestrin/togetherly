import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";

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

const WeddingDetails: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const {
    data: wedding,
    isLoading,
    error,
  } = useQuery(["wedding", weddingSlug], () =>
    fetchWeddingDetails(weddingSlug!)
  );

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{wedding.title}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Date and Location */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <p className="mb-2">
            <span className="font-semibold">Date:</span>{" "}
            {new Date(wedding.date).toLocaleDateString()}
          </p>
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
  );
};

export default WeddingDetails;
