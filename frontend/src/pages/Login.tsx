import { LoginForm } from "../components/LoginForm";
import { Typography } from "../components/ui/Typography";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";
import Rings from "../assets/icons/icon-rings.svg?react";

const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isNewUser = useAuthStore((state) => state.user?.isNewUser);
  const navigate = useNavigate();

  /**
   * Effect hook to handle automatic navigation for authenticated users
   * If user is already authenticated, redirects them based on their wedding data:
   * - Single wedding -> Wedding details page
   * - Multiple/No weddings -> Dashboard
   */

  useEffect(() => {
    if (isAuthenticated) {
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigateBasedOnWeddings(navigate);
      }
    }
  }, [isAuthenticated, isNewUser, navigate]);

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
            Log in to Togetherly
          </Typography>
          <LoginForm />
          <p className="mt-6 text-center text-dark-850">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              aria-label="Don't have an account yet? Sign up"
              className="text-primary-600 hover:text-primary-700 font-semibold underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default Login;
