import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateAccount from "../pages/CreateAccount";
import PrivateRoute from "./PrivateRouter";
import Home from "../pages/Home";
import WeddingBudget from "../pages/WeddingBudget";

/**
 * Main router component that handles all application routing
 * Uses React Router v6 for client-side routing
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - accessible to all users */}
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<CreateAccount />}
        />

        {/* Private routes - require authentication */}
        {/* PrivateRoute component checks auth status and redirects if not logged in */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Dynamic route with URL parameter :weddingSlug */}
        {/* Also protected by PrivateRoute wrapper */}
        <Route
          path="/wedding/:weddingSlug"
          element={
            <PrivateRoute>
              <WeddingBudget />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
