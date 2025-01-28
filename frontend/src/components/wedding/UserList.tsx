import { CoupleUser, GuestUser, UserStatus } from "../../types/wedding";
import Badge from "../ui/Badge";

interface UserListProps {
  users: (CoupleUser | GuestUser)[];
  type: "couple" | "admin";
}

const determineUserStatus = (user: CoupleUser | GuestUser): UserStatus => {
  console.log(user.isRegistered);
  if (user.isRegistered) return "Active";
  if ("guestDetails" in user) return "Invited";
  return "Pending";
};

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="bg-white rounded-2xl border border-dark-500 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-100">
          <tr className="border-b border-dark-300">
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              Name
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              Role
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              Status
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
                <td className="px-3 py-2 lg:py-4">
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
