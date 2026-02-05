package ut.edu.uthhub_socket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialCommentResponse {
    private Long id;
    private Integer userId;
    private String content;
    private String createdAt;
    private Long parentCommentId;
}
