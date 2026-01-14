import styles from "./ConversationItem.module.css";
import defaultAvatar from "../../../assets/default_avatar.jpg";

function ConversationItem({
    conversation,
    active,
    onClick,
}) {
    const {
        name,
        avatarUrl,
        lastMessage,
        lastMessageTime,
        unreadCount,
        isGroup,
        isOnline,
    } = conversation;

    // Format time display
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

    // Get initials for group avatar
    const getInitials = (name) => {
        if (!name) return "G";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <div
            className={`${styles.wrapper} ${active ? styles.active : ""}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            {/* Avatar */}
            <div className={styles.avatar}>
                {isGroup ? (
                    <div className={styles.groupAvatar}>
                        {getInitials(name)}
                    </div>
                ) : (
                    <img
                        src={avatarUrl || defaultAvatar}
                        alt={name}
                        className={styles.avatarImg}
                    />
                )}
                {!isGroup && isOnline && <span className={styles.onlineIndicator} />}
            </div>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.name}>{name}</span>
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
