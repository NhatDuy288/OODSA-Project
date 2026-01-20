package ut.edu.uthhub_socket.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notifications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;
    @Enumerated(EnumType.STRING)
    private StyleNotifications style;

    private String content;

    @Column(name = "conversation_id")
    private Long conversationId;

    @Column(name = "message_id")
    private Long messageId;

    private Boolean silent = false;


    private Boolean isRead = false;
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}