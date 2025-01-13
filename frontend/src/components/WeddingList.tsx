import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { Link } from "react-router-dom";

interface Wedding {
  _id: string;
  title: string;
  slug: string;
  date: string;
  location: {
    venue: string;
    city: string;
    country: string;
  };
  couple: Array<{
    profile: {
      firstName: string;
      lastName: string;
    };
  }>;
}

const fetchWeddings = async () => {
  const response = await axiosInstance.get<{ status: string; data: Wedding[] }>(
    "/weddings"
  );
  return response.data.data;
};

export const WeddingList: React.FC = () => {
  const {
    data: weddings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weddings"],
    queryFn: fetchWeddings,
  });

  if (isLoading) return <p>Loading weddings...</p>;

  if (error) return <p className="text-red-600">Error loading weddings</p>;

  if (!weddings?.length) {
    return <p>No weddings found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Weddings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {weddings.map((wedding) => (
          <Link
            key={wedding._id}
            to={`/wedding/${wedding.slug}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold">{wedding.title}</h3>
            <p className="text-gray-600">
              {new Date(wedding.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              {wedding.location.venue}, {wedding.location.city}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {wedding.couple
                .map(
                  (partner) =>
                    `${partner.profile.firstName} ${partner.profile.lastName}`
                )
                .join(" & ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
