import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import defaultAvatar from "../../../assets/default_avatar.jpg";
import styles from "./MessageBubble.module.css";

function MessageBubble({ message, isSent, showAvatar, showSenderName }) {
    const { content, createdAt, isRead, sender } = message;

    // Format time display
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={`${styles.wrapper} ${isSent ? styles.sent : styles.received}`}>
            {/* Avatar for received messages */}
            {!isSent && showAvatar && (
                <div className={styles.avatar}>
                    <img
                        src={sender?.avatarUrl || defaultAvatar}
                        alt={sender?.fullName || "User"}
                        className={styles.avatarImg}
                    />
                </div>
            )}

            {/* Message Content */}
            <div className={styles.content}>
                {/* Sender name for group chat */}
                {!isSent && showSenderName && (
                    <span className={styles.senderName}>{sender?.fullName}</span>
                )}

                {/* Message Bubble */}
                <div className={styles.bubble}>
                    {content}
                </div>

                {/* Message Info */}
                <div className={styles.messageInfo}>
                    <span className={styles.time}>{formatTime(createdAt)}</span>
                    {isSent && (
                        <span className={`${styles.readStatus} ${isRead ? styles.readStatusRead : ""}`}>
                            <FontAwesomeIcon icon={isRead ? faCheckDouble : faCheck} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
