import { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { useChat } from "../../contexts/ChatContext";
import { AuthService } from "../../services/auth.service";

import ChatHeader from "./ChatHeader/ChatHeader";
import MessageList from "./MessageList/MessageList";
import ChatInput from "./ChatInput/ChatInput";
import ChatInfoPanel from "./ChatInfoPanel/ChatInfoPanel";
import TypingIndicator from "./TypingIndicator/TypingIndicator";
import styles from "./ChatWindow.module.css";

import ProfileModal from "../Profile/ProfileModal";
import UserProfileViewModal from "../Profile/UserProfileViewModal";
import { searchUserByUsername } from "../../api/users";

function ChatWindow({ isMobileMessages, onBackToList }) {
    const { currentConversation, typingUsers } = useChat();
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

    const [isShowMyProfile, setIsShowMyProfile] = useState(false);
    const [isShowUserProfile, setIsShowUserProfile] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const me = AuthService.getUser();

    const normalizeUserFromPayload = useCallback(
        (payload) => {
            const u = payload?.sender ? payload.sender : payload;

            const id =
                u?.id ??
                u?.userId ??
                payload?.senderId ??
                payload?.fromUserId ??
                payload?.userId ??
                payload?.sender?.id ??
                null;

            const participants = currentConversation?.participants || [];
            const fromParticipants =
                id != null
                    ? participants.find((p) => Number(p.id) === Number(id))
                    : null;

            const username =
                u?.username ??
                fromParticipants?.username ??
                null;

            const merged = {
                ...(fromParticipants || {}),
                ...(u && typeof u === "object" ? u : {}),
                id: id ?? fromParticipants?.id,
                username,
            };

            return { id: merged?.id ?? null, user: merged };
        },
        [currentConversation?.participants]
    );

    const handleAvatarClick = useCallback(
        (payload) => {
            const { id, user } = normalizeUserFromPayload(payload);
            if (!id) return;

            if (Number(id) === Number(me?.id)) {
                setIsShowMyProfile(true);
                setIsShowUserProfile(false);
                setSelectedUser(null);
                return;
            }

            setSelectedUser(user);
            setIsShowUserProfile(true);
            setIsShowMyProfile(false);
        },
        [me?.id, normalizeUserFromPayload]
    );

    const closeProfile = () => {
        setIsShowMyProfile(false);
        setIsShowUserProfile(false);
        setSelectedUser(null);
    };

    const fetchSelectedProfile = async () => {
        const username = selectedUser?.username;
        if (!username) return selectedUser;
        try {
            const data = await searchUserByUsername(username);
            return data?.data ?? data;
        } catch {
            return selectedUser;
        }
    };

    if (!currentConversation) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.emptyState}>
                    <FontAwesomeIcon icon={faComments} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>Chào mừng đến UTH Hub</h3>
                    <p className={styles.emptyText}>
                        Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc tìm kiếm bạn bè mới.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <ChatHeader
                onInfoClick={() => setIsInfoPanelOpen(true)}
                onAvatarClick={handleAvatarClick}
                isMobileMessages={isMobileMessages}
                onBackToList={onBackToList}
            />

            <MessageList onAvatarClick={handleAvatarClick} />

            <TypingIndicator typingUsers={typingUsers} />
            <ChatInput />

            <ChatInfoPanel
                isOpen={isInfoPanelOpen}
                onClose={() => setIsInfoPanelOpen(false)}
            />

            {isShowMyProfile && (
                <ProfileModal isOpen={isShowMyProfile} onClose={closeProfile} />
            )}

            {isShowUserProfile && (
                <UserProfileViewModal
                    isOpen={isShowUserProfile}
                    onClose={closeProfile}
                    profile={selectedUser}
                    fetchProfile={fetchSelectedProfile}
                    showStatus={true}
                />
            )}
        </div>
    );
}

export default ChatWindow;
