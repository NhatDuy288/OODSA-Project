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
    faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState, useCallback } from "react";
import { useChat } from "../../../contexts/ChatContext";
import { AuthService } from "../../../services/auth.service";
import Avatar from "../../Avatar/Avatar";
import conversationApi from "../../../api/conversationApi.jsx";

import AddMembersModal from "./modals/AddMembersModal.jsx";
import TransferAdminModal from "./modals/TransferAdminModal.jsx";
import SearchMessagesModal from "./modals/SearchMessagesModal.jsx";

import styles from "./ChatInfoPanel.module.css";

function ChatInfoPanel({ isOpen, onClose }) {
    const {
        currentConversation,
        setCurrentConversation,
        setMessages,
        loadConversations,
    } = useChat();

    const currentUser = AuthService.getUser();

    const [openAddMembers, setOpenAddMembers] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [openTransferAdmin, setOpenTransferAdmin] = useState(false);

    // mode transfer admin: "leave" hoặc "transfer"
    const [transferMode, setTransferMode] = useState("transfer");
    const [busy, setBusy] = useState(false);

    if (!currentConversation) return null;

    const {
        id: conversationId,
        name,
        avatarUrl,
        isGroup,
        participantCount,
        members,
        participants: participantsRaw,
        adminId,
        muted,
    } = currentConversation;

    const participants = useMemo(() => {
        if (Array.isArray(participantsRaw)) return participantsRaw;
        if (participantsRaw && typeof participantsRaw === "object")
            return Object.values(participantsRaw);
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
    const phone = null;
    const dateOfBirth = !isGroup ? otherParticipant?.dateOfBirth : null;

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
        if (participants.length) {
            return participants.map((u) => ({
                id: u?.id,
                username: u?.username,
                fullName: u?.fullName || u?.username || u?.email || `User ${u?.id}`,
                avatarUrl: u?.avatar || u?.avatarUrl || "",
                role: Number(u?.id) === Number(adminId) ? "Admin" : "Thành viên",
            }));
        }
        return [];
    }, [members, participants, adminId]);

    const isMeAdmin = Number(currentUser?.id) === Number(adminId);

    const statusText = isGroup
        ? `${participantCount ?? memberList.length} thành viên`
        : isOnline
            ? "Đang hoạt động"
            : "Offline";

    const refreshConversation = useCallback(async () => {
        if (!conversationId) return;
        const updated = await conversationApi.getConversationById(conversationId);
        setCurrentConversation(updated);
    }, [conversationId, setCurrentConversation]);

    const handleToggleMute = useCallback(async () => {
        if (!conversationId) return;
        try {
            setBusy(true);
            const next = !muted;
            await conversationApi.updateMute(conversationId, next);
            await refreshConversation();
            await loadConversations();
        } catch (e) {
            alert(e?.response?.data?.message || e?.message || "Không thể cập nhật thông báo");
        } finally {
            setBusy(false);
        }
    }, [conversationId, muted, refreshConversation, loadConversations]);

    const handleLeaveGroup = useCallback(async () => {
        if (!conversationId) return;

        // admin rời nhóm => bắt buộc chọn admin mới
        if (isMeAdmin) {
            setTransferMode("leave");
            setOpenTransferAdmin(true);
            return;
        }

        const ok = window.confirm("Bạn chắc chắn muốn rời nhóm?");
        if (!ok) return;

        try {
            setBusy(true);
            await conversationApi.leaveGroup(conversationId);
            setCurrentConversation(null);
            setMessages([]);
            await loadConversations();
            onClose?.();
        } catch (e) {
            alert(e?.response?.data?.message || e?.message || "Không thể rời nhóm");
        } finally {
            setBusy(false);
        }
    }, [conversationId, isMeAdmin, setCurrentConversation, setMessages, loadConversations, onClose]);

    const handleDissolveGroup = useCallback(async () => {
        if (!conversationId) return;

        if (!isMeAdmin) {
            alert("Chỉ Admin mới có quyền giải tán nhóm.");
            return;
        }

        const ok = window.confirm("Bạn chắc chắn muốn giải tán nhóm? Hành động này không thể hoàn tác.");
        if (!ok) return;

        try {
            setBusy(true);
            await conversationApi.dissolveGroup(conversationId);
            setCurrentConversation(null);
            setMessages([]);
            await loadConversations();
            onClose?.();
        } catch (e) {
            alert(e?.response?.data?.message || e?.message || "Không thể giải tán nhóm");
        } finally {
            setBusy(false);
        }
    }, [conversationId, isMeAdmin, setCurrentConversation, setMessages, loadConversations, onClose]);

    const handleKickMember = useCallback(
        async (memberId) => {
            if (!conversationId) return;
            if (!isMeAdmin) return;
            const ok = window.confirm("Kick thành viên này khỏi nhóm?");
            if (!ok) return;

            try {
                setBusy(true);
                await conversationApi.kickMember(conversationId, memberId);
                await refreshConversation();
                await loadConversations();
            } catch (e) {
                alert(e?.response?.data?.message || e?.message || "Không thể kick thành viên");
            } finally {
                setBusy(false);
            }
        },
        [conversationId, isMeAdmin, refreshConversation, loadConversations]
    );

    const handleTransferAdmin = useCallback(() => {
        if (!isMeAdmin) return;
        setTransferMode("transfer");
        setOpenTransferAdmin(true);
    }, [isMeAdmin]);

    const onTransferSubmit = useCallback(
        async (newAdminId) => {
            if (!conversationId) return;

            try {
                setBusy(true);
                if (transferMode === "leave") {
                    // admin leave -> chuyển quyền rồi leave
                    await conversationApi.leaveGroup(conversationId, newAdminId);
                    setCurrentConversation(null);
                    setMessages([]);
                    await loadConversations();
                    setOpenTransferAdmin(false);
                    onClose?.();
                    return;
                }

                // transfer admin bình thường
                await conversationApi.transferAdmin(conversationId, newAdminId);
                await refreshConversation();
                await loadConversations();
                setOpenTransferAdmin(false);
            } catch (e) {
                alert(e?.response?.data?.message || e?.message || "Không thể chuyển quyền admin");
            } finally {
                setBusy(false);
            }
        },
        [
            conversationId,
            transferMode,
            setCurrentConversation,
            setMessages,
            loadConversations,
            refreshConversation,
            onClose,
        ]
    );

    const onJumpToMessage = useCallback((messageId) => {
        const el = document.getElementById(`msg-${messageId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("msgHighlightTemp");
            setTimeout(() => el.classList.remove("msgHighlightTemp"), 1200);
        }
    }, []);

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={onClose} />

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
                            <div className={styles.groupAvatarLarge}>{(displayName || "G")[0]}</div>
                        ) : (
                            <Avatar src={avatarRaw} alt={displayName} size={96} className={styles.avatarLarge} />
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
                            <button className={styles.actionBtn} onClick={handleToggleMute} disabled={busy}>
                                <FontAwesomeIcon icon={faBell} className={styles.actionIcon} />
                                <span className={styles.actionLabel}>{muted ? "Bật thông báo" : "Tắt thông báo"}</span>
                            </button>

                            <button className={styles.actionBtn} onClick={() => setOpenSearch(true)}>
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

                                {isMeAdmin && (
                                    <button className={styles.addMemberBtn} onClick={() => setOpenAddMembers(true)}>
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>Thêm</span>
                                    </button>
                                )}
                            </div>

                            <div className={styles.memberList}>
                                {memberList.map((m) => {
                                    const isAdmin = m.role === "Admin" || Number(m.id) === Number(adminId);
                                    const isMe = Number(m.id) === Number(currentUser?.id);
                                    return (
                                        <div key={m.id} className={styles.memberItem}>
                                            <Avatar src={m.avatarUrl || ""} alt={m.fullName} size={40} className={styles.memberAvatar} />

                                            <div className={styles.memberInfo}>
                                                <div className={styles.memberName}>
                                                    {m.fullName}
                                                    {isAdmin && (
                                                        <FontAwesomeIcon
                                                            icon={faCrown}
                                                            style={{ color: "#f59e0b", marginLeft: "6px", fontSize: "12px" }}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.memberRole}>{isAdmin ? "Admin" : "Thành viên"}</div>
                                            </div>

                                            {/* ACTIONS */}
                                            {isMeAdmin && !isMe && (
                                                <div className={styles.memberActions}>
                                                    <button
                                                        className={styles.memberActionBtn}
                                                        title="Chuyển quyền admin"
                                                        onClick={handleTransferAdmin}
                                                    >
                                                        <FontAwesomeIcon icon={faCrown} />
                                                    </button>

                                                    {!isAdmin && (
                                                        <button
                                                            className={`${styles.memberActionBtn} ${styles.kickBtn}`}
                                                            title="Kick khỏi nhóm"
                                                            onClick={() => handleKickMember(m.id)}
                                                        >
                                                            <FontAwesomeIcon icon={faUserSlash} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles.dangerSection}>
                        {isGroup ? (
                            <>
                                <button className={styles.dangerBtn} onClick={handleLeaveGroup} disabled={busy}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.dangerIcon} />
                                    <span>Rời nhóm</span>
                                </button>

                                <button className={styles.dangerBtn} onClick={handleDissolveGroup} disabled={busy}>
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

            {/* MODALS */}
            <AddMembersModal
                isOpen={openAddMembers}
                onClose={() => setOpenAddMembers(false)}
                conversationId={conversationId}
                existingMemberIds={memberList.map((x) => x.id)}
                onSuccess={async (updated) => {
                    setCurrentConversation(updated);
                    await loadConversations();
                }}
            />

            <TransferAdminModal
                isOpen={openTransferAdmin}
                onClose={() => setOpenTransferAdmin(false)}
                members={memberList}
                currentAdminId={adminId}
                title={transferMode === "leave" ? "Chọn admin mới để rời nhóm" : "Chuyển quyền admin"}
                confirmText={transferMode === "leave" ? "Chuyển & Rời nhóm" : "Chuyển quyền"}
                excludeIds={[currentUser?.id]}
                onSubmit={onTransferSubmit}
                busy={busy}
            />

            <SearchMessagesModal
                isOpen={openSearch}
                onClose={() => setOpenSearch(false)}
                conversationId={conversationId}
                onJumpToMessage={onJumpToMessage}
            />
        </>
    );
}

export default ChatInfoPanel;
