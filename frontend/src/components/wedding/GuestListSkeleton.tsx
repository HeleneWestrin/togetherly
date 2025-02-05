import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const GuestListSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-dark-500 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-100">
          <tr className="border-b border-dark-300">
            <th className="flex items-center px-5 lg:px-7 py-3 lg:py-4 min-h-[60px] text-left">
              <Skeleton
                borderRadius={4}
                width={20}
                height={20}
                baseColor="#828d8d"
                highlightColor="#9aa5a5"
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
                key={index}
                className={`p-3 text-left text-sm lg:text-base font-semibold text-gray-800 ${
                  index === 4 ? "text-right lg:pr-8" : ""
                }`}
              >
                <Skeleton
                  width={80}
                  baseColor="#828d8d"
                  highlightColor="#9aa5a5"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm lg:text-base text-dark-600">
          {[1, 2, 3, 4].map((row) => (
            <tr
              key={row}
              className="border-b border-dark-300 last:border-b-0"
            >
              <td className="px-5 lg:px-7 py-2 lg:py-3.5">
                <Skeleton
                  borderRadius={4}
                  width={20}
                  height={20}
                />
              </td>
              <td className="px-3 py-2 lg:py-3.5">
                <Skeleton
                  width={120}
                  height={16}
                  borderRadius={16}
                />
                <Skeleton
                  width={100}
                  height={14}
                  borderRadius={14}
                  className="mt-1"
                />
              </td>
              <td className="px-3 py-4">
                <Skeleton
                  width={80}
                  height={18}
                  borderRadius={18}
                />
              </td>
              <td className="px-3 py-4">
                <Skeleton
                  width={90}
                  height={18}
                  borderRadius={18}
                />
              </td>
              <td className="px-3 py-4">
                <Skeleton
                  width={70}
                  height={18}
                  borderRadius={18}
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

export default GuestListSkeleton;
