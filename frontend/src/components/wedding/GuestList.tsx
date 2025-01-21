import { GuestUser } from "../../types/wedding";
interface GuestListProps {
  guests: GuestUser[];
}

const GuestList: React.FC<GuestListProps> = ({ guests }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
      <div className="grid gap-4 md:grid-cols-2">
        {guests.map((guest) => (
          <div
            key={guest._id}
            className="p-3 bg-gray-50 rounded"
          >
            <p className="font-semibold">
              {guest.profile.firstName} {guest.profile.lastName}
            </p>
            <p className="text-dark-600 text-sm">{guest.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;
