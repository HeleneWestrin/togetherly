import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateUser from "../pages/CreateUser";
import PrivateRoute from "./PrivateRouter";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/create-account"
          element={<CreateUser />}
        />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
