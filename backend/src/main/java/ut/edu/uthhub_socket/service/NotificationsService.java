package ut.edu.uthhub_socket.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import ut.edu.uthhub_socket.dto.response.NotificationsResponse;
import ut.edu.uthhub_socket.model.Notifications;
import ut.edu.uthhub_socket.model.StyleNotifications;
import ut.edu.uthhub_socket.model.User;
import ut.edu.uthhub_socket.repository.IConversationMuteRepository;
import ut.edu.uthhub_socket.repository.INotificationsRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationsService implements INotificationsService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private INotificationsRepository notificationsRepository;

    @Autowired
    private IUserService userService;

    //set silent theo mute group
    @Autowired(required = false)
    private IConversationMuteRepository conversationMuteRepository;

    @Override
    public List<NotificationsResponse> getAllNotificationsByUserId(Integer userId) {
        List<Notifications> notifications = notificationsRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);
        List<NotificationsResponse> responses = new ArrayList<>();
        for (Notifications notification : notifications) {
            responses.add(new NotificationsResponse(notification));
        }
        return responses;
    }

    @Override
    public List<NotificationsResponse> findAllByUserIdAndIsReadFalse(Integer userId) {
        List<Notifications> notifications = notificationsRepository.findAllByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
        List<NotificationsResponse> responses = new ArrayList<>();
        for (Notifications notification : notifications) {
            responses.add(new NotificationsResponse(notification));
        }
        return responses;
    }

    @Override
    public void updateNotificationsById(Integer meId, Long notificationId) {

        Notifications notification = notificationsRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (!notification.getUser().getId().equals(meId)) {
            throw new RuntimeException("Bạn không có quyền truy cập thông báo này");
        }

        if (Boolean.TRUE.equals(notification.getIsRead())) return;

        notification.setIsRead(true);
        notificationsRepository.save(notification);
    }

    @Override
    public void sendFriendNotification(
            Integer userId,
            Integer senderId,
            StyleNotifications style
    ) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không thể gửi thông báo (người nhận)"));

        User sender = userService.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Không thể gửi thông báo (người gửi)"));

        Notifications notification = new Notifications();
        notification.setUser(user);
        notification.setSender(sender);
        notification.setStyle(style);

        switch (style) {
            case FRIEND_REQUEST:
                notification.setContent(sender.getFullName() + " đã gửi lời mời cho bạn");
                break;

            case FRIEND_ACCEPTED:
                notification.setContent(sender.getFullName() + " đã chấp nhận lời mời kết bạn của bạn");
                break;

            case FRIEND_REJECTED:
                notification.setContent(sender.getFullName() + " đã từ chối lời mời kết bạn của bạn");
                break;

            default:
                notification.setContent("Bạn có thông báo mới");
        }

        Notifications saved = notificationsRepository.save(notification);

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                new NotificationsResponse(saved)
        );
    }


    @Transactional
    @Override
    public void createGroupNotification(
            Integer userId,
            List<Integer> receives,
            String nameGroup,
            StyleNotifications styleNotifications
    ) {
        User sender = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));

        List<User> receivers = userService.findAllByIds(receives);
        if (receivers.size() != receives.size()) {
            throw new RuntimeException("Danh sách người nhận không hợp lệ");
        }

        String groupName = (nameGroup != null && !nameGroup.trim().isEmpty()) ? nameGroup.trim() : "Nhóm chat";

        for (User receiver : receivers) {
            Notifications notification = new Notifications();
            notification.setUser(receiver);
            notification.setSender(sender);
            notification.setContent(sender.getFullName() + " đã thêm bạn vào nhóm " + groupName);
            notification.setStyle(styleNotifications);

            Notifications saved = notificationsRepository.save(notification);

            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + receiver.getId(),
                    new NotificationsResponse(saved)
            );
        }
    }

    // =========================================================
    // GROUP NOTIFICATION (mention/leave/kick/transfer/dissolve…)
    // - hỗ trợ silent theo mute
    // - hỗ trợ conversationId/messageId để frontend jump
    // =========================================================
    @Transactional
    public void sendGroupNotification(
            Integer receiverId,
            Integer senderId,         // có thể null (system)
            String content,
            Long conversationId,      // có thể null
            Long messageId            // có thể null
    ) {
        User receiver = userService.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Không thể gửi thông báo (người nhận)"));

        User sender = null;
        if (senderId != null) {
            sender = userService.findById(senderId).orElse(null);
        }

        Notifications n = new Notifications();
        n.setUser(receiver);
        n.setSender(sender);
        n.setStyle(StyleNotifications.GROUP);
        n.setContent(content);

        n.setConversationId(conversationId);
        n.setMessageId(messageId);

        // silent theo mute nếu có repo + conversationId
        boolean silent = false;
        if (conversationId != null && conversationMuteRepository != null) {
            silent = conversationMuteRepository
                    .existsByConversation_IdAndUser_IdAndMutedTrue(conversationId, receiverId);
        }
        n.setSilent(silent);

        Notifications saved = notificationsRepository.save(n);

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiverId,
                new NotificationsResponse(saved)
        );
    }

    /**
     * gửi cho nhiều người cùng lúc (mỗi người sẽ có silent riêng nếu mute)
     */
    @Transactional
    public void sendGroupNotificationToMany(
            List<Integer> receiverIds,
            Integer senderId,
            String content,
            Long conversationId,
            Long messageId
    ) {
        if (receiverIds == null || receiverIds.isEmpty()) return;
        for (Integer rid : receiverIds) {
            if (rid == null) continue;
            sendGroupNotification(rid, senderId, content, conversationId, messageId);
        }
    }
}
