import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../services/axiosService";
import { Link } from "react-router-dom";
import { WeddingListItem, CoupleProfile } from "../../types/wedding";
import { Typography } from "../ui/Typography";

const fetchWeddings = async () => {
  const response = await axiosInstance.get<{
    status: string;
    data: WeddingListItem[];
  }>("/api/weddings");
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
  if (!weddings?.length) return <p>No weddings found.</p>;

  const formatCoupleName = (profiles: Array<{ profile: CoupleProfile }>) => {
    return profiles
      .map(({ profile }) => `${profile.firstName} ${profile.lastName}`)
      .join(" & ");
  };

  return (
    <div className="space-y-4">
      <Typography
        element="h2"
        styledAs="h2"
        className="text-xl font-semibold mb-4"
      >
        Your Weddings
      </Typography>
      <div className="grid gap-4 md:grid-cols-2">
        {weddings.map((wedding) => (
          <Link
            key={wedding._id}
            to={`/wedding/${wedding.slug}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Typography
              element="h3"
              styledAs="h3"
            >
              {wedding.title}
            </Typography>
            <Typography
              element="p"
              styledAs="bodySmall"
              className="text-dark-600"
            >
              {new Date(wedding.date).toLocaleDateString()}
            </Typography>
            <Typography
              element="p"
              styledAs="bodySmall"
              className="text-dark-600"
            >
              {wedding.location.venue}, {wedding.location.city}
            </Typography>
            <Typography
              element="p"
              styledAs="bodyExtraSmall"
              className="text-dark-500 mt-2"
            >
              {formatCoupleName(wedding.couple)}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WeddingList;
