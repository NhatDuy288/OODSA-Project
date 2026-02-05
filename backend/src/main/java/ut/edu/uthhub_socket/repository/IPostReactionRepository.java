package ut.edu.uthhub_socket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.edu.uthhub_socket.model.PostReaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByPost_IdAndUser_Id(Long postId, Integer userId);
    List<PostReaction> findByPost_Id(Long postId);
}
