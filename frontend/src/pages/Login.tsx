import { LoginForm } from "../components/LoginForm";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-200 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
