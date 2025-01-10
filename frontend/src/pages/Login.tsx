import { LoginForm } from "../components/LoginForm";

const Login: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
