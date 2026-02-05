package ut.edu.uthhub_socket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.edu.uthhub_socket.model.PostComment;

import java.util.List;

@Repository
public interface IPostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPost_IdOrderByCreatedAtAsc(Long postId);
}
