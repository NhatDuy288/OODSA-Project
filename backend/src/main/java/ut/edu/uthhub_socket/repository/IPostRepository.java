package ut.edu.uthhub_socket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ut.edu.uthhub_socket.model.Post;

import java.util.List;

@Repository
public interface IPostRepository extends JpaRepository<Post, Long> {

    /**
     * Feed: newest first.
     * NOTE: bỏ fetch join để tránh duplicate rows phức tạp; DTO mapping sẽ load lazy trong service.
     */
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findFeed();
}
