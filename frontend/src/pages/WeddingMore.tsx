import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import { Typography } from "../components/ui/Typography";
import { fetchWeddingDetails } from "../services/weddingService";
import WeddingHeader from "../components/wedding/WeddingHeader";
import { BouncingBall } from "react-svg-spinners";
import { Button } from "../components/ui/Button";
import { forceLogout } from "../utils/logoutHandler";

const WeddingMore: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const isMobile = useIsMobile();
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
        <WeddingHeader title="More" />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            <div className="flex flex-col gap-y-4 justify-between">
              {isLoading ? (
                <div className="p-5">
                  <BouncingBall
                    color="#fff"
                    className="w-6 h-6"
                  />
                </div>
              ) : (
                <>
                  <div className="p-6 space-y-4 md:p-8 bg-white rounded-3xl">
                    <Typography element="h2">More fun coming soon!</Typography>
                    <Typography
                      element="p"
                      styledAs="bodyDefault"
                    >
                      <span className="font-bold">In the mean time,</span>{" "}
                      please share your feedback on the product thus far. Any
                      suggestions are welcome!
                    </Typography>
                    <Typography element="p">
                      Click on the button that says "Feedback" on the right side
                      of the screen to share your feedback.
                    </Typography>

                    {isMobile && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={forceLogout}
                      >
                        Log out
                      </Button>
                    )}
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

export default WeddingMore;
