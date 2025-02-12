import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const UserListSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-dark-500 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-200">
          <tr className="border-b border-dark-300">
            <th className="p-3 lg:pl-8 text-left text-sm lg:text-base font-semibold text-gray-800">
              <Skeleton
                width={60}
                baseColor="#828d8d"
                highlightColor="#9aa5a5"
              />
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              <Skeleton
                width={60}
                baseColor="#828d8d"
                highlightColor="#9aa5a5"
              />
            </th>
            <th className="p-3 text-left text-sm lg:text-base font-semibold text-gray-800">
              <Skeleton
                width={60}
                baseColor="#828d8d"
                highlightColor="#9aa5a5"
              />
            </th>
            <th className="p-3 lg:pr-8 text-right text-sm lg:text-base font-semibold text-gray-800">
              <Skeleton
                width={50}
                baseColor="#828d8d"
                highlightColor="#9aa5a5"
              />
            </th>
          </tr>
        </thead>
        <tbody className="text-sm lg:text-base text-dark-600">
          {[1, 2].map((index) => (
            <tr
              key={index}
              className="border-b border-dark-300 last:border-b-0"
            >
              <td className="px-3 lg:pl-8 py-2 lg:py-4">
                <Skeleton
                  width={140}
                  height={20}
                />
                <Skeleton
                  width={100}
                  height={16}
                  className="mt-1"
                />
              </td>
              <td className="px-3 py-2 lg:py-4">
                <Skeleton
                  width={80}
                  height={20}
                />
              </td>
              <td className="px-3 py-2 lg:py-4">
                <Skeleton
                  width={80}
                  height={20}
                />
              </td>
              <td className="px-3 lg:pr-8 py-2 lg:py-4 text-right">
                <div className="flex gap-2 lg:gap-4 justify-end">
                  <Skeleton
                    width={32}
                    height={32}
                    circle
                  />
                  <Skeleton
                    width={32}
                    height={32}
                    circle
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListSkeleton;
