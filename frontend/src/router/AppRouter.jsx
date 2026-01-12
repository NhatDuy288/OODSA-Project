import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "../views/Messages/Messages";
import Login from "../views/Auth/Login/Login";
import Register from "../views/Auth/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import { AuthService } from "../services/auth.service";
function AppRouter() {
  const isAuth = AuthService.isAuthenticated();
  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/messages" element={<Messages />} />
        </Route>
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/messages" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuth ? <Navigate to="/messages" replace /> : <Register />}
        />
      </Routes>
    </>
  );
}
export default AppRouter;
