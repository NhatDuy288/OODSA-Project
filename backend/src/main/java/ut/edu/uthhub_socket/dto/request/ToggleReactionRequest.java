package ut.edu.uthhub_socket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Toggle reaction for current user.
 * - Nếu chưa react => tạo
 * - Nếu đã react cùng type => xoá
 * - Nếu đã react khác type => đổi type
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ToggleReactionRequest {
    /** e.g. LIKE, LOVE, HAHA ... */
    private String type;
}
