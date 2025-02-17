import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Typography } from "../components/ui/Typography";
import { fetchWeddingDetails } from "../services/weddingService";
import WeddingHeader from "../components/wedding/WeddingHeader";

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

  return (
    <>
      <main
        id="main"
        className="min-h-svh"
      >
        <WeddingHeader title="Schedule" />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            <div className="flex flex-col gap-y-4 justify-between">
              {isLoading ? (
                <div className="p-5">
                  <Typography element="h1">
                    Loading wedding details...
                  </Typography>
                </div>
              ) : (
                <>
                  <Typography element="h2">Plan your wedding day</Typography>
                  <div className="p-6 md:p-8 bg-white rounded-3xl">
                    <Typography
                      element="p"
                      styledAs="bodyDefault"
                    >
                      <span className="font-bold">Coming soon!</span> Here you
                      will be able to create your wedding schedule.
                    </Typography>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingSchedule;
