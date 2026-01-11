package ut.edu.uthhub_socket.model;

import jakarta.persistence.*;
import lombok.*;

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

    @Enumerated(EnumType.STRING)
    private StyleNotifications style;

    private String content;

    private Boolean isRead = false;
}