import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../../../contexts/ChatContext";
import { AuthService } from "../../../services/auth.service";
import Avatar from "../../Avatar/Avatar";
import styles from "./ChatHeader.module.css";

function ChatHeader({ onInfoClick, onAvatarClick }) {
    const { currentConversation } = useChat();
    const currentUser = AuthService.getUser();

    if (!currentConversation) return null;

    const participants = currentConversation.participants || [];
    const otherParticipant = currentConversation.isGroup
        ? null
        : participants.find((p) => Number(p.id) !== Number(currentUser?.id));

    const displayName =
        currentConversation.name ||
        (currentConversation.isGroup
            ? "Nhóm chat"
            : (otherParticipant?.fullName ||
                otherParticipant?.username ||
                otherParticipant?.email ||
                "Người dùng"));

    const rawAvatar =
        currentConversation.avatarUrl ||
        (currentConversation.isGroup
            ? ""
            : (otherParticipant?.avatar || otherParticipant?.avatarUrl || ""));

    const { isGroup, isOnline, participantCount } = currentConversation;

    const getInitials = (name) => {
        if (!name) return "G";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const statusText = isGroup
        ? `${participantCount || 0} thành viên`
        : (isOnline ? "Đang hoạt động" : "Offline");

    return (
        <div className={styles.wrapper}>
            <div className={styles.userInfo}>
                <div
                    className={styles.avatar}
                    onClick={() => {
                        if (!isGroup && otherParticipant) onAvatarClick?.(otherParticipant);
                    }}
                    style={{ cursor: !isGroup && otherParticipant && onAvatarClick ? "pointer" : "default" }}
                >
                    {isGroup ? (
                        <div className={styles.groupAvatar}>{getInitials(displayName)}</div>
                    ) : (
                        <Avatar src={rawAvatar} alt={displayName} size={44} />
                    )}
                    {!isGroup && isOnline && <span className={styles.onlineIndicator} />}
                </div>

                <div className={styles.details}>
                    <span className={styles.name}>{displayName}</span>
                    <span className={`${styles.status} ${isOnline && !isGroup ? styles.statusOnline : ""}`}>
            {statusText}
          </span>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.actionBtn} title="Gọi thoại">
                    <FontAwesomeIcon icon={faPhone} />
                </button>
                <button className={styles.actionBtn} title="Gọi video">
                    <FontAwesomeIcon icon={faVideo} />
                </button>
                <button className={styles.actionBtn} title="Thông tin" onClick={onInfoClick}>
                    <FontAwesomeIcon icon={faEllipsisV} />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
