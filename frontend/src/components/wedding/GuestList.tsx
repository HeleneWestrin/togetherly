import { useState, useMemo } from "react";
import { GuestUser } from "../../types/wedding";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import FormCheckbox from "../ui/FormCheckbox";
import Badge from "../ui/Badge";
import { BadgeProps } from "../ui/Badge";

interface GuestListProps {
  guests: GuestUser[];
  onDeleteGuests: (guestIds: string[]) => void;
  onUpdateRSVP: (
    guestIds: string[],
    status: "pending" | "confirmed" | "declined"
  ) => void;
  onEditGuest: (guest: GuestUser) => void;
}

type SortField = "name" | "role" | "dietaryPreferences" | "rsvpStatus";
type SortDirection = "asc" | "desc";

const GuestList: React.FC<GuestListProps> = ({
  guests,
  onDeleteGuests,
  onUpdateRSVP,
  onEditGuest,
}) => {
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedGuests = useMemo(() => {
    return [...guests].sort((a, b) => {
      let aValue: string = "";
      let bValue: string = "";

      switch (sortField) {
        case "name":
          aValue = `${a.profile?.firstName || ""} ${
            a.profile?.lastName || ""
          }`.trim();
          bValue = `${b.profile?.firstName || ""} ${
            b.profile?.lastName || ""
          }`.trim();
          break;
        case "role":
          aValue = a.guestDetails?.[0]?.role || "";
          bValue = b.guestDetails?.[0]?.role || "";
          break;
        case "rsvpStatus":
          aValue = a.guestDetails?.[0]?.rsvpStatus || "";
          bValue = b.guestDetails?.[0]?.rsvpStatus || "";
          break;
        case "dietaryPreferences":
          aValue = a.guestDetails?.[0]?.dietaryPreferences || "";
          bValue = b.guestDetails?.[0]?.dietaryPreferences || "";
          break;
      }

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [guests, sortField, sortDirection]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedGuests(checked ? guests.map((g) => g._id) : []);
  };

  const handleDeleteGuests = (guestIds: string[]) => {
    onDeleteGuests(guestIds);
    setSelectedGuests([]);
  };

  const handleSelectGuest = (guestId: string, checked: boolean) => {
    setSelectedGuests((prev) =>
      checked ? [...prev, guestId] : prev.filter((id) => id !== guestId)
    );
  };

  const getRSVPStatusBadgeColor = (status?: string): BadgeProps["color"] => {
    switch (status) {
      case "confirmed":
        return "green";
      case "declined":
        return "red";
      default:
        return "yellow";
    }
  };

  const getRSVPStatusDisplay = (status?: string): string => {
    switch (status) {
      case "confirmed":
        return "Attending";
      case "declined":
        return "Not coming";
      default:
        return "Pending";
    }
  };

  return (
    <div>
      {selectedGuests.length > 0 && (
        <div className="bg-white shadow-sm border-t border-dark-200 flex items-center justify-between pt-3 pb-9 px-5 md:p-3 bottom-14 fixed md:bottom-0 left-0 w-full md:w-full-minus-nav md:ml-desktop-nav 2xl:w-full-minus-nav-2xl 2xl:ml-desktop-nav-2xl">
          <Typography element="p">
            {selectedGuests.length} guest{selectedGuests.length > 1 ? "s" : ""}{" "}
            selected
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => onUpdateRSVP(selectedGuests, "confirmed")}
            >
              Mark as Attending
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleDeleteGuests(selectedGuests)}
            >
              <Trash2 className="w-4 h-4" /> Delete selected
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dark-500 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-100">
            <tr className="border-b border-dark-300">
              <th className="px-7 py-5 text-left">
                <FormCheckbox
                  label=""
                  size="small"
                  checked={selectedGuests.length === guests.length}
                  onChange={(checked) => handleSelectAll(checked)}
                />
              </th>
              {[
                "Name",
                "Role",
                "Dietary preferences",
                "RSVP status",
                "Actions",
              ].map((header, index) => (
                <th
                  key={header}
                  className="p-3 text-left text-base font-semibold text-gray-800 cursor-pointer"
                  onClick={() => {
                    if (index < 4) {
                      // Don't sort on Actions column
                      handleSort(
                        header.toLowerCase().replace(" ", "") as SortField
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortField === header.toLowerCase().replace(" ", "") &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-dark-600">
            {sortedGuests.map((guest) => {
              const guestDetails = guest.guestDetails?.[0] || {};

              return (
                <tr
                  key={guest._id}
                  className="border-b border-dark-300 last:border-b-0"
                >
                  <td className="px-7 py-4">
                    <FormCheckbox
                      label=""
                      size="small"
                      checked={selectedGuests.includes(guest._id)}
                      onChange={(checked) =>
                        handleSelectGuest(guest._id, checked)
                      }
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div>
                      <p className="text-dark-800 font-medium">
                        {guest.profile?.firstName || ""}{" "}
                        {guest.profile?.lastName || ""}
                      </p>
                      {guest.email && (
                        <p className="text-sm text-dark-600">{guest.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4">{guestDetails.role || "Guest"}</td>
                  <td className="px-3 py-4">
                    {guestDetails.dietaryPreferences || "None specified"}
                  </td>
                  <td className="px-3 py-4">
                    <Badge
                      color={getRSVPStatusBadgeColor(guestDetails.rsvpStatus)}
                    >
                      {getRSVPStatusDisplay(guestDetails.rsvpStatus)}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="icon"
                        size="icon"
                        tooltip="Edit guest"
                        onClick={() => onEditGuest(guest)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="icon"
                        size="icon"
                        tooltip="Delete guest"
                        onClick={() => handleDeleteGuests([guest._id])}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestList;
