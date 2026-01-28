package ut.edu.uthhub_socket.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ut.edu.uthhub_socket.dto.response.UserStatusMessage;
import ut.edu.uthhub_socket.model.UserStatus;
import ut.edu.uthhub_socket.repository.IUserRepository;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final Map<String, Set<String>> sessions = new ConcurrentHashMap<>();

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(event.getMessage());
        if (acc.getUser() == null)
            return;

        String username = acc.getUser().getName();
        String sessionId = acc.getSessionId();

        logger.info("🟢 User [{}] connected with session [{}]", username, sessionId);

        sessions.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);

        if (sessions.get(username).size() == 1) {
            logger.info("✅ User [{}] is now ONLINE (first session)", username);
            updateStatus(username, UserStatus.ONLINE);
        } else {
            logger.info("User [{}] has {} active sessions", username, sessions.get(username).size());
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(event.getMessage());
        if (acc.getUser() == null)
            return;

        String username = acc.getUser().getName();
        String sessionId = acc.getSessionId();

        logger.info("🔴 User [{}] disconnected session [{}]", username, sessionId);

        Set<String> userSessions = sessions.get(username);
        if (userSessions != null) {
            userSessions.remove(sessionId);
            if (userSessions.isEmpty()) {
                sessions.remove(username);
                logger.info("❌ User [{}] is now OFFLINE (no active sessions)", username);
                updateStatus(username, UserStatus.OFFLINE);
            } else {
                logger.info("User [{}] still has {} active sessions", username, userSessions.size());
            }
        }
    }

    private void updateStatus(String username, UserStatus status) {
        var userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            logger.warn("⚠️ User [{}] not found in database, cannot update status to [{}]", username, status.name());
            return;
        }

        var user = userOpt.get();
        user.setStatus(status);
        userRepository.save(user);

        logger.info("📢 Broadcasting status update: username=[{}], status=[{}] to /topic/user-status",
                username, status.name());

        // Broadcast to global topic so all clients receive the update
        messagingTemplate.convertAndSend(
                "/topic/user-status",
                new UserStatusMessage(username, status.name()));

        logger.info("✅ Status broadcast completed for user [{}]", username);
    }
}