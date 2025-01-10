import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

export default PrivateRoute;
