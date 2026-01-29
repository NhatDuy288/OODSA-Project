import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "../views/Messages/Messages";
import Login from "../views/Auth/Login/Login";
import Register from "../views/Auth/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRouter() {
    return (
        <Routes>
            {/* Trang gốc */}
            <Route path="/" element={<Navigate to="/messages" replace />} />

            {/* Protected (cần login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/messages" element={<Messages />} />
            </Route>

            {/* Public (chỉ cho CHƯA login) */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;