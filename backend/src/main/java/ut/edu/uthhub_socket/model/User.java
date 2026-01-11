package ut.edu.uthhub_socket.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // Nên mã hóa trước khi lưu

    @Column(unique = true)
    private String email;

    private String avatar;
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.OFFLINE;
    @Enumerated(EnumType.STRING)
    private Role role;

    // Friend list 2 chiều
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Friend> friends = new HashSet<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Notifications> notifications = new HashSet<>();

    public User(String username, String password, String email, String fullName) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
    }
}