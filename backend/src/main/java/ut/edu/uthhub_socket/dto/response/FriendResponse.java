package ut.edu.uthhub_socket.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ut.edu.uthhub_socket.model.FriendshipStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponse {
    private Integer friendId;
    private Integer userId;
    private String fullName;
    private FriendshipStatus status;
}
