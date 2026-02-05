package ut.edu.uthhub_socket.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ut.edu.uthhub_socket.dto.request.CreatePostCommentRequest;
import ut.edu.uthhub_socket.dto.request.CreatePostRequest;
import ut.edu.uthhub_socket.dto.request.ToggleReactionRequest;
import ut.edu.uthhub_socket.dto.response.SocialPostEventResponse;
import ut.edu.uthhub_socket.dto.response.SocialPostResponse;
import ut.edu.uthhub_socket.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * myReactionType là field theo từng user (personalized),
     * nên broadcast ra /topic cho tất cả mọi người thì luôn set null để tránh sai lệch.
     */
    private SocialPostResponse sanitizeForBroadcast(SocialPostResponse post) {
        if (post == null) return null;
        return new SocialPostResponse(
                post.getId(),
                post.getUserId(),
                post.getContent(),
                post.getImageUrl(),
                post.getCreatedAt(),
                post.getReactionCounts(),
                post.getTotalReactions(),
                null,
                post.getLikes(),
                post.getComments()
        );
    }

    @GetMapping
    public ResponseEntity<List<SocialPostResponse>> getFeed(Authentication authentication) {
        try {
            return ResponseEntity.ok(postService.getFeed(authentication.getName()));
        } catch (Exception e) {
            log.error("Error getFeed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<SocialPostResponse> createPost(
            @RequestBody CreatePostRequest request,
            Authentication authentication
    ) {
        try {
            SocialPostResponse post = postService.createPost(authentication.getName(), request);
            messagingTemplate.convertAndSend(
                    "/topic/posts",
                    new SocialPostEventResponse("POST_CREATED", sanitizeForBroadcast(post))
            );
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error createPost: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<SocialPostResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CreatePostCommentRequest request,
            Authentication authentication
    ) {
        try {
            SocialPostResponse post = postService.addComment(authentication.getName(), postId, request);
            messagingTemplate.convertAndSend(
                    "/topic/posts",
                    new SocialPostEventResponse("POST_UPDATED", sanitizeForBroadcast(post))
            );
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error addComment postId={}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{postId}/reactions/toggle")
    public ResponseEntity<SocialPostResponse> toggleReaction(
            @PathVariable Long postId,
            @RequestBody ToggleReactionRequest request,
            Authentication authentication
    ) {
        try {
            SocialPostResponse post = postService.toggleReaction(authentication.getName(), postId, request);
            messagingTemplate.convertAndSend(
                    "/topic/posts",
                    new SocialPostEventResponse("POST_UPDATED", sanitizeForBroadcast(post))
            );
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error toggleReaction postId={}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
