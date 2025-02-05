import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WeddingHeader from "./WeddingHeader";
import UserListSkeleton from "./UserListSkeleton";
import { Typography } from "../ui/Typography";
const WeddingUsersSkeleton: React.FC = () => {
  return (
    <>
      <main
        id="main"
        className="min-h-svh"
      >
        <WeddingHeader title="Users" />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-8">
            <div>
              <Typography
                element="h2"
                className="mb-4"
              >
                The couple
              </Typography>
              <div className="space-y-4">
                <UserListSkeleton />
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingUsersSkeleton;
