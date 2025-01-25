import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Typography } from "../components/ui/Typography";
import { fetchWeddingDetails } from "../services/weddingService";

const WeddingSchedule: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();

  const {
    isLoading,
    error: fetchError,
    data: wedding,
  } = useQuery({
    queryKey: ["wedding", weddingSlug],
    queryFn: () => fetchWeddingDetails(weddingSlug!),
    enabled: !!weddingSlug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="p-5">Loading wedding details...</div>;

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
      >
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            <div className="flex flex-col gap-y-3 justify-between">
              <Typography element="h1">Wedding schedule</Typography>
              <Typography
                element="p"
                styledAs="bodyDefault"
              >
                <span className="font-bold">Coming soon!</span> Create your
                wedding schedule.
              </Typography>
            </div>
          </div>
        </div>
      </main>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingSchedule;
