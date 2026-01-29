import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "../views/Messages/Messages";
import SocialLayout from "../layouts/SocialLayout/SocialLayout";
import Feed from "../views/Social/Feed/Feed";
import Profile from "../views/Social/Profile/Profile";
import Login from "../views/Auth/Login/Login";
import Register from "../views/Auth/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRouter() {
    return (
        <Routes>
            {/* Trang gốc */}
            <Route path="/" element={<Navigate to="/feed" replace />} />

            {/* Protected (cần login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/messages" element={<Messages />} />

                {/* Social UI (Facebook-like) */}
                <Route element={<SocialLayout />}>
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                </Route>
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
