import { useEffect, useState } from "react";
import styles from "./ChatLayout.module.css";
import ChatMain from "./ChatMain/ChatMain";
import ConversationSidebar from "./ConversationSidebar/ConversationSidebar";
import SideNavigation from "./SideNavigation/SideNavigation";
import { CHAT_TABS, CONTACTS_TAB } from "../../constants/contactsMenu";
import { useChat } from "../../contexts/ChatContext";
import ComingSoonBoard from "./ComingSoon/ComingSoonBoard";
function ChatLayout() {
  const { leftTab, currentConversation, setCurrentConversation, selected } = useChat();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");

    const onChange = (e) => {
      setIsCompact(e.matches);
    };

    setIsCompact(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
    } else {
      mq.addListener(onChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", onChange);
      } else {
        mq.removeListener(onChange);
      }
    };
  }, []);

  const isMobileMessages = leftTab === CHAT_TABS.MESSAGES && isCompact;

  const shouldShowConversationSidebar =
    !isMobileMessages || !currentConversation;

  const shouldShowChatMain =
    !isMobileMessages || !!currentConversation;

  const handleBackToList = () => {
    setCurrentConversation(null);
  };
  const isMaintenanceTab = 
      leftTab === CHAT_TABS.CONTACTS && (
        selected === CONTACTS_TAB.GROUPS || 
        selected === CONTACTS_TAB.GROUP_INVITES
      );
  console.log("Tab lớn:", leftTab, "| Tab con:", selected, "| Bảo trì:", isMaintenanceTab);
  return (
    <div className={styles.wrapper}>
      <div className={styles.sideNavigation}>
        <SideNavigation />
      </div>
      {shouldShowConversationSidebar && (
        <div className={styles.conversationSidebar}>
          <ConversationSidebar />
        </div>
      )}
      {shouldShowChatMain && (
        <div className={styles.chatMain}>
        {isMaintenanceTab ? (
            <ComingSoonBoard title="Tính năng đang phát triển" />
          ) : (  
          <ChatMain
            isMobileMessages={isMobileMessages}
            onBackToList={handleBackToList}
          />
      )}
        </div>
      )}
    </div>
  );
}
export default ChatLayout;
