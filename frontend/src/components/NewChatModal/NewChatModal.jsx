import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../../contexts/ChatContext";
import defaultAvatar from "../../assets/default_avatar.jpg";
import styles from "./NewChatModal.module.css";

function NewChatModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { setCurrentConversation, loadConversations } = useChat();

    // Load users on mount
    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    // Filter users based on search query
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(
                (user) =>
                    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with API call when backend is ready
            // const response = await userApi.searchUsers();
            // setUsers(response.data);

            // Mock data for testing
            setUsers([
                {
                    id: 101,
                    fullName: "Lê Minh Tuấn",
                    username: "tuanle",
                    email: "tuan.le@uth.edu.vn",
                    avatarUrl: null,
                    isOnline: true,
                },
                {
                    id: 102,
                    fullName: "Phạm Thị Hoa",
                    username: "hoapham",
                    email: "hoa.pham@uth.edu.vn",
                    avatarUrl: null,
                    isOnline: false,
                },
                {
                    id: 103,
                    fullName: "Nguyễn Hoàng Nam",
                    username: "namnh",
                    email: "nam.nguyen@uth.edu.vn",
                    avatarUrl: null,
                    isOnline: true,
                },
                {
                    id: 104,
                    fullName: "Trần Văn Đức",
                    username: "ductran",
                    email: "duc.tran@uth.edu.vn",
                    avatarUrl: null,
                    isOnline: false,
                },
                {
                    id: 105,
                    fullName: "Võ Thị Mai",
                    username: "maivo",
                    email: "mai.vo@uth.edu.vn",
                    avatarUrl: null,
                    isOnline: true,
                },
            ]);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartChat = async (user) => {
        // TODO: Create or get existing conversation with this user
        // const response = await conversationApi.createConversation(user.id);

        // For now, create a mock conversation
        const newConversation = {
            id: Date.now(),
            name: user.fullName,
            avatarUrl: user.avatarUrl,
            isGroup: false,
            isOnline: user.isOnline,
            email: user.email,
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
        };

        setCurrentConversation(newConversation);
        loadConversations();
        onClose();
        setSearchQuery("");
    };

    const handleClose = () => {
        onClose();
        setSearchQuery("");
    };

    return (
        <div
            className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
            onClick={handleClose}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.title}>Cuộc trò chuyện mới</span>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Search Box */}
                    <div className={styles.searchBox}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm theo tên, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* User List */}
                    {isLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <>
                            <h4 className={styles.sectionTitle}>Gợi ý</h4>
                            <div className={styles.userList}>
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={styles.userItem}
                                        onClick={() => handleStartChat(user)}
                                    >
                                        <img
                                            src={user.avatarUrl || defaultAvatar}
                                            alt={user.fullName}
                                            className={styles.userAvatar}
                                        />
                                        <div className={styles.userInfo}>
                                            <div className={styles.userName}>{user.fullName}</div>
                                            <div className={styles.userEmail}>{user.email}</div>
                                        </div>
                                        {user.isOnline && <span className={styles.onlineIndicator} />}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <FontAwesomeIcon icon={faUserPlus} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>
                                {searchQuery
                                    ? "Không tìm thấy người dùng"
                                    : "Nhập tên hoặc email để tìm kiếm"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NewChatModal;
