import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faBell,
    faSearch,
    faUserPlus,
    faEnvelope,
    faCalendar,
    faPhone,
    faSignOutAlt,
    faTrash,
    faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../../../contexts/ChatContext";
import defaultAvatar from "../../../assets/default_avatar.jpg";
import styles from "./ChatInfoPanel.module.css";

function ChatInfoPanel({ isOpen, onClose }) {
    const { currentConversation } = useChat();

    if (!currentConversation) return null;

    const {
        name,
        avatarUrl,
        isGroup,
        isOnline,
        email,
        phone,
        dateOfBirth,
        participantCount,
        members,
    } = currentConversation;

    // Get initials for group avatar
    const getInitials = (name) => {
        if (!name) return "G";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Mock members data for group
    const mockMembers = members || [
        { id: 1, fullName: "Nguyễn Văn A", role: "Admin", avatarUrl: null },
        { id: 2, fullName: "Trần Thị B", role: "Thành viên", avatarUrl: null },
        { id: 3, fullName: "Lê Văn C", role: "Thành viên", avatarUrl: null },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`${styles.panel} ${isOpen ? styles.panelVisible : ""}`}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.headerTitle}>
                        {isGroup ? "Thông tin nhóm" : "Thông tin"}
                    </span>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Profile Section */}
                    <div className={styles.profileSection}>
                        {isGroup ? (
                            <div className={styles.groupAvatarLarge}>
                                {getInitials(name)}
                            </div>
                        ) : (
                            <img
                                src={avatarUrl || defaultAvatar}
                                alt={name}
                                className={styles.avatarLarge}
                            />
                        )}
                        <h3 className={styles.profileName}>{name}</h3>
                        <span
                            className={`${styles.profileStatus} ${isOnline && !isGroup ? styles.profileStatusOnline : ""
                                }`}
                        >
                            {isGroup
                                ? `${participantCount || mockMembers.length} thành viên`
                                : isOnline
                                    ? "Đang hoạt động"
                                    : "Offline"}
                        </span>

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button className={styles.actionBtn}>
                                <FontAwesomeIcon icon={faBell} className={styles.actionIcon} />
                                <span className={styles.actionLabel}>Tắt thông báo</span>
                            </button>
                            <button className={styles.actionBtn}>
                                <FontAwesomeIcon icon={faSearch} className={styles.actionIcon} />
                                <span className={styles.actionLabel}>Tìm tin nhắn</span>
                            </button>
                        </div>
                    </div>

                    {/* User Info Section (for 1-1 chat) */}
                    {!isGroup && (
                        <div className={styles.infoSection}>
                            <h4 className={styles.sectionTitle}>Thông tin cá nhân</h4>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Email</div>
                                    <div className={styles.infoValue}>
                                        {email || "Chưa cập nhật"}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faPhone} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Số điện thoại</div>
                                    <div className={styles.infoValue}>
                                        {phone || "Chưa cập nhật"}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faCalendar} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Ngày sinh</div>
                                    <div className={styles.infoValue}>
                                        {formatDate(dateOfBirth)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Section (for group chat) */}
                    {isGroup && (
                        <div className={styles.memberSection}>
                            <div className={styles.memberHeader}>
                                <div>
                                    <h4 className={styles.sectionTitle}>Thành viên nhóm</h4>
                                    <span className={styles.memberCount}>
                                        {mockMembers.length} thành viên
                                    </span>
                                </div>
                                <button className={styles.addMemberBtn}>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <span>Thêm</span>
                                </button>
                            </div>

                            <div className={styles.memberList}>
                                {mockMembers.map((member) => (
                                    <div key={member.id} className={styles.memberItem}>
                                        <img
                                            src={member.avatarUrl || defaultAvatar}
                                            alt={member.fullName}
                                            className={styles.memberAvatar}
                                        />
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>
                                                {member.fullName}
                                                {member.role === "Admin" && (
                                                    <FontAwesomeIcon
                                                        icon={faCrown}
                                                        style={{ color: "#f59e0b", marginLeft: "6px", fontSize: "12px" }}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.memberRole}>{member.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className={styles.dangerSection}>
                        {isGroup ? (
                            <>
                                <button className={styles.dangerBtn}>
                                    <FontAwesomeIcon
                                        icon={faSignOutAlt}
                                        className={styles.dangerIcon}
                                    />
                                    <span>Rời nhóm</span>
                                </button>
                                <button className={styles.dangerBtn}>
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className={styles.dangerIcon}
                                    />
                                    <span>Giải tán nhóm</span>
                                </button>
                            </>
                        ) : (
                            <button className={styles.dangerBtn}>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={styles.dangerIcon}
                                />
                                <span>Xóa cuộc trò chuyện</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChatInfoPanel;
