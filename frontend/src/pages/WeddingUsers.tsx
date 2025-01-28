import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import { fetchWeddingDetails } from "../services/weddingService";
import { useUIStore } from "../stores/useUIStore";
import SidePanel from "../components/ui/SidePanel";
import { useState } from "react";
import WeddingHeader from "../components/wedding/WeddingHeader";
import UserList from "../components/wedding/UserList";
import InviteUserForm from "../components/wedding/InviteUserForm";

const WeddingUsers: React.FC = () => {
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

  const inviteUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      role: "couple" | "guest";
      weddingRole:
        | "Maid of Honor"
        | "Best Man"
        | "Bridesmaid"
        | "Groomsman"
        | "Parent"
        | "Other";
    }) => {
      if (!wedding?._id) throw new Error("Wedding ID is required");

      const response = await axiosInstance.post(
        `/api/weddings/${wedding._id}/users/invite`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("inviteUser");
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleOpenPanel = () => openPanel("inviteUser");
  const handleClosePanel = () => {
    closePanel("inviteUser");
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

  // Filter guests with admin roles
  const adminGuests =
    wedding.guests?.filter((guest) =>
      ["Maid of Honor", "Best Man"].includes(guest.guestDetails[0]?.role)
    ) || [];

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
      >
        <WeddingHeader
          title="Users"
          onClick={handleOpenPanel}
          buttonText="Invite user"
        />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-8">
            {/* Couple Section */}
            <div>
              <Typography
                element="h2"
                className="mb-4"
              >
                The couple
              </Typography>
              <UserList
                users={wedding.couple}
                type="couple"
              />
            </div>

            {/* Admin Guests Section */}
            <div>
              <Typography
                element="h2"
                className="mb-4"
              >
                Wedding admins
              </Typography>
              {adminGuests.length > 0 ? (
                <UserList
                  users={adminGuests}
                  type="admin"
                />
              ) : (
                <Typography
                  element="p"
                  className="text-dark-600"
                >
                  No wedding admins added yet.
                </Typography>
              )}
            </div>
          </div>
        </div>
      </main>

      <SidePanel
        isOpen={!!activePanels.inviteUser}
        onClose={handleClosePanel}
        title="Invite user"
      >
        <InviteUserForm
          onSubmit={(data: {
            email: string;
            role: "couple" | "guest";
            weddingRole:
              | "Maid of Honor"
              | "Best Man"
              | "Bridesmaid"
              | "Groomsman"
              | "Parent"
              | "Other";
          }) => inviteUserMutation.mutateAsync(data)}
          onCancel={handleClosePanel}
          isError={!!error}
          error={error ? new Error(error) : null}
        />
      </SidePanel>

      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingUsers;
