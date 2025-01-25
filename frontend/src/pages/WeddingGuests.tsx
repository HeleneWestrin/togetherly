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
import FormInput from "../components/ui/FormInput";
import { useState } from "react";

const WeddingGuests: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { activePanels, openPanel, closePanel } = useUIStore();
  const [guestEmail, setGuestEmail] = useState("");
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
    mutationFn: async (email: string) => {
      const response = await axiosInstance.post(
        `/api/weddings/${wedding?._id}/guests`,
        {
          guestEmail: email,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("addGuest");
      setGuestEmail("");
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail) {
      setError("Email is required");
      return;
    }
    addGuestMutation.mutate(guestEmail);
  };

  const handleOpenPanel = () => openPanel("addGuest");
  const handleClosePanel = () => {
    closePanel("addGuest");
    setError("");
    setGuestEmail("");
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
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-8">
            <div className="flex justify-between items-center">
              <Typography element="h1">Guest list</Typography>
              <Button
                variant="primary"
                onClick={handleOpenPanel}
              >
                Add guest
              </Button>
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
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <Typography
              element="p"
              className="text-red-600"
            >
              {error}
            </Typography>
          )}

          <FormInput
            id="guestEmail"
            name="guestEmail"
            type="email"
            label="Guest email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              disabled={addGuestMutation.isPending}
            >
              {addGuestMutation.isPending ? "Adding guest..." : "Add guest"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClosePanel}
              disabled={addGuestMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SidePanel>

      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingGuests;
