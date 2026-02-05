import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "../services/auth.service";

const ProtectedRoute = () => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
