import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../../../contexts/ChatContext";
import defaultAvatar from "../../../assets/default_avatar.jpg";
import styles from "./ChatHeader.module.css";

function ChatHeader({ onInfoClick }) {
    const { currentConversation } = useChat();

    if (!currentConversation) return null;

    const { name, avatarUrl, isGroup, isOnline, participantCount } = currentConversation;

    // Get initials for group avatar
    const getInitials = (name) => {
        if (!name) return "G";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    // Get status text
    const getStatusText = () => {
        if (isGroup) {
            return `${participantCount || 0} thành viên`;
        }
        return isOnline ? "Đang hoạt động" : "Offline";
    };

    return (
        <div className={styles.wrapper}>
            {/* User/Group Info */}
            <div className={styles.userInfo}>
                <div className={styles.avatar}>
                    {isGroup ? (
                        <div className={styles.groupAvatar}>{getInitials(name)}</div>
                    ) : (
                        <img
                            src={avatarUrl || defaultAvatar}
                            alt={name}
                            className={styles.avatarImg}
                        />
                    )}
                    {!isGroup && isOnline && <span className={styles.onlineIndicator} />}
                </div>
                <div className={styles.details}>
                    <span className={styles.name}>{name}</span>
                    <span
                        className={`${styles.status} ${isOnline && !isGroup ? styles.statusOnline : ""}`}
                    >
                        {getStatusText()}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.actionBtn} title="Gọi thoại">
                    <FontAwesomeIcon icon={faPhone} />
                </button>
                <button className={styles.actionBtn} title="Gọi video">
                    <FontAwesomeIcon icon={faVideo} />
                </button>
                <button
                    className={styles.actionBtn}
                    title="Thông tin"
                    onClick={onInfoClick}
                >
                    <FontAwesomeIcon icon={faEllipsisV} />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;

