import NotificationItem from "./NotificationItem/NotificationItem";
import styles from "./Notifications.module.css";

export const mockNotifications = [
  {
    id: 1,
    userId: 1,
    senderId: 2,
    style: "MESSAGE",
    content: "Bạn có tin nhắn mới từ Trần Văn An",
    isRead: false,
    createdAt: "2026-01-12T10:45:00",
  },
  {
    id: 2,
    userId: 1,
    senderId: 3,
    style: "FRIEND_REQUEST",
    content: "Lê Thị Hoa đã gửi lời mời kết bạn",
    isRead: false,
    createdAt: "2026-01-11T09:30:00",
  },
  {
    id: 3,
    userId: 1,
    senderId: null,
    style: "SYSTEM",
    content: "Hệ thống sẽ bảo trì lúc 23:00 hôm nay",
    isRead: false,
    createdAt: "2026-01-11T07:00:00",
  },
  {
    id: 4,
    userId: 1,
    senderId: 5,
    style: "FRIEND_ACCEPTED",
    content: "Nguyễn Thị Linh đã chấp nhận lời mời kết bạn",
    isRead: true,
    createdAt: "2026-01-10T22:15:00",
  },
  {
    id: 5,
    userId: 1,
    senderId: 5,
    style: "GROUP",
    content: "Bạn được mời vào nhóm",
    isRead: true,
    createdAt: "2026-01-10T22:15:00",
  },
];

function Notifications({ onClick }) {
  return (
    <div className={styles.modalOverlay} onClick={onClick}>
      <div onClick={(e) => e.stopPropagation()} className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.title}>Thông báo</p>
          <div></div>
        </div>
        <div className={styles.content}>
          <div className={styles.action}>
            <button>Tất cả</button>
            <button>Chưa đọc</button>
          </div>
          <div className={styles.notifications}>
            {mockNotifications.map((ojb) => (
              <NotificationItem key={ojb.id} notifi={ojb} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Notifications;
