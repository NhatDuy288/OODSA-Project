import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../Avatar/Avatar";
import styles from "./AddFriend.module.css";
import { useChat } from "../../contexts/ChatContext";

import { sendFriendRequest } from "../../api/friends";
import { searchUserByUsername } from "../../api/users";
import { CHAT_TABS } from "../../constants/contactsMenu";
import WebSocketService from "../../services/WebSocketService";
import {
  cancelFriendRequest,
  acceptFriendRequest,
  unfriend,
} from "../../api/friends";

function AddFriend({ onClose }) {
  const { startNewConversation, setLeftTab } = useChat();
  const inputRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState("");

  // --- SỬA: Đổi từ foundUser (null) sang foundUsers (mảng rỗng) ---
  const [foundUsers, setFoundUsers] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // --- SỬA: Các hàm xử lý bên dưới nhận tham số `user` cụ thể ---

  const handleCancel = async (user) => {
    try {
      setIsSending(true);
      await cancelFriendRequest(user.id);

      // Cập nhật trạng thái cho đúng user trong danh sách
      setFoundUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, friendStatus: "NONE" } : u)
      );
    } catch {
      showToast("❌ Thu hồi thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async (user) => {
    try {
      setIsSending(true);
      await acceptFriendRequest(user.requestId);

      setFoundUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, friendStatus: "FRIEND", requestId: null } : u)
      );
    } catch {
      showToast("❌ Đồng ý thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleUnfriend = async (user) => {
    try {
      setIsSending(true);
      await unfriend(user.id);

      setFoundUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, friendStatus: "NONE" } : u)
      );
    } catch {
      showToast("❌ Hủy thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleSearch = async () => {
    const username = keyword.trim();
    if (!username) {
      showToast("Bạn chưa nhập username");
      inputRef.current?.focus();
      return;
    }

    try {
      setIsSearching(true);
      setSearched(true);
      setFoundUsers([]); // Reset danh sách trước khi tìm

      const res = await searchUserByUsername(username);
      const data = res?.data ?? res;

      // Xử lý dữ liệu trả về (nếu là mảng hoặc object)
      if (Array.isArray(data)) {
        setFoundUsers(data);
      } else if (data) {
        setFoundUsers([data]);
      }
    } catch (err) {
      console.log("searchUserByUsername error:", err);
      // Nếu lỗi 404 (không tìm thấy) thì danh sách rỗng, không cần báo lỗi toast
      setFoundUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const myId = me?.id;

  const handleSendRequest = async (user) => {
    const username = user?.username;
    if (!username) return;

    try {
      setIsSending(true);
      await sendFriendRequest(username);

      setFoundUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, friendStatus: "PENDING_SENT" } : u)
      );
    } catch {
      showToast("❌ Gửi lời mời thất bại");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    WebSocketService.connect(() => {
      WebSocketService.subscribe(
        "/user/queue/friend-accepted",
        (data) => {
          console.log("✅ Friend accepted:", data);

          setFoundUsers((prev) => 
            prev.map((u) => u.id === data.userId ? { ...u, friendStatus: "FRIEND" } : u)
          );
        }
      );
    });

    return () => {
      WebSocketService.unsubscribe("/user/queue/friend-accepted");
    };
  }, []);

  const body = (
    <div className={styles.overlay} onClick={handleWrapperClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <p className={styles.title}>Thêm bạn</p>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.searchRow}>
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.input}
              placeholder="Nhập tên hoặc username để tìm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              disabled={isSearching || isSending}
            />

            {keyword.length > 0 && (
              <button
                className={styles.clear}
                onClick={() => {
                  setKeyword("");
                  setFoundUsers([]);
                  setSearched(false);
                  inputRef.current?.focus();
                }}
                aria-label="Xóa"
                disabled={isSearching || isSending}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Thêm style để cuộn nếu danh sách dài */}
        <div className={styles.content} style={{ overflowY: 'auto', maxHeight: '400px' }}>
          {!searched && (
            <p className={styles.hint}>
              Nhập <b>username</b> hoặc <b>tên</b> rồi bấm <b>Tìm kiếm</b>.
            </p>
          )}

          {searched && isSearching && <div className={styles.stateText}>Đang tìm...</div>}

          {searched && !isSearching && foundUsers.length === 0 && (
            <div className={styles.stateText}>Không tìm thấy người dùng nào</div>
          )}

          {/* --- SỬA: Dùng vòng lặp map để hiển thị danh sách --- */}
          {foundUsers.length > 0 && foundUsers.map((user) => {
            const isMe = myId && Number(user.id) === Number(myId);
            const status = user.friendStatus;

            return (
              <div className={styles.resultCard} key={user.id} style={{ marginBottom: '10px' }}>
                <div className={styles.left}>
                  <div className={styles.avatar}>
                    <Avatar
                      src={user?.avatar || user?.avatarUrl || ""}
                      alt={user?.fullName || user?.username || "avatar"}
                    />
                  </div>

                  <div className={styles.meta}>
                    <p className={styles.name}>{user.fullName || "Người dùng"}</p>
                    <p className={styles.sub}>@{user.username}</p>
                  </div>
                </div>

                {isMe ? (
                  <span className={styles.sub}>(Bạn)</span>
                ) : (
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionBtn} ${styles.actionGhost}`}
                      onClick={() => {
                        startNewConversation(user);
                        setLeftTab(CHAT_TABS.MESSAGES);
                        onClose();
                      }}
                      disabled={isSending}
                    >
                      Nhắn tin
                    </button>

                    {status === "NONE" && (
                      <button
                        className={`${styles.actionBtn} ${styles.actionPrimary}`}
                        onClick={() => handleSendRequest(user)}
                        disabled={isSending}
                      >
                        Kết bạn
                      </button>
                    )}

                    {status === "PENDING_SENT" && (
                      <button
                        className={`${styles.actionBtn} ${styles.actionPrimary}`}
                        onClick={() => handleCancel(user)}
                        disabled={isSending}
                      >
                        Thu hồi
                      </button>
                    )}

                    {status === "PENDING_RECEIVED" && (
                      <button
                        className={`${styles.actionBtn} ${styles.actionPrimary}`}
                        onClick={() => handleAccept(user)}
                        disabled={isSending}
                      >
                        Đồng ý
                      </button>
                    )}

                    {status === "FRIEND" && (
                      <button
                        className={`${styles.actionBtn} ${styles.actionPrimary}`}
                        onClick={() => handleUnfriend(user)}
                        disabled={isSending}
                      >
                        Hủy kết bạn
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose} disabled={isSearching || isSending}>
            Hủy
          </button>

          <button className={styles.btnPrimary} onClick={handleSearch} disabled={isSearching || isSending}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <span>{isSearching ? "Đang tìm..." : "Tìm kiếm"}</span>
          </button>
        </div>

        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

export default AddFriend;