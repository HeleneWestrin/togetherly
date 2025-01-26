import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import { Button } from "../components/ui/Button";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import GuestList from "../components/wedding/GuestList";
import { fetchWeddingDetails } from "../services/weddingService";
import { useUIStore } from "../stores/useUIStore";
import SidePanel from "../components/ui/SidePanel";
import AddGuestForm from "../components/wedding/AddGuestForm";
import { useState } from "react";
import WeddingHeader from "../components/wedding/WeddingHeader";

const WeddingGuests: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { activePanels, openPanel, closePanel } = useUIStore();
  const [error, setError] = useState<string>("");

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

  const addGuestMutation = useMutation({
    mutationFn: async (guestData: {
      firstName: string;
      lastName: string;
      email?: string;
      relationship: "wife" | "husband" | "both";
      rsvpStatus: "pending" | "confirmed" | "declined";
      dietaryPreferences?: string;
      trivia?: string;
    }) => {
      const cleanedData = {
        ...guestData,
        email: guestData.email?.trim() || undefined,
        dietaryPreferences: guestData.dietaryPreferences?.trim() || undefined,
        trivia: guestData.trivia?.trim() || undefined,
      };

      const response = await axiosInstance.post(
        `/api/weddings/${wedding?._id}/guests`,
        cleanedData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("addGuest");
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleOpenPanel = () => openPanel("addGuest");
  const handleClosePanel = () => {
    closePanel("addGuest");
    setError("");
  };

  if (isLoading) return <div className="p-5">Loading wedding details...</div>;

  if (fetchError) {
    const axiosError = fetchError as { response?: { status: number } };
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      forceLogout();
      return null;
    }
    return (
      <div className="p-5">
        <p className="text-red-600">
          Error loading wedding details: {(fetchError as Error).message}
        </p>
      </div>
    );
  }

  if (!wedding) return <div className="p-5">No wedding data available.</div>;

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
      >
        <WeddingHeader
          title="Guest list"
          onClick={handleOpenPanel}
          buttonText="Add guest"
        />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            <div className="flex justify-between items-center">
              <Typography element="h2">Guests</Typography>
            </div>
            {wedding.guests && <GuestList guests={wedding.guests} />}
          </div>
        </div>
      </main>

      <SidePanel
        isOpen={!!activePanels.addGuest}
        onClose={handleClosePanel}
        title="Add new guest"
      >
        <AddGuestForm
          onSubmit={(data) => addGuestMutation.mutateAsync(data)}
          onCancel={handleClosePanel}
          isError={!!error}
          error={error ? new Error(error) : null}
        />
      </SidePanel>

      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingGuests;
