import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WeddingHeader from "./WeddingHeader";
import GuestListSkeleton from "./GuestListSkeleton";
import { Typography } from "../ui/Typography";

const WeddingGuestsSkeleton: React.FC = () => {
  return (
    <>
      <main
        id="main"
        className="min-h-svh"
      >
        <WeddingHeader title="Guest list" />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-4 lg:gap-y-6">
            <div className="flex justify-between items-center">
              <Typography
                element="h2"
                className="flex items-center gap-2"
              >
                Guests
              </Typography>
            </div>
            <GuestListSkeleton />
          </div>
        </div>
      </main>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingGuestsSkeleton;
