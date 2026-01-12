import WebSocketService from "../../services/WebSocketService";
import { useEffect } from "react";
import { AuthService } from "../../services/auth.service";
import { ChatProvider } from "../../contexts/ChatContext";
import ChatLayout from "../../layouts/ChatLayout/ChatLayout";
function Messages() {
  useEffect(() => {
    WebSocketService.connect(
      () => {
        console.log("Kết nối với web socket");
        const currentUser = AuthService.getUser();
        if (currentUser) {
          WebSocketService.send("/app/user/connect", {
            username: currentUser.username,
            status: "ONLINE",
          });
        }
      },
      (error) => {
        console.log("Lỗi khi kết nối vưới websocket", error);
      }
    );
    return () => {
      WebSocketService.disconnect();
    };
  }, []);
  return (
    <>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </>
  );
}
export default Messages;
