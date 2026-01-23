import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "../services/auth.service";

const PublicRoute = () => {
  const isAuth = AuthService.isAuthenticated();

  if (isAuth) {
    return <Navigate to="/messages" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
