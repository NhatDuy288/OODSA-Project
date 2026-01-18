import styles from "./ConversationItem.module.css";
import { AuthService } from "../../../services/auth.service";
import Avatar from "../../Avatar/Avatar";

function ConversationItem({ conversation, active, onClick }) {
    const currentUser = AuthService.getUser();
    const {
        name,
        avatarUrl,
        lastMessage,
        lastMessageTime,
        unreadCount,
        isGroup,
        isOnline,
        participants,
    } = conversation;

    const getDisplayName = () => {
        if (name) return name;
        if (isGroup) return "Nhóm chat";

        const otherParticipant = participants?.find((p) => p.id !== currentUser?.id);
        return otherParticipant?.fullName || otherParticipant?.username || otherParticipant?.email || "Người dùng";
    };

    const getAvatarUrl = () => {
        if (avatarUrl) return avatarUrl;
        if (isGroup) return null;

        const otherParticipant = participants?.find((p) => p.id !== currentUser?.id);
        return otherParticipant?.avatar || otherParticipant?.avatarUrl || null;
    };

    const displayName = getDisplayName();
    const displayAvatar = getAvatarUrl();

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Hôm qua";
        } else if (diffDays < 7) {
            return date.toLocaleDateString("vi-VN", { weekday: "short" });
        } else {
            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        }
    };

    const getInitials = (name) => {
        if (!name) return "G";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <div
            className={`${styles.wrapper} ${active ? styles.active : ""}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <div className={styles.avatar}>
                {isGroup ? (
                    <div className={styles.groupAvatar}>{getInitials(displayName)}</div>
                ) : (
                    <Avatar src={displayAvatar || ""} alt={displayName} size={48} />
                )}
                {!isGroup && isOnline && <span className={styles.onlineIndicator} />}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.name}>{displayName}</span>
                    <span className={styles.time}>{formatTime(lastMessageTime)}</span>
                </div>
                <div className={styles.footer}>
          <span className={`${styles.lastMessage} ${unreadCount > 0 ? styles.unreadMessage : ""}`}>
            {lastMessage || "Bắt đầu cuộc trò chuyện"}
          </span>
                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConversationItem;
