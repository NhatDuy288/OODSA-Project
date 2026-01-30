import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { BackgroundChatProvider } from "./contexts/BackgroundChatContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { WebSocketProvider } from "./contexts/WebSocketProvider";
import { ChatProvider } from "./contexts/ChatContext";

function App() {
    const [, forceRerender] = useState(0);

    useEffect(() => {
        const handler = () => {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            forceRerender((x) => x + 1); // để ProtectedRoute re-check token và redirect
        };
        window.addEventListener("unauthorized", handler);
        return () => window.removeEventListener("unauthorized", handler);
    }, []);

    return (
        <>
            <ToastContainer position="top-right" autoClose={4000} newestOnTop pauseOnHover />
            <BackgroundChatProvider>
                <WebSocketProvider>
                    <NotificationsProvider>
                        <ChatProvider>
                            <AppRouter />
                        </ChatProvider>
                    </NotificationsProvider>
                </WebSocketProvider>
            </BackgroundChatProvider>
        </>
    );
}

export default App;
