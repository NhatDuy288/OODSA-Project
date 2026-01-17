package ut.edu.uthhub_socket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.edu.uthhub_socket.model.Friend;
import ut.edu.uthhub_socket.model.FriendshipStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface IFriendRepository extends JpaRepository<Friend, Integer> {
    Optional<Friend> findByUserIdAndFriendId(Integer userId, Integer friendId);
    Optional<Friend> findByFriendIdAndUserId(Integer friendId, Integer userId);

    List<Friend> findByFriendIdAndStatus(Integer receiverId, FriendshipStatus status);

    List<Friend> findByUserIdAndStatus(Integer userId, FriendshipStatus status);

    List<Friend> findByStatusAndUserIdOrStatusAndFriendId(
            FriendshipStatus s1, Integer senderId,
            FriendshipStatus s2, Integer receiverId
    );
}
