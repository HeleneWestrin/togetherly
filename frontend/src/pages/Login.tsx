import { LoginForm } from "../components/LoginForm";
import { Typography } from "../components/ui/Typography";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";
import Logo from "../assets/togetherly-logo.svg?react";
import Rings from "../assets/icons/icon-rings.svg?react";

const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  /**
   * Effect hook to handle automatic navigation for authenticated users
   * If user is already authenticated, redirects them based on their wedding data:
   * - Single wedding -> Wedding details page
   * - Multiple/No weddings -> Dashboard
   */

  useEffect(() => {
    if (isAuthenticated) {
      navigateBasedOnWeddings(navigate);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-landscape p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        <Rings className="w-2/7 h-auto mb-6" />
        <Logo className="h-auto mb-4" />
        <Typography
          element="h1"
          styledAs="h2"
          className="mb-4"
        >
          Log in
        </Typography>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
