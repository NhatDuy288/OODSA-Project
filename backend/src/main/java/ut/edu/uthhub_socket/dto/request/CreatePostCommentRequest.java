package ut.edu.uthhub_socket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostCommentRequest {
    private String content;

    /**
     * Optional: hỗ trợ reply (comment cha).
     */
    private Long parentCommentId;
}
