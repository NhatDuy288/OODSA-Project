package ut.edu.uthhub_socket.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ut.edu.uthhub_socket.dto.request.CreatePostCommentRequest;
import ut.edu.uthhub_socket.dto.request.CreatePostRequest;
import ut.edu.uthhub_socket.dto.request.ToggleReactionRequest;
import ut.edu.uthhub_socket.dto.response.SocialCommentResponse;
import ut.edu.uthhub_socket.dto.response.SocialPostResponse;
import ut.edu.uthhub_socket.enums.ReactionType;
import ut.edu.uthhub_socket.model.Post;
import ut.edu.uthhub_socket.model.PostComment;
import ut.edu.uthhub_socket.model.PostReaction;
import ut.edu.uthhub_socket.model.User;
import ut.edu.uthhub_socket.repository.IPostCommentRepository;
import ut.edu.uthhub_socket.repository.IPostReactionRepository;
import ut.edu.uthhub_socket.repository.IPostRepository;
import ut.edu.uthhub_socket.repository.IUserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final IPostRepository postRepository;
    private final IPostCommentRepository commentRepository;
    private final IPostReactionRepository reactionRepository;
    private final IUserRepository userRepository;

    @Transactional
    public List<SocialPostResponse> getFeed(String username) {
        List<Post> posts = postRepository.findFeed();
        List<SocialPostResponse> out = new ArrayList<>();
        for (Post p : posts) {
            out.add(toDto(p));
        }
        return out;
    }

    @Transactional
    public SocialPostResponse createPost(String username, CreatePostRequest request) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String content = request != null ? request.getContent() : null;
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Content is empty");
        }

        Post p = new Post();
        p.setAuthor(author);
        p.setContent(content.trim());
        Post saved = postRepository.save(p);
        return toDto(saved);
    }

    @Transactional
    public SocialPostResponse addComment(String username, Long postId, CreatePostCommentRequest request) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        String content = request != null ? request.getContent() : null;
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment is empty");
        }

        PostComment c = new PostComment();
        c.setAuthor(author);
        c.setPost(post);
        c.setContent(content.trim());

        if (request != null && request.getParentCommentId() != null) {
            PostComment parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            // Ensure same post
            if (!parent.getPost().getId().equals(postId)) {
                throw new RuntimeException("Parent comment is not in this post");
            }
            c.setParent(parent);
        }

        commentRepository.save(c);
        return toDto(post);
    }

    @Transactional
    public SocialPostResponse toggleReaction(String username, Long postId, ToggleReactionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        ReactionType type = parseReactionType(request != null ? request.getType() : null);

        Optional<PostReaction> existingOpt = reactionRepository.findByPost_IdAndUser_Id(postId, user.getId());
        if (existingOpt.isEmpty()) {
            PostReaction r = new PostReaction();
            r.setPost(post);
            r.setUser(user);
            r.setType(type);
            reactionRepository.save(r);
        } else {
            PostReaction existing = existingOpt.get();
            if (existing.getType() == type) {
                reactionRepository.delete(existing);
            } else {
                existing.setType(type);
                reactionRepository.save(existing);
            }
        }

        return toDto(post);
    }

    private ReactionType parseReactionType(String raw) {
        if (raw == null || raw.trim().isEmpty()) return ReactionType.LIKE;
        try {
            return ReactionType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ReactionType.LIKE;
        }
    }

    private SocialPostResponse toDto(Post p) {
        SocialPostResponse dto = new SocialPostResponse();
        dto.setId(p.getId());
        dto.setUserId(p.getAuthor() != null ? p.getAuthor().getId() : null);
        dto.setContent(p.getContent());
        dto.setImageUrl("");
        dto.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

        // Likes (LIKE reaction)
        List<Integer> likes = new ArrayList<>();
        // NOTE: query theo postId để tránh phụ thuộc lazy load
        for (PostReaction r : reactionRepository.findByPost_Id(p.getId())) {
            if (r.getType() == ReactionType.LIKE && r.getUser() != null) {
                likes.add(r.getUser().getId());
            }
        }
        dto.setLikes(likes);

        // Comments
        List<SocialCommentResponse> comments = new ArrayList<>();
        for (PostComment c : commentRepository.findByPost_IdOrderByCreatedAtAsc(p.getId())) {
            SocialCommentResponse cr = new SocialCommentResponse(
                    c.getId(),
                    c.getAuthor() != null ? c.getAuthor().getId() : null,
                    c.getContent(),
                    c.getCreatedAt() != null ? c.getCreatedAt().toString() : null,
                    c.getParent() != null ? c.getParent().getId() : null
            );
            comments.add(cr);
        }
        dto.setComments(comments);
        return dto;
    }
}
