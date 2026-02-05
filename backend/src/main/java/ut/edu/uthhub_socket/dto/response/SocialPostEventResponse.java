package ut.edu.uthhub_socket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialPostEventResponse {
    /** POST_CREATED | POST_UPDATED */
    private String type;
    private SocialPostResponse post;
}
