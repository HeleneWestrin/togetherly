import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Welcome to Togetherly
        </h1>

        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/create-account")}
          >
            Create account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
