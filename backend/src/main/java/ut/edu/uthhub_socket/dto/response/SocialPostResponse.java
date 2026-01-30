package ut.edu.uthhub_socket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    // UI đang có field này (nhưng yêu cầu hiện tại không cần up ảnh/video)
    private String imageUrl = "";

    private String createdAt;

    /**
     * Tổng reaction theo loại. Ví dụ:
     * {"LIKE": 10, "LOVE": 2, ...}
     */
    private Map<String, Integer> reactionCounts = new LinkedHashMap<>();

    /** Tổng reaction (sum của reactionCounts). */
    private Integer totalReactions = 0;

    /** Reaction của người đang xem (null nếu chưa react). */
    private String myReactionType;

    /** List userId đã like (reaction LIKE). */
    private List<Integer> likes = new ArrayList<>();

    private List<SocialCommentResponse> comments = new ArrayList<>();
}
