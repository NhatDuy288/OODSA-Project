import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../../Avatar/Avatar";
import styles from "./MessageBubble.module.css";

function MessageBubble({ message, isSent, showAvatar, showSenderName, onAvatarClick, isLastSent }) {
    const { content, createdAt, isRead, sender } = message;

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    const avatarRaw = sender?.avatarUrl || sender?.avatar || "";
    const handleAvatarClick = onAvatarClick ? () => onAvatarClick(message) : undefined;

    const isEmojiOnly = (text) => {
        if (!text) return false;

        const t = String(text).trim();
        if (!t) return false;

        const noSpaces = t.replace(/\s+/g, "");

        if (/[A-Za-z0-9]/.test(noSpaces)) return false;

        if (/[.,/#!$%^&*;:{}=\-_`~()<>?@"'\\[\]|]/.test(noSpaces)) return false;

        for (const ch of noSpaces) {
            const cp = ch.codePointAt(0);
            if (cp <= 127) {
                return false;
            }
        }

        return true;
    };

    return (
        <div className={`${styles.wrapper} ${isSent ? styles.sent : styles.received}`}>
            {!isSent && showAvatar && (
                <div className={styles.avatar}>
                    <Avatar
                        src={avatarRaw}
                        alt={sender?.fullName || "User"}
                        size={32}
                        onClick={handleAvatarClick}
                    />
                </div>
            )}

            <div className={styles.content}>
                {!isSent && showSenderName && <span className={styles.senderName}>{sender?.fullName}</span>}

                <div className={`${styles.bubble} ${isEmojiOnly(content) ? styles.emojiOnly : ""}`}>
                    {content}
                </div>

                <div className={styles.messageInfo}>
                    <span className={styles.time}>{formatTime(createdAt)}</span>
                    {isSent && (
                        <span className={`${styles.readStatus} ${isRead ? styles.readStatusRead : ""}`}>
                            <FontAwesomeIcon icon={isRead ? faCheckDouble : faCheck} />
                        </span>
                    )}
                </div>

                {/* Show "Đã xem" text below the last sent message */}
                {isSent && isLastSent && isRead && (
                    <span className={styles.seenText}>Đã xem</span>
                )}
            </div>
        </div>
    );
}

export default MessageBubble;
