import { createContext, useContext, useState, useCallback } from "react";
import { CHAT_TABS } from "../constants/contactsMenu";
import WebSocketService from "../services/WebSocketService";
import { AuthService } from "../services/auth.service";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  // Tab navigation
  const [leftTab, setLeftTab] = useState(CHAT_TABS.MESSAGES);
  const [selected, setSelected] = useState(null);

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Current user
  const currentUser = AuthService.getUser();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      // TODO: Replace with API call when backend is ready
      // const response = await conversationApi.getConversations();
      // setConversations(response.data);

      // Mock data for testing UI
      setConversations([
        {
          id: 1,
          name: "Nguyễn Văn A",
          avatarUrl: null,
          lastMessage: "Xin chào, bạn khỏe không?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          isGroup: false,
          isOnline: true,
        },
        {
          id: 2,
          name: "Nhóm Dự án LTM",
          avatarUrl: null,
          lastMessage: "Deadline ngày mai nhé!",
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0,
          isGroup: true,
          participantCount: 5,
        },
        {
          id: 3,
          name: "Trần Thị B",
          avatarUrl: null,
          lastMessage: "Ok, hẹn gặp lại!",
          lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
          unreadCount: 0,
          isGroup: false,
          isOnline: false,
        },
      ]);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setIsLoadingMessages(true);
    try {
      // TODO: Replace with API call when backend is ready
      // const response = await conversationApi.getMessages(conversationId);
      // setMessages(response.data);

      // Mock data for testing UI
      setMessages([
        {
          id: 1,
          content: "Xin chào!",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          isRead: true,
          sender: { id: 999, fullName: "Nguyễn Văn A" },
        },
        {
          id: 2,
          content: "Chào bạn, mình là sinh viên UTH!",
          createdAt: new Date(Date.now() - 7000000).toISOString(),
          isRead: true,
          sender: { id: currentUser?.id, fullName: currentUser?.fullName },
        },
        {
          id: 3,
          content: "Bạn học ngành gì vậy?",
          createdAt: new Date(Date.now() - 6800000).toISOString(),
          isRead: true,
          sender: { id: 999, fullName: "Nguyễn Văn A" },
        },
        {
          id: 4,
          content: "Mình học Công nghệ thông tin, còn bạn?",
          createdAt: new Date(Date.now() - 6600000).toISOString(),
          isRead: true,
          sender: { id: currentUser?.id, fullName: currentUser?.fullName },
        },
        {
          id: 5,
          content: "Xin chào, bạn khỏe không?",
          createdAt: new Date().toISOString(),
          isRead: false,
          sender: { id: 999, fullName: "Nguyễn Văn A" },
        },
      ]);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUser]);

  // Select a conversation
  const selectConversation = useCallback((conversation) => {
    setCurrentConversation(conversation);
    if (conversation) {
      loadMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, [loadMessages]);

  // Send a message
  const sendMessage = useCallback((content) => {
    if (!currentConversation || !content.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: {
        id: currentUser?.id,
        fullName: currentUser?.fullName,
      },
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);

    // Send via WebSocket
    WebSocketService.send("/app/chat.send", {
      conversationId: currentConversation.id,
      content: content.trim(),
    });

    // Update last message in conversations list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation.id
          ? {
            ...conv,
            lastMessage: content.trim(),
            lastMessageTime: new Date().toISOString(),
          }
          : conv
      )
    );
  }, [currentConversation, currentUser]);

  // Subscribe to messages (call this after WebSocket connects)
  const subscribeToMessages = useCallback(() => {
    if (!currentUser) return;

    WebSocketService.subscribe(`/user/${currentUser.username}/queue/messages`, (message) => {
      // Add received message
      setMessages((prev) => [...prev, message]);

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: conv.id !== currentConversation?.id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount,
            }
            : conv
        )
      );
    });
  }, [currentUser, currentConversation]);

  return (
    <ChatContext.Provider
      value={{
        // Tab navigation
        leftTab,
        setLeftTab,
        selected,
        setSelected,

        // Conversations
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation: selectConversation,
        loadConversations,

        // Messages
        messages,
        setMessages,
        isLoadingMessages,
        sendMessage,
        loadMessages,

        // WebSocket
        subscribeToMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  return useContext(ChatContext);
}
