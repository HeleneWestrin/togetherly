import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Props interface for the PrivateRoute component
 * Requires a single child element of type JSX.Element
 */
interface PrivateRouteProps {
  children: JSX.Element;
}

/**
 * Higher-order component (HOC) that protects routes from unauthorized access
 *
 * How it works:
 * 1. Checks if user is authenticated using the auth store
 * 2. If authenticated: renders the protected route (children)
 * 3. If not authenticated: redirects to login page
 *
 * @param children - The protected route/component to render if authenticated
 * @returns Either the protected component or a redirect to login
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  // If user is authenticated, render the protected route
  // Otherwise, redirect to login page (replace prevents back button from returning)
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
