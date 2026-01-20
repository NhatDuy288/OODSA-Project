package ut.edu.uthhub_socket.dto.response;

import ut.edu.uthhub_socket.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    Long id;
    Long conversationId;
    String content;
    LocalDateTime createdAt;
    Boolean isRead;
    Boolean isSystem;

    SenderInfo sender; // Nested object for frontend compatibility

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SenderInfo {
        Integer id;
        String fullName;
        String avatarUrl;
    }

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.conversationId = message.getConversation().getId();
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
        this.isRead = message.getIsRead();
        this.isSystem = message.getIsSystem();

        if (message.getSender() != null) {
            this.sender = new SenderInfo(
                    message.getSender().getId(),
                    message.getSender().getFullName(),
                    message.getSender().getAvatar()
            );
        } else {
            this.sender = null; // system message
        }
    }
}
