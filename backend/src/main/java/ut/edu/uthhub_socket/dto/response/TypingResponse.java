package ut.edu.uthhub_socket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingResponse {
    private Long conversationId;
    private Integer userId;
    private String username;
    private String fullName;
    private boolean typing;
}
