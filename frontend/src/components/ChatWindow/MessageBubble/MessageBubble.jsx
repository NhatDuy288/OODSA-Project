import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../../Avatar/Avatar";
import styles from "./MessageBubble.module.css";

function MessageBubble({ message, isSent, showAvatar, isFirstInGroup, isLastInGroup, showSenderName, onAvatarClick, isLastSent }) {
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

        if (/[\p{L}\p{M}]/u.test(noSpaces)) return false;

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

    // Determine wrapper classes based on position in group
    const getWrapperClasses = () => {
        let classes = `${styles.wrapper} ${isSent ? styles.sent : styles.received}`;
        if (isFirstInGroup) classes += ` ${styles.firstInGroup}`;
        if (isLastInGroup) classes += ` ${styles.lastInGroup}`;
        if (!isFirstInGroup && !isLastInGroup) classes += ` ${styles.middleInGroup}`;
        return classes;
    };

    return (
        <div className={getWrapperClasses()}>
            {/* For received messages: show avatar on first message, placeholder on others for alignment */}
            {!isSent && (
                <>
                    {showAvatar ? (
                        <div className={styles.avatar}>
                            <Avatar
                                src={avatarRaw}
                                alt={sender?.fullName || "User"}
                                size={32}
                                onClick={handleAvatarClick}
                            />
                        </div>
                    ) : (
                        <div className={styles.avatarPlaceholder} />
                    )}
                </>
            )}

            <div className={styles.content}>
                {showSenderName && <span className={styles.senderName}>{sender?.fullName}</span>}

                <div className={`${styles.bubble} ${isEmojiOnly(content) ? styles.emojiOnly : ""}`}>
                    {content}
                </div>

                {/* Only show time on last message in group */}
                {isLastInGroup && (
                    <div className={styles.messageInfo}>
                        <span className={styles.time}>{formatTime(createdAt)}</span>
                        {isSent && (
                            <span className={`${styles.readStatus} ${isRead ? styles.readStatusRead : ""}`}>
                                <FontAwesomeIcon icon={isRead ? faCheckDouble : faCheck} />
                            </span>
                        )}
                    </div>
                )}

                {/* Show "Đã xem" text below the last sent message */}
                {isSent && isLastSent && isRead && (
                    <span className={styles.seenText}>Đã xem</span>
                )}
            </div>
        </div>
    );
}

export default MessageBubble;
