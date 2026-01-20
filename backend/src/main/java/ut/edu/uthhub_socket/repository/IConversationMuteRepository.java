package ut.edu.uthhub_socket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.edu.uthhub_socket.model.ConversationMute;

import java.util.Optional;

@Repository
public interface IConversationMuteRepository extends JpaRepository<ConversationMute, Long> {
    Optional<ConversationMute> findByConversation_IdAndUser_Id(Long conversationId, Integer userId);

    boolean existsByConversation_IdAndUser_IdAndMutedTrue(Long conversationId, Integer userId);
}
