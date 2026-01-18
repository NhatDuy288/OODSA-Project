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
import { useMemo } from "react";
import { useChat } from "../../../contexts/ChatContext";
import { AuthService } from "../../../services/auth.service";
import Avatar from "../../Avatar/Avatar";
import styles from "./ChatInfoPanel.module.css";

function ChatInfoPanel({ isOpen, onClose }) {
    const { currentConversation } = useChat();
    const currentUser = AuthService.getUser();

    if (!currentConversation) return null;

    const {
        name,
        avatarUrl,
        isGroup,
        participantCount,
        members,
        participants: participantsRaw,
    } = currentConversation;

    const participants = useMemo(() => {
        if (Array.isArray(participantsRaw)) return participantsRaw;
        if (participantsRaw && typeof participantsRaw === "object") {
            return Object.values(participantsRaw);
        }
        return [];
    }, [participantsRaw]);

    const otherParticipant = useMemo(() => {
        if (isGroup) return null;
        const myId = Number(currentUser?.id);
        return participants.find((p) => Number(p?.id) !== myId) || participants[0] || null;
    }, [isGroup, participants, currentUser?.id]);

    const displayName = useMemo(() => {
        if (isGroup) return name || "Nhóm chat";
        return (
            otherParticipant?.fullName ||
            otherParticipant?.username ||
            otherParticipant?.email ||
            name ||
            "Người dùng"
        );
    }, [isGroup, name, otherParticipant]);

    const avatarRaw = useMemo(() => {
        if (isGroup) return avatarUrl || "";
        return (
            otherParticipant?.avatar ||
            otherParticipant?.avatarUrl ||
            avatarUrl ||
            ""
        );
    }, [isGroup, avatarUrl, otherParticipant]);

    const isOnline = useMemo(() => {
        if (isGroup) return false;
        const st = String(otherParticipant?.status || "").toUpperCase();
        return st === "ONLINE";
    }, [isGroup, otherParticipant]);

    const email = !isGroup ? otherParticipant?.email : null;
    // backend UserResponse không có phone => giữ placeholder
    const phone = null;
    const dateOfBirth = !isGroup ? otherParticipant?.dateOfBirth : null;

    const getInitials = (n) => {
        if (!n) return "G";
        return n
            .split(" ")
            .map((x) => x[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return "Chưa cập nhật";
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const memberList = useMemo(() => {
        if (Array.isArray(members) && members.length) return members;

        // fallback: build từ participants (không có role chuẩn nếu backend không gửi members)
        if (participants.length) {
            return participants.map((u) => ({
                id: u?.id,
                fullName: u?.fullName || u?.username || u?.email || `User ${u?.id}`,
                avatarUrl: u?.avatar || u?.avatarUrl || "",
                role: "Thành viên",
            }));
        }

        return [];
    }, [members, participants]);

    const statusText = isGroup
        ? `${participantCount ?? memberList.length} thành viên`
        : isOnline
            ? "Đang hoạt động"
            : "Offline";

    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
                onClick={onClose}
            />

            <div className={`${styles.panel} ${isOpen ? styles.panelVisible : ""}`}>
                <div className={styles.header}>
                    <span className={styles.headerTitle}>{isGroup ? "Thông tin nhóm" : "Thông tin"}</span>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.profileSection}>
                        {isGroup ? (
                            <div className={styles.groupAvatarLarge}>{getInitials(displayName)}</div>
                        ) : (
                            <Avatar
                                src={avatarRaw}
                                alt={displayName}
                                size={96}
                                className={styles.avatarLarge}
                            />
                        )}

                        <h3 className={styles.profileName}>{displayName}</h3>

                        <span
                            className={`${styles.profileStatus} ${
                                isOnline && !isGroup ? styles.profileStatusOnline : ""
                            }`}
                        >
              {statusText}
            </span>

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

                    {!isGroup && (
                        <div className={styles.infoSection}>
                            <h4 className={styles.sectionTitle}>Thông tin cá nhân</h4>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Email</div>
                                    <div className={styles.infoValue}>{email || "Chưa cập nhật"}</div>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faPhone} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Số điện thoại</div>
                                    <div className={styles.infoValue}>{phone || "Chưa cập nhật"}</div>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <FontAwesomeIcon icon={faCalendar} />
                                </div>
                                <div className={styles.infoContent}>
                                    <div className={styles.infoLabel}>Ngày sinh</div>
                                    <div className={styles.infoValue}>{formatDate(dateOfBirth)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isGroup && (
                        <div className={styles.memberSection}>
                            <div className={styles.memberHeader}>
                                <div>
                                    <h4 className={styles.sectionTitle}>Thành viên nhóm</h4>
                                    <span className={styles.memberCount}>{memberList.length} thành viên</span>
                                </div>
                                <button className={styles.addMemberBtn}>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <span>Thêm</span>
                                </button>
                            </div>

                            <div className={styles.memberList}>
                                {memberList.map((m) => (
                                    <div key={m.id} className={styles.memberItem}>
                                        <Avatar
                                            src={m.avatarUrl || ""}
                                            alt={m.fullName}
                                            size={40}
                                            className={styles.memberAvatar}
                                        />
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>
                                                {m.fullName}
                                                {m.role === "Admin" && (
                                                    <FontAwesomeIcon
                                                        icon={faCrown}
                                                        style={{ color: "#f59e0b", marginLeft: "6px", fontSize: "12px" }}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.memberRole}>{m.role || "Thành viên"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.dangerSection}>
                        {isGroup ? (
                            <>
                                <button className={styles.dangerBtn}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.dangerIcon} />
                                    <span>Rời nhóm</span>
                                </button>
                                <button className={styles.dangerBtn}>
                                    <FontAwesomeIcon icon={faTrash} className={styles.dangerIcon} />
                                    <span>Giải tán nhóm</span>
                                </button>
                            </>
                        ) : (
                            <button className={styles.dangerBtn}>
                                <FontAwesomeIcon icon={faTrash} className={styles.dangerIcon} />
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
