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
import { GuestUser } from "../types/wedding";
import { CoupleUser } from "../types/wedding";
import EditUserForm from "../components/wedding/EditUserForm";
import {
  WeddingAccessLevel,
  WeddingAccessLevelType,
  WeddingPartyRoleType,
} from "../types/constants";

const WeddingUsers: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { activePanels, openPanel, closePanel } = useUIStore();
  const [editingUser, setEditingUser] = useState<CoupleUser | GuestUser | null>(
    null
  );
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
      firstName: string;
      lastName: string;
      email: string;
      accessLevel: WeddingAccessLevelType;
      partyRole: WeddingPartyRoleType;
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!wedding?._id) throw new Error("Wedding ID is required");

      const response = await axiosInstance.delete(
        `/api/weddings/${wedding._id}/users/${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: {
        email?: string;
        accessLevel?: WeddingAccessLevelType;
        partyRole?: WeddingPartyRoleType;
        firstName?: string;
        lastName?: string;
      };
    }) => {
      if (!wedding?._id) throw new Error("Wedding ID is required");

      const response = await axiosInstance.patch(
        `/api/weddings/${wedding._id}/users/${userId}`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("editUser");
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleOpenPanel = () => {
    inviteUserMutation.reset();
    openPanel("inviteUser");
  };

  const handleClosePanel = () => {
    closePanel("inviteUser");
    setError("");
  };

  const handleEditUser = (user: CoupleUser | GuestUser) => {
    editUserMutation.reset();
    setEditingUser(user);
    openPanel("editUser");
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      await deleteUserMutation.mutateAsync(userId);
    }
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

  // Filter guests with weddingAdmin access for the current wedding
  const weddingCouple =
    wedding.couple?.filter((couple) =>
      couple.weddings?.some(
        (w) =>
          w.weddingId.toString() === wedding._id.toString() &&
          w.accessLevel === WeddingAccessLevel.COUPLE
      )
    ) || [];

  const weddingAdmins =
    wedding.guests?.filter((guest) =>
      guest.weddings?.some(
        (w) =>
          w.weddingId.toString() === wedding._id.toString() &&
          w.accessLevel === WeddingAccessLevel.WEDDING_ADMIN
      )
    ) || [];

  return (
    <>
      <main
        id="main"
        className="min-h-svh"
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
                users={weddingCouple}
                type="couple"
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
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
              {weddingAdmins.length > 0 ? (
                <UserList
                  users={weddingAdmins}
                  type="weddingAdmin"
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
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

      {/* Invite User Panel */}
      <SidePanel
        isOpen={!!activePanels.inviteUser}
        onClose={handleClosePanel}
        title="Invite user"
      >
        <InviteUserForm
          onSubmit={(data) => inviteUserMutation.mutateAsync(data)}
          onCancel={handleClosePanel}
          isError={!!error}
          error={error ? new Error(error) : null}
          existingGuests={wedding?.guests}
        />
      </SidePanel>

      {/* Edit User Panel */}
      <SidePanel
        isOpen={!!activePanels.editUser}
        onClose={() => {
          closePanel("editUser");
          setEditingUser(null);
          setError("");
        }}
        title="Edit user"
      >
        {editingUser && (
          <EditUserForm
            user={editingUser}
            onSubmit={editUserMutation.mutateAsync}
            onCancel={() => {
              closePanel("editUser");
              setEditingUser(null);
              setError("");
            }}
            isError={!!error}
            error={error ? new Error(error) : null}
          />
        )}
      </SidePanel>

      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingUsers;
