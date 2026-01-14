import WebSocketService from "../../services/WebSocketService";
import { useEffect } from "react";
import { AuthService } from "../../services/auth.service";
import { ChatProvider, useChat } from "../../contexts/ChatContext";
import ChatLayout from "../../layouts/ChatLayout/ChatLayout";

function MessagesContent() {
  const { loadConversations, subscribeToMessages } = useChat();

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

          // Subscribe to messages after connection
          subscribeToMessages();
        }
      },
      (error) => {
        console.log("Lỗi khi kết nối vưới websocket", error);
      }
    );

    // Load conversations
    loadConversations();

    return () => {
      WebSocketService.disconnect();
    };
  }, [loadConversations, subscribeToMessages]);

  return <ChatLayout />;
}

function Messages() {
  return (
    <ChatProvider>
      <MessagesContent />
    </ChatProvider>
  );
}
export default Messages;
