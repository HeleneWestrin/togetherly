import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../services/axiosService";
import { Typography } from "../components/ui/Typography";
import { forceLogout } from "../utils/logoutHandler";
import GuestList from "../components/wedding/GuestList";
import { fetchWeddingDetails } from "../services/weddingService";
import { useUIStore } from "../stores/useUIStore";
import SidePanel from "../components/ui/SidePanel";
import AddGuestForm from "../components/wedding/AddGuestForm";
import { useState } from "react";
import WeddingHeader from "../components/wedding/WeddingHeader";
import { GuestUser, Wedding } from "../types/wedding";
import { RSVPStatusType, WeddingPartyRoles } from "../types/constants";
import { WeddingPartyRoleType } from "../types/constants";
import WeddingGuestsSkeleton from "../components/wedding/WeddingGuestsSkeleton";

const WeddingGuests: React.FC = () => {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const queryClient = useQueryClient();
  const { activePanels, openPanel, closePanel } = useUIStore();
  const [error, setError] = useState<string>("");
  const [editingGuest, setEditingGuest] = useState<GuestUser | null>(null);

  const {
    isLoading,
    error: fetchError,
    data: wedding,
  } = useQuery<Wedding, Error>({
    queryKey: ["wedding", weddingSlug],
    queryFn: async () => {
      const response = await fetchWeddingDetails(weddingSlug!);
      return response as Wedding;
    },
    enabled: !!weddingSlug,
    staleTime: 5 * 60 * 1000,
  });

  const addGuestMutation = useMutation({
    mutationFn: async (guestData: {
      firstName: string;
      lastName: string;
      email?: string;
      connection: {
        partnerIds: string[];
      };
      rsvpStatus: RSVPStatusType;
      dietaryPreferences?: string;
      partyRole: WeddingPartyRoleType;
      trivia?: string;
    }) => {
      if (!wedding?._id) {
        throw new Error("Wedding ID is required");
      }

      const cleanedData = {
        firstName: guestData.firstName?.trim() || "",
        lastName: guestData.lastName?.trim() || "",
        email: guestData.email?.trim() || undefined,
        connection: {
          partnerIds: guestData.connection.partnerIds,
        },
        rsvpStatus: guestData.rsvpStatus || "pending",
        dietaryPreferences: guestData.dietaryPreferences?.trim() || undefined,
        partyRole: guestData.partyRole || WeddingPartyRoles.GUEST,
        trivia: guestData.trivia?.trim() || undefined,
      };

      const response = await axiosInstance.post(
        `/api/weddings/${wedding._id}/guests`,
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

  const updateGuestMutation = useMutation({
    mutationFn: async (data: {
      guestId: string;
      updates: {
        firstName: string;
        lastName: string;
        email?: string;
        connection: {
          partnerIds: string[];
        };
        rsvpStatus: RSVPStatusType;
        dietaryPreferences?: string;
        partyRole: WeddingPartyRoleType;
      };
    }) => {
      if (!wedding?._id) {
        throw new Error("Wedding ID is required");
      }
      if (!data.guestId) {
        throw new Error("Guest ID is required");
      }

      const cleanedData = {
        profile: {
          firstName: data.updates.firstName?.trim() || "",
          lastName: data.updates.lastName?.trim() || "",
        },
        email: data.updates.email?.trim() || undefined,
        guestDetails: {
          connection: {
            partnerIds: data.updates.connection.partnerIds,
          },
          rsvpStatus: data.updates.rsvpStatus,
          dietaryPreferences:
            data.updates.dietaryPreferences?.trim() === ""
              ? ""
              : data.updates.dietaryPreferences?.trim(),
          partyRole: data.updates.partyRole,
        },
      };

      const response = await axiosInstance.patch(
        `/api/weddings/${wedding._id}/guests/${data.guestId}`,
        cleanedData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingSlug] });
      closePanel("editGuest");
      setEditingGuest(null);
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const deleteGuestsMutation = useMutation({
    mutationFn: async (guestIds: string[]) => {
      if (!wedding?._id) {
        throw new Error("Wedding ID is required");
      }
      if (!guestIds.length) {
        throw new Error("At least one guest ID is required");
      }

      const response = await axiosInstance.delete(
        `/api/weddings/${wedding._id}/guests`,
        { data: { guestIds } }
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

  const updateRSVPMutation = useMutation({
    mutationFn: async (data: {
      guestIds: string[];
      rsvpStatus: RSVPStatusType;
    }) => {
      if (!wedding?._id) {
        throw new Error("Wedding ID is required");
      }
      if (!data.guestIds.length) {
        throw new Error("At least one guest ID is required");
      }

      const response = await axiosInstance.patch(
        `/api/weddings/${wedding._id}/guests/rsvp`,
        data
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

  const handleOpenPanel = () => {
    addGuestMutation.reset();
    openPanel("addGuest");
  };

  const handleClosePanel = () => {
    closePanel("addGuest");
    closePanel("editGuest");
    setEditingGuest(null);
    setError("");
  };

  const handleEditGuest = (guest: GuestUser) => {
    setEditingGuest(guest);
    openPanel("editGuest");
  };

  const handleDeleteGuests = (guestIds: string[]) => {
    if (
      window.confirm("Are you sure you want to delete the selected guests?")
    ) {
      deleteGuestsMutation.mutate(guestIds);
    }
  };

  const handleUpdateRSVP = (guestIds: string[], rsvpStatus: RSVPStatusType) => {
    updateRSVPMutation.mutate({ guestIds, rsvpStatus });
  };

  if (isLoading) return <WeddingGuestsSkeleton />;

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
        className="min-h-svh"
      >
        <WeddingHeader
          title="Guest list"
          onClick={handleOpenPanel}
          buttonText="Add guest"
        />
        <div className="px-5 lg:px-8 py-6 lg:py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-y-4 lg:gap-y-6">
            <div className="flex justify-between items-center">
              <Typography element="h2">
                {wedding?.guests?.length ?? 0} guests
              </Typography>
            </div>
            {wedding?.guests && wedding.guests.length > 0 ? (
              <GuestList
                isLoading={isLoading}
                guests={wedding.guests}
                wedding={wedding}
                onDeleteGuests={handleDeleteGuests}
                onUpdateRSVP={handleUpdateRSVP}
                onEditGuest={handleEditGuest}
              />
            ) : (
              <Typography
                element="p"
                className="text-dark-600"
              >
                No guests added yet.
              </Typography>
            )}
          </div>
        </div>
      </main>

      {activePanels.addGuest && wedding?.couple && (
        <SidePanel
          isOpen={!!activePanels.addGuest}
          onClose={handleClosePanel}
          title="Add guest"
        >
          <AddGuestForm
            onSubmit={(data) => addGuestMutation.mutateAsync(data)}
            onCancel={handleClosePanel}
            couple={wedding.couple}
            isError={!!error}
            error={error ? new Error(error) : null}
          />
        </SidePanel>
      )}

      <SidePanel
        isOpen={!!activePanels.editGuest}
        onClose={handleClosePanel}
        title="Edit guest"
      >
        {editingGuest && wedding?.couple && (
          <AddGuestForm
            guest={editingGuest}
            couple={wedding.couple}
            onSubmit={(data) =>
              updateGuestMutation.mutateAsync({
                guestId: editingGuest._id,
                updates: data,
              })
            }
            onCancel={handleClosePanel}
            isError={!!error}
            error={error ? new Error(error) : null}
          />
        )}
      </SidePanel>

      <div className="bg-gradient-full"></div>
    </>
  );
};

export default WeddingGuests;
