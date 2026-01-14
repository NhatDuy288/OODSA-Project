import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faSearch,
    faCamera,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../../contexts/ChatContext";
import defaultAvatar from "../../assets/default_avatar.jpg";
import styles from "./CreateGroupModal.module.css";

function CreateGroupModal({ isOpen, onClose }) {
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
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
                    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
        try {
            // TODO: Replace with API call when backend is ready
            // const response = await userApi.getUsers();
            // setUsers(response.data);

            // Mock data for testing
            setUsers([
                {
                    id: 101,
                    fullName: "Lê Minh Tuấn",
                    email: "tuan.le@uth.edu.vn",
                    avatarUrl: null,
                },
                {
                    id: 102,
                    fullName: "Phạm Thị Hoa",
                    email: "hoa.pham@uth.edu.vn",
                    avatarUrl: null,
                },
                {
                    id: 103,
                    fullName: "Nguyễn Hoàng Nam",
                    email: "nam.nguyen@uth.edu.vn",
                    avatarUrl: null,
                },
                {
                    id: 104,
                    fullName: "Trần Văn Đức",
                    email: "duc.tran@uth.edu.vn",
                    avatarUrl: null,
                },
                {
                    id: 105,
                    fullName: "Võ Thị Mai",
                    email: "mai.vo@uth.edu.vn",
                    avatarUrl: null,
                },
                {
                    id: 106,
                    fullName: "Hoàng Văn Bình",
                    email: "binh.hoang@uth.edu.vn",
                    avatarUrl: null,
                },
            ]);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const toggleMember = (user) => {
        if (selectedMembers.find((m) => m.id === user.id)) {
            setSelectedMembers(selectedMembers.filter((m) => m.id !== user.id));
        } else {
            setSelectedMembers([...selectedMembers, user]);
        }
    };

    const removeMember = (userId) => {
        setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length < 2) return;

        // TODO: Create group via API
        // const response = await groupApi.createGroup({
        //   name: groupName,
        //   memberIds: selectedMembers.map(m => m.id),
        // });

        // For now, create a mock group conversation
        const newGroup = {
            id: Date.now(),
            name: groupName.trim(),
            avatarUrl: null,
            isGroup: true,
            participantCount: selectedMembers.length + 1, // +1 for current user
            members: selectedMembers.map((m) => ({
                id: m.id,
                fullName: m.fullName,
                avatarUrl: m.avatarUrl,
                role: "Thành viên",
            })),
            lastMessage: "Nhóm vừa được tạo",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
        };

        setCurrentConversation(newGroup);
        loadConversations();
        handleClose();
    };

    const handleClose = () => {
        onClose();
        setGroupName("");
        setSearchQuery("");
        setSelectedMembers([]);
    };

    // Get initials for avatar preview
    const getInitials = (name) => {
        if (!name) return "N";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const isValid = groupName.trim() && selectedMembers.length >= 2;

    return (
        <div
            className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
            onClick={handleClose}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.title}>Tạo nhóm mới</span>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Group Info Section */}
                    <div className={styles.groupInfoSection}>
                        {/* Avatar Upload */}
                        <div className={styles.avatarUpload}>
                            <div className={styles.avatarPreview}>
                                {getInitials(groupName)}
                                <div className={styles.cameraIcon}>
                                    <FontAwesomeIcon icon={faCamera} />
                                </div>
                            </div>
                            <span className={styles.avatarHint}>Nhấn để thay đổi ảnh nhóm</span>
                        </div>

                        {/* Group Name Input */}
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Tên nhóm *</label>
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder="Nhập tên nhóm..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div className={styles.memberSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>Thêm thành viên</span>
                            <span className={styles.memberCount}>
                                Đã chọn: {selectedMembers.length}/∞
                            </span>
                        </div>

                        {/* Search Box */}
                        <div className={styles.searchBox}>
                            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Tìm kiếm bạn bè..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Selected Members */}
                        {selectedMembers.length > 0 && (
                            <div className={styles.selectedMembers}>
                                {selectedMembers.map((member) => (
                                    <div key={member.id} className={styles.selectedMember}>
                                        <img
                                            src={member.avatarUrl || defaultAvatar}
                                            alt={member.fullName}
                                            className={styles.selectedMemberAvatar}
                                        />
                                        <span>{member.fullName.split(" ").pop()}</span>
                                        <button
                                            className={styles.removeMemberBtn}
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* User List */}
                        <div className={styles.userList}>
                            {filteredUsers.map((user) => {
                                const isSelected = selectedMembers.find((m) => m.id === user.id);
                                return (
                                    <div
                                        key={user.id}
                                        className={`${styles.userItem} ${isSelected ? styles.userItemSelected : ""
                                            }`}
                                        onClick={() => toggleMember(user)}
                                    >
                                        <div
                                            className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""
                                                }`}
                                        >
                                            {isSelected && <FontAwesomeIcon icon={faCheck} />}
                                        </div>
                                        <img
                                            src={user.avatarUrl || defaultAvatar}
                                            alt={user.fullName}
                                            className={styles.userAvatar}
                                        />
                                        <div className={styles.userInfo}>
                                            <div className={styles.userName}>{user.fullName}</div>
                                            <div className={styles.userEmail}>{user.email}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={handleClose}>
                        Hủy
                    </button>
                    <button
                        className={styles.createBtn}
                        onClick={handleCreateGroup}
                        disabled={!isValid}
                    >
                        Tạo nhóm {selectedMembers.length >= 2 && `(${selectedMembers.length + 1})`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateGroupModal;
