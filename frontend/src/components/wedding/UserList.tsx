import { CoupleUser, GuestUser, UserStatus } from "../../types/wedding";
import Badge from "../ui/Badge";
import { Button } from "../ui/Button";
import { Edit2, Trash2 } from "lucide-react";

interface UserListProps {
  users: (CoupleUser | GuestUser)[];
  type: "couple" | "admin";
  onEditUser?: (user: CoupleUser | GuestUser) => void;
  onDeleteUser?: (userId: string) => void;
}

const determineUserStatus = (user: CoupleUser | GuestUser): UserStatus => {
  if (user.isRegistered) return "Active";
  if ("guestDetails" in user) return "Invited";
  return "Pending";
};

const UserList: React.FC<UserListProps> = ({
  users,
  type,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dark-500 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-100">
          <tr className="border-b border-dark-300">
            <th className="p-3 lg:pl-8 text-left text-sm lg:text-base font-semibold text-gray-800">
              Name
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              Role
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              Status
            </th>
            <th className="p-3 lg:pr-8 text-right text-sm lg:text-base font-semibold text-gray-800">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-sm lg:text-base text-dark-600">
          {users.map((user) => {
            const isGuest = "guestDetails" in user;
            const role = isGuest ? user.guestDetails[0]?.role : "Couple";
            const status = determineUserStatus(user);

            return (
              <tr
                key={user._id}
                className="border-b border-dark-300 last:border-b-0"
              >
                <td className="px-3 lg:pl-8 py-2 lg:py-4">
                  <div>
                    <p className="text-dark-800 font-medium">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </p>
                    {user.email && (
                      <p className="text-sm text-dark-600">{user.email}</p>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 lg:py-4">{role}</td>
                <td className="px-3 py-2 lg:py-4">
                  <Badge
                    color={
                      status === "Active"
                        ? "green"
                        : status === "Pending"
                        ? "yellow"
                        : "gray"
                    }
                  >
                    {status}
                  </Badge>
                </td>
                <td className="px-3 lg:pr-8 py-2 lg:py-4 text-right">
                  <div className="flex gap-2 lg:gap-4 justify-end">
                    {onEditUser && (
                      <Button
                        variant="icon"
                        size="icon"
                        tooltip="Edit user"
                        aria-label={`Edit user ${user.profile?.firstName} ${user.profile?.lastName}`}
                        onClick={() => onEditUser(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteUser && (
                      <Button
                        variant="icon"
                        size="icon"
                        tooltip="Delete user"
                        aria-label={`Delete user ${user.profile?.firstName} ${user.profile?.lastName}`}
                        onClick={() => onDeleteUser(user._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
