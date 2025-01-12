import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { WeddingList } from "../components/WeddingList";
import Button from "../components/ui/Button";

const Dashboard: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      <div className="space-y-8">
        <WeddingList />
      </div>
    </div>
  );
};

export default Dashboard;
