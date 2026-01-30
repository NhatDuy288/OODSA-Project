package ut.edu.uthhub_socket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Shape gần giống mock data ở frontend để UI dùng lại được.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialPostResponse {
    private Long id;
    private Integer userId;
    private String content;

    private String imageUrl = "";

    private String createdAt;

    /** List userId đã like (reaction LIKE). */
    private List<Integer> likes = new ArrayList<>();

    private List<SocialCommentResponse> comments = new ArrayList<>();
}
