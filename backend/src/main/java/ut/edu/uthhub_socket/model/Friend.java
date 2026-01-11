package ut.edu.uthhub_socket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "friends")
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // User chủ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Bạn của user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id")
    private User friend;

    @Enumerated(EnumType.STRING)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}