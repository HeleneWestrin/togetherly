import { useSecrets } from "../hooks/useSecrets";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useSecrets();

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return <p>Loading secrets...</p>;
  }

  if (error) {
    return (
      <p className="text-red-600">
        Error fetching secrets:{" "}
        {error?.response?.data?.message || error.message}
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">This is a protected page. You must be logged in.</p>
      {data && (
        <div className="bg-gray-200 p-4 rounded shadow">
          <p>
            <strong>Secret:</strong> {data.secret}
          </p>
          <p>
            <strong>User ID:</strong> {data.userId}
          </p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
