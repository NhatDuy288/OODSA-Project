package ut.edu.uthhub_socket.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import ut.edu.uthhub_socket.dto.request.*;
import ut.edu.uthhub_socket.dto.response.ConversationResponse;
import ut.edu.uthhub_socket.dto.response.MessageResponse;
import ut.edu.uthhub_socket.dto.response.ReadReceiptResponse;
import ut.edu.uthhub_socket.dto.response.TypingResponse;
import ut.edu.uthhub_socket.model.Conversation;
import ut.edu.uthhub_socket.model.Message;
import ut.edu.uthhub_socket.model.User;
import ut.edu.uthhub_socket.repository.IUserRepository;
import ut.edu.uthhub_socket.service.MessageService;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final IUserRepository userRepository;

    // =========================
    // WS: Send message (+ mention)
    // =========================
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request, Authentication authentication) {
        log.info("=== RECEIVED MESSAGE ===");
        log.info("Request: conversationId={}, recipientId={}, content={}",
                request.getConversationId(), request.getRecipientId(), request.getContent());

        try {
            Message savedMessage = messageService.sendMessage(authentication.getName(), request);

            MessageResponse response = new MessageResponse(savedMessage);

            // Broadcast to conversation topic so all participants receive the message
            String topic = "/topic/conversation/" + savedMessage.getConversation().getId();
            messagingTemplate.convertAndSend(topic, response);

            // Also send to specific users
            savedMessage.getConversation().getParticipants().forEach(participant -> {
                messagingTemplate.convertAndSendToUser(
                        participant.getUsername(),
                        "/queue/messages",
                        response);
            });

        } catch (Exception e) {
            log.error("=== ERROR SENDING MESSAGE === {}", e.getMessage(), e);
        }
    }

    private void broadcastSystemMessage(Message systemMessage) {
        if (systemMessage == null) return;

        MessageResponse response = new MessageResponse(systemMessage);
        Long conversationId = systemMessage.getConversation().getId();

        String topic = "/topic/conversation/" + conversationId;
        messagingTemplate.convertAndSend(topic, response);

        systemMessage.getConversation().getParticipants().forEach(participant -> {
            messagingTemplate.convertAndSendToUser(
                    participant.getUsername(),
                    "/queue/messages",
                    response
            );
        });
    }

    // =========================
    // WS: Typing
    // =========================
    @MessageMapping("/chat.typing")
    public void userTyping(@Payload TypingRequest request, Authentication authentication) {
        log.info("=== TYPING EVENT === conv={}, typing={}, user={}",
                request.getConversationId(), request.isTyping(), authentication.getName());

        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            TypingResponse response = new TypingResponse(
                    request.getConversationId(),
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    request.isTyping());

            String topic = "/topic/conversation/" + request.getConversationId() + "/typing";
            messagingTemplate.convertAndSend(topic, response);

        } catch (Exception e) {
            log.error("Error broadcasting typing status: {}", e.getMessage(), e);
        }
    }

    // =========================
    // WS: Read receipt
    // =========================
    @MessageMapping("/chat.markRead")
    public void markAsRead(@Payload ReadReceiptRequest request, Authentication authentication) {
        log.info("=== MARK AS READ === conv={}, user={}", request.getConversationId(), authentication.getName());

        try {
            User reader = messageService.markMessagesAsRead(authentication.getName(), request.getConversationId());

            if (reader != null) {
                ReadReceiptResponse response = new ReadReceiptResponse(
                        request.getConversationId(),
                        reader.getId(),
                        reader.getFullName(),
                        reader.getAvatar());

                String readTopic = "/topic/conversation/" + request.getConversationId() + "/read";
                messagingTemplate.convertAndSend(readTopic, response);

                String mainTopic = "/topic/conversation/" + request.getConversationId();
                messagingTemplate.convertAndSend(mainTopic, response);
            }
        } catch (Exception e) {
            log.error("Error marking messages as read: {}", e.getMessage(), e);
        }
    }

    // =========================
    // REST: Conversations
    // =========================
    @GetMapping("/api/conversations")
    @ResponseBody
    public ResponseEntity<List<ConversationResponse>> getConversations(Authentication authentication) {
        try {
            User me = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Conversation> conversations = messageService.getUserConversations(authentication.getName());
            List<ConversationResponse> response = conversations.stream()
                    .map(c -> new ConversationResponse(c, messageService.isMuted(me.getId(), c.getId())))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching conversations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/api/conversations/{id}")
    @ResponseBody
    public ResponseEntity<ConversationResponse> getConversationById(@PathVariable Long id, Authentication authentication) {
        try {
            User me = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Conversation conv = messageService.getConversationById(id);
            if (conv == null) return ResponseEntity.notFound().build();

            boolean muted = messageService.isMuted(me.getId(), id);
            return ResponseEntity.ok(new ConversationResponse(conv, muted));
        } catch (Exception e) {
            log.error("Error getConversationById {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/api/conversations/{id}/messages")
    @ResponseBody
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long id, Authentication authentication) {
        try {
            List<Message> messages = messageService.getConversationMessages(id);
            List<MessageResponse> response = messages.stream()
                    .map(MessageResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching messages for conversation {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search messages
    @GetMapping("/api/conversations/{id}/messages/search")
    @ResponseBody
    public ResponseEntity<List<MessageResponse>> searchMessages(
            @PathVariable Long id,
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "20") int limit,
            Authentication authentication
    ) {
        try {
            List<Message> list = messageService.searchMessages(authentication.getName(), id, q, limit);
            List<MessageResponse> response = list.stream().map(MessageResponse::new).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // =========================
    // REST: Group create
    // =========================
    @PostMapping("/api/conversations/groups")
    @ResponseBody
    public ResponseEntity<ConversationResponse> createGroup(@RequestBody CreateGroupRequest request, Authentication authentication) {
        MessageService.GroupActionResult result = messageService.createGroupConversation(authentication.getName(), request);
        broadcastSystemMessage(result.getSystemMessage());

        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean muted = messageService.isMuted(me.getId(), result.getConversation().getId());

        return ResponseEntity.ok(new ConversationResponse(result.getConversation(), muted));
    }

    // =========================
    // REST: Add members
    // =========================
    @PostMapping("/api/conversations/{id}/members")
    @ResponseBody
    public ResponseEntity<ConversationResponse> addMembers(
            @PathVariable Long id,
            @RequestBody AddMembersRequest req,
            Authentication authentication
    ) {
        MessageService.GroupActionResult result = messageService.addMembers(authentication.getName(), id, req.getMemberIds());
        broadcastSystemMessage(result.getSystemMessage());

        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean muted = messageService.isMuted(me.getId(), id);

        return ResponseEntity.ok(new ConversationResponse(result.getConversation(), muted));
    }

    // Kick
    @PostMapping("/api/conversations/{id}/kick/{memberId}")
    @ResponseBody
    public ResponseEntity<ConversationResponse> kickMember(
            @PathVariable Long id,
            @PathVariable Integer memberId,
            Authentication authentication
    ) {
        MessageService.GroupActionResult result = messageService.kickMember(authentication.getName(), id, memberId);
        broadcastSystemMessage(result.getSystemMessage());

        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean muted = messageService.isMuted(me.getId(), id);

        return ResponseEntity.ok(new ConversationResponse(result.getConversation(), muted));
    }

    // Transfer admin
    @PostMapping("/api/conversations/{id}/transfer-admin")
    @ResponseBody
    public ResponseEntity<ConversationResponse> transferAdmin(
            @PathVariable Long id,
            @RequestBody TransferAdminRequest req,
            Authentication authentication
    ) {
        MessageService.GroupActionResult result = messageService.transferAdmin(authentication.getName(), id, req.getNewAdminId());
        broadcastSystemMessage(result.getSystemMessage());

        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean muted = messageService.isMuted(me.getId(), id);

        return ResponseEntity.ok(new ConversationResponse(result.getConversation(), muted));
    }

    // Leave group (admin must pass newAdminId)
    @PostMapping("/api/conversations/{id}/leave")
    @ResponseBody
    public ResponseEntity<?> leaveGroup(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveGroupRequest req,
            Authentication authentication
    ) {
        Integer newAdminId = (req != null) ? req.getNewAdminId() : null;

        MessageService.GroupActionResult result = messageService.leaveGroup(authentication.getName(), id, newAdminId);
        broadcastSystemMessage(result.getSystemMessage());

        return ResponseEntity.ok().build();
    }

    // Dissolve group
    @DeleteMapping("/api/conversations/{id}")
    @ResponseBody
    public ResponseEntity<?> dissolveGroup(@PathVariable Long id, Authentication authentication) {
        messageService.dissolveGroup(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    // Mute / Unmute
    @PatchMapping("/api/conversations/{id}/mute")
    @ResponseBody
    public ResponseEntity<?> updateMute(
            @PathVariable Long id,
            @RequestBody UpdateMuteRequest req,
            Authentication authentication
    ) {
        boolean muted = req != null && Boolean.TRUE.equals(req.getMuted());
        messageService.updateMute(authentication.getName(), id, muted);
        return ResponseEntity.ok().build();
    }
}
