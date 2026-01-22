import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { CHAT_TABS } from "../constants/contactsMenu";
import { AuthService } from "../services/auth.service";
import conversationApi from "../api/conversationApi";
import WebSocketService from "../services/WebSocketService";

import { bindTingUnlockOnce, playTingSound } from "../utils/sound"; //  NEW

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

  // Typing indicator
  const [typingUsers, setTypingUsers] = useState([]);

  // Read receipts
  const [readBy, setReadBy] = useState(null);

  // Current user
  const currentUser = AuthService.getUser();

  // Refs for stable callbacks
  const currentConversationRef = useRef(currentConversation);
  const conversationsRef = useRef(conversations);
  const hasInitialized = useRef(false);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    conversationsRef.current = conversations; //
  }, [conversations]);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      console.log("[ChatContext] loadConversations - calling API...");
      const data = await conversationApi.getConversations();
      console.log("[ChatContext] loadConversations - API returned:", data);
      setConversations(data || []);
    } catch (error) {
      console.error("[ChatContext] Error loading conversations:", error);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    loadConversations();
  }, [currentUser?.id, loadConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setIsLoadingMessages(true);
    try {
      const data = await conversationApi.getMessages(conversationId);
      setMessages(data || []);
    } catch (error) {
      console.error("[ChatContext] Error loading messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Subscribe to typing events for a conversation
  const subscribeToTyping = useCallback(
      (conversationId) => {
        if (!conversationId) return;

        WebSocketService.subscribe(
            `/topic/conversation/${conversationId}/typing`,
            (typingData) => {
              if (typingData.userId === currentUser?.id) return;

              setTypingUsers((prev) => {
                if (typingData.typing) {
                  if (prev.some((u) => u.userId === typingData.userId)) return prev;
                  return [...prev, typingData];
                } else {
                  return prev.filter((u) => u.userId !== typingData.userId);
                }
              });
            }
        );
      },
      [currentUser?.id]
  );

  // Mark messages as read
  const markAsRead = useCallback((conversationId) => {
    if (!conversationId) return;

    WebSocketService.send("/app/chat.markRead", {
      conversationId: conversationId,
    });
  }, []);

  // Subscribe to read receipt events
  const subscribeToReadReceipts = useCallback((conversationId) => {
    if (!conversationId) return;

    WebSocketService.subscribe(
        `/topic/conversation/${conversationId}/read`,
        (readReceipt) => {
          setMessages((prev) =>
              prev.map((msg) => ({
                ...msg,
                isRead: true,
              }))
          );
        }
    );
  }, []);

  // Subscribe to specific conversation topic
  const subscribeToConversation = useCallback(
      (conversationId) => {
        if (!conversationId) return;

        WebSocketService.subscribe(`/topic/conversation/${conversationId}`, (response) => {
          if (response.readerId) {
            setMessages((prev) =>
                prev.map((msg) => ({
                  ...msg,
                  isRead: true,
                }))
            );
            return;
          }

          // Update conversation preview
          setConversations((prev) =>
              prev.map((conv) =>
                  conv.id === conversationId
                      ? {
                        ...conv,
                        lastMessage: response.content,
                        lastMessageTime: response.createdAt,
                      }
                      : conv
              )
          );

          const currentConv = currentConversationRef.current;
          if (currentConv && currentConv.id === conversationId) {
            if (response.conversationId && response.conversationId !== currentConv.id) return;

            setMessages((prev) => {
              if (prev.some((m) => m.id === response.id)) return prev;
              return [...prev, response];
            });

            setTypingUsers((prev) => prev.filter((u) => u.userId !== response.sender?.id));

            if (currentUser?.id && response.sender?.id !== currentUser.id) {
              markAsRead(conversationId);
            }
          }
        });
      },
      [currentUser, markAsRead]
  );

  // Select a conversation
  const selectConversation = useCallback(
      (conversation) => {
        setCurrentConversation(conversation);
        setTypingUsers([]);
        setReadBy(null);

        if (conversation && conversation.id) {
          loadMessages(conversation.id);
          subscribeToConversation(conversation.id);
          subscribeToTyping(conversation.id);
          subscribeToReadReceipts(conversation.id);
          markAsRead(conversation.id);
        } else {
          setMessages([]);
        }
      },
      [loadMessages, subscribeToConversation, subscribeToTyping, subscribeToReadReceipts, markAsRead]
  );

  // Start a new conversation with a user
  const startNewConversation = useCallback(
      (user) => {
        const existing = conversations.find((c) =>
            c.participants?.some((p) => p.id === user.id)
        );

        if (existing) {
          selectConversation(existing);
        } else {
          const tempConv = {
            id: null,
            participants: [user],
            isTemp: true,
            recipientId: user.id,
            name: user.fullName || user.username,
            avatarUrl: user.avatar || user.avatarUrl,
            isGroup: false,
            isOnline: false,
            lastMessage: "",
            lastMessageTime: new Date().toISOString(),
          };
          setCurrentConversation(tempConv);
          setMessages([]);
        }
      },
      [conversations, selectConversation]
  );

  //  Send a message
  const sendMessage = useCallback((content, options = {}) => {
    const conv = currentConversationRef.current;
    if (!conv || !content.trim()) return;

    const messagePayload = { content: content.trim() };

    if (conv.id) {
      messagePayload.conversationId = conv.id;
      subscribeToReadReceipts(conv.id);
    } else if (conv.recipientId) {
      messagePayload.recipientId = conv.recipientId;
    } else {
      return;
    }

    // mentionedUserIds optional
    if (Array.isArray(options.mentionedUserIds) && options.mentionedUserIds.length > 0) {
      messagePayload.mentionedUserIds = options.mentionedUserIds;
    }

    WebSocketService.send("/app/chat.send", messagePayload);
  }, [subscribeToReadReceipts]);

  const sendTypingStatus = useCallback((isTyping) => {
    const conv = currentConversationRef.current;
    if (!conv?.id) return;

    WebSocketService.send("/app/chat.typing", {
      conversationId: conv.id,
      typing: isTyping,
    });
  }, []);

  // Initialize WebSocket and subscribe to user queue (ONCE)
  useEffect(() => {
    if (!currentUser?.id || hasInitialized.current) return;

    bindTingUnlockOnce(); // unlock audio

    hasInitialized.current = true;

    WebSocketService.connect(() => {
      // Subscribe to user's personal queue
      WebSocketService.subscribe(`/user/queue/messages`, (message) => {
        const latestConversation = currentConversationRef.current;

        const convId = message?.conversationId;
        const currentConvId = latestConversation?.id;

        const isFromMe = message?.sender?.id === currentUser?.id;
        const isSystem = message?.isSystem === true;

        // TING cho tin nhắn mới (không phải conv đang mở), tôn trọng mute
        if (!isFromMe && !isSystem && convId && convId !== currentConvId) {
          const conv = conversationsRef.current?.find((c) => c.id === convId);
          const muted = conv?.muted === true;
          if (!muted) playTingSound();
        }

        // Add message to current view ONLY if it belongs to the current conversation
        if (latestConversation && latestConversation.id === convId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });

          if (currentUser?.id && message.sender?.id !== currentUser.id) {
            markAsRead(convId);
          }
        }

        // Upgrade temp conversation to real
        if (latestConversation?.isTemp && convId) {
          setCurrentConversation((prev) => ({
            ...prev,
            id: convId,
            isTemp: false,
          }));
          subscribeToConversation(convId);
          subscribeToReadReceipts(convId);
        }

        // Update conversations list
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === convId);
          if (existing) {
            return prev.map((conv) =>
                conv.id === convId
                    ? {
                      ...conv,
                      lastMessage: message.content,
                      lastMessageTime: message.createdAt,
                    }
                    : conv
            );
          } else {
            loadConversations();
            return prev;
          }
        });
      });

      WebSocketService.subscribe(`/user/queue/read-receipts`, (readReceipt) => {
        const latestConversation = currentConversationRef.current;
        if (latestConversation?.id === readReceipt.conversationId) {
          setMessages((prev) =>
              prev.map((msg) => ({
                ...msg,
                isRead: true,
              }))
          );
        }
      });

      loadConversations();
    });

    return () => {};
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
      <ChatContext.Provider
          value={{
            leftTab,
            setLeftTab,
            selected,
            setSelected,
            conversations,
            currentConversation,
            messages,
            isLoadingMessages,
            currentUser,
            typingUsers,
            readBy,

            loadConversations,
            loadMessages,
            selectConversation,
            startNewConversation,
            sendMessage,
            sendTypingStatus,
            markAsRead,
            setCurrentConversation,
            setMessages,
            setConversations,
          }}
      >
        {children}
      </ChatContext.Provider>
  );
};

export function useChat() {
  return useContext(ChatContext);
}
