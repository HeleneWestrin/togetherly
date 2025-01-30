import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAuthStore } from "../stores/useAuthStore";
import WeddingNavigation from "../components/navigation/WeddingNavigation";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateAccount from "../pages/CreateAccount";
import PrivateRoute from "./PrivateRouter";
import Home from "../pages/Home";
import WeddingBudget from "../pages/WeddingBudget";
import WeddingGuests from "../pages/WeddingGuests";
import Onboarding from "../pages/Onboarding";
import WeddingSchedule from "../pages/WeddingSchedule";
import WeddingUsers from "../pages/WeddingUsers";
import ScrollToTop from "../components/ScrollToTop";
import WeddingMore from "../pages/WeddingMore";
/**
 * Main router component that handles all application routing
 * Uses React Router v6 for client-side routing
 */
const AppContent = () => {
  const isMobile = useIsMobile();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Check if current route is a wedding route
  const isWeddingRoute = location.pathname.includes("/wedding/");

  return (
    <div
      className={`min-h-svh ${
        isAuthenticated && isWeddingRoute
          ? isMobile
            ? "pb-20"
            : "ml-desktop-nav 2xl:ml-desktop-nav-2xl"
          : ""
      }`}
    >
      <ScrollToTop />
      <Routes>
        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />

        {/* Wedding-specific routes */}
        <Route
          path="/wedding/:weddingSlug/*"
          element={
            <>
              <WeddingNavigation />
              <Routes>
                <Route
                  path="budget"
                  element={
                    <PrivateRoute>
                      <WeddingBudget />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="schedule"
                  element={
                    <PrivateRoute>
                      <WeddingSchedule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="guests"
                  element={
                    <PrivateRoute>
                      <WeddingGuests />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PrivateRoute>
                      <WeddingUsers />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="more"
                  element={
                    <PrivateRoute>
                      <WeddingMore />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </>
          }
        />

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
      </Routes>
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default AppRouter;
