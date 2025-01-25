import { CreateAccountForm } from "../components/CreateAccountForm";
import { useAuthStore } from "../stores/useAuthStore";
import { Navigate, Link } from "react-router-dom";
import { Typography } from "../components/ui/Typography";
import Rings from "../assets/icons/icon-rings.svg?react";

const CreateAccount: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isNewUser = useAuthStore((state) => state.user?.isNewUser);

  if (isAuthenticated && !isNewUser) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full flex flex-col items-center">
          <Rings className="w-2/7 h-auto mb-6" />
          <Typography
            element="h1"
            styledAs="h2"
            className="mb-8"
          >
            Sign up to Togetherly
          </Typography>
          <CreateAccountForm />
          <p className="mt-6 text-center text-dark-850">
            Already have an account?{" "}
            <Link
              to="/login"
              aria-label="Already have an account? Log in"
              className="text-primary-600 hover:text-primary-700 font-semibold underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default CreateAccount;
