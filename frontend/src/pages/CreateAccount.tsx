import { CreateAccountForm } from "../components/CreateAccountForm";
import { useAuthStore } from "../stores/useAuthStore";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-landscape p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>
        <CreateAccountForm />
      </div>
    </div>
  );
};

export default Login;
