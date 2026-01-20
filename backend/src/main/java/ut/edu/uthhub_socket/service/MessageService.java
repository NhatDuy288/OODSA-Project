package ut.edu.uthhub_socket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.uthhub_socket.dto.request.ChatMessageRequest;
import ut.edu.uthhub_socket.model.*;
import ut.edu.uthhub_socket.repository.*;
import ut.edu.uthhub_socket.dto.request.CreateGroupRequest;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final IMessageRepository messageRepository;
    private final IConversationRepository conversationRepository;
    private final IUserRepository userRepository;
    private final IFriendRepository friendRepository;
    private final IConversationMuteRepository conversationMuteRepository;
    private final NotificationsService notificationsService;

    // Helper result for REST group actions: return updated conversation + optional system message to broadcast
    public static class GroupActionResult {
        private final Conversation conversation;
        private final Message systemMessage;

        public GroupActionResult(Conversation conversation, Message systemMessage) {
            this.conversation = conversation;
            this.systemMessage = systemMessage;
        }

        public Conversation getConversation() { return conversation; }
        public Message getSystemMessage() { return systemMessage; }
    }

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Conversation requireConversation(Long conversationId) {
        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        // init participants
        c.getParticipants().size();
        return c;
    }

    private void ensureParticipant(Conversation c, User u) {
        boolean ok = c.getParticipants().stream().anyMatch(p -> p.getId().equals(u.getId()));
        if (!ok) throw new RuntimeException("Bạn không thuộc cuộc trò chuyện này");
    }

    private void ensureGroup(Conversation c) {
        if (!Boolean.TRUE.equals(c.getIsGroup())) {
            throw new RuntimeException("Chỉ áp dụng cho nhóm chat");
        }
    }

    private void ensureAdmin(Conversation c, User actor) {
        if (c.getCreatedBy() == null || !Objects.equals(c.getCreatedBy().getId(), actor.getId())) {
            throw new RuntimeException("Chỉ Admin mới có quyền thực hiện hành động này");
        }
    }

    private void ensureFriendAccepted(Integer meId, Integer targetId) {
        Friend rel = friendRepository.findRelation(meId, targetId)
                .orElseThrow(() -> new RuntimeException("Chỉ được thêm bạn bè vào nhóm"));
        if (rel.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Chỉ được thêm bạn bè vào nhóm");
        }
    }

    private Message createSystemMessage(Conversation conv, String content) {
        Message m = new Message();
        m.setConversation(conv);
        m.setSender(null);
        m.setIsSystem(true);
        m.setContent(content);
        m.setIsRead(false);

        conv.setLastMessage(content);
        conv.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conv);

        Message saved = messageRepository.save(m);
        // init participants for broadcast safety
        saved.getConversation().getParticipants().size();
        return saved;
    }

    @Transactional
    public Message sendMessage(String username, ChatMessageRequest request) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else if (request.getRecipientId() != null) {
            // Check if conversation exists
            User recipient = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));

            conversation = conversationRepository.findBetweenUsers(sender.getId(), recipient.getId())
                    .orElseGet(() -> {
                        Conversation newConv = new Conversation();
                        newConv.setIsGroup(false); // 1-1 chat is not a group
                        newConv.setParticipants(new HashSet<>(Arrays.asList(sender, recipient)));
                        return conversationRepository.save(newConv);
                    });
        } else {
            throw new RuntimeException("Destination not specified");
        }

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(sender);
        message.setConversation(conversation);
        message.setIsSystem(false);


        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message savedMessage = messageRepository.save(message);

        // Mention notifications (group only)
        if (Boolean.TRUE.equals(conversation.getIsGroup())
                && request.getMentionedUserIds() != null
                && !request.getMentionedUserIds().isEmpty()) {

            Set<Integer> participantIds = conversation.getParticipants()
                    .stream().map(User::getId).collect(Collectors.toSet());

            for (Integer mentionedId : request.getMentionedUserIds()) {
                if (mentionedId == null) continue;
                if (Objects.equals(mentionedId, sender.getId())) continue;
                if (!participantIds.contains(mentionedId)) continue;

                String content = sender.getFullName() + " đã nhắc đến bạn trong nhóm \"" +
                        (conversation.getName() != null ? conversation.getName() : "Nhóm chat") + "\"";

                notificationsService.sendGroupNotification(
                        mentionedId,
                        sender.getId(),
                        content,
                        conversation.getId(),
                        savedMessage.getId()
                );
            }
        }

        // Force initialization of lazy collections while in transaction
        // This prevents LazyInitializationException in the controller
        savedMessage.getConversation().getParticipants().size();
        return savedMessage;
    }

    public List<Conversation> getUserConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return conversationRepository.findByUserId(user.getId());
    }

    public List<Message> getConversationMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public GroupActionResult createGroupConversation(String username, CreateGroupRequest request) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isEmpty())
            throw new RuntimeException("Group name is required");
        if (request.getMemberIds() == null || request.getMemberIds().size() < 2) {
            throw new RuntimeException("Group must have at least 3 members (including you)");
        }

        Set<User> participants = new HashSet<>();
        participants.add(creator);

        for (Integer id : request.getMemberIds()) {
            User u = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found: " + id));
            participants.add(u);
        }

        Conversation conv = new Conversation();
        conv.setIsGroup(true);
        conv.setName(name);
        conv.setAvatarUrl(request.getAvatarUrl());
        conv.setCreatedBy(creator);
        conv.setParticipants(participants);

        conv.setLastMessage("Nhóm vừa được tạo");
        conv.setLastMessageAt(LocalDateTime.now());

        Conversation savedConv = conversationRepository.save(conv);


        // notify all added members
        for (User u : savedConv.getParticipants()) {
            if (u.getId().equals(creator.getId())) continue;
            notificationsService.sendGroupNotification(
                    u.getId(),
                    creator.getId(),
                    creator.getFullName() + " đã thêm bạn vào nhóm \"" + name + "\"",
                    savedConv.getId(),
                    null
            );
        }

        Message sys = createSystemMessage(savedConv, "Nhóm vừa được tạo");
        return new GroupActionResult(savedConv, sys);
    }

    @Transactional
    public GroupActionResult addMembers(String username, Long conversationId, List<Integer> memberIds) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);

        ensureGroup(conv);
        ensureParticipant(conv, actor);
        ensureAdmin(conv, actor);

        if (memberIds == null || memberIds.isEmpty()) {
            throw new RuntimeException("Danh sách thành viên trống");
        }

        Set<Integer> existing = conv.getParticipants().stream().map(User::getId).collect(Collectors.toSet());
        List<User> added = new ArrayList<>();

        for (Integer id : memberIds) {
            if (id == null) continue;
            if (existing.contains(id)) continue;

            ensureFriendAccepted(actor.getId(), id);

            User u = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found: " + id));

            conv.getParticipants().add(u);
            added.add(u);

            notificationsService.sendGroupNotification(
                    u.getId(),
                    actor.getId(),
                    actor.getFullName() + " đã thêm bạn vào nhóm \"" +
                            (conv.getName() != null ? conv.getName() : "Nhóm chat") + "\"",
                    conv.getId(),
                    null
            );
        }

        Conversation saved = conversationRepository.save(conv);
        saved.getParticipants().size();

        Message sys = null;
        if (!added.isEmpty()) {
            String names = added.stream()
                    .map(User::getFullName)
                    .collect(Collectors.joining(", "));
            sys = createSystemMessage(saved, actor.getFullName() + " đã thêm " + names + " vào nhóm");
        }

        return new GroupActionResult(saved, sys);
    }

    @Transactional
    public GroupActionResult kickMember(String username, Long conversationId, Integer memberId) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);

        ensureGroup(conv);
        ensureParticipant(conv, actor);
        ensureAdmin(conv, actor);

        if (memberId == null) throw new RuntimeException("memberId is required");

        if (conv.getCreatedBy() != null && Objects.equals(conv.getCreatedBy().getId(), memberId)) {
            throw new RuntimeException("Không thể kick admin");
        }

        User target = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean existed = conv.getParticipants().removeIf(u -> Objects.equals(u.getId(), memberId));
        if (!existed) throw new RuntimeException("Thành viên không thuộc nhóm");

        Conversation saved = conversationRepository.save(conv);
        saved.getParticipants().size();

        notificationsService.sendGroupNotification(
                target.getId(),
                actor.getId(),
                "Bạn đã bị " + actor.getFullName() + " xóa khỏi nhóm \"" +
                        (saved.getName() != null ? saved.getName() : "Nhóm chat") + "\"",
                saved.getId(),
                null
        );

        Message sys = createSystemMessage(saved, actor.getFullName() + " đã xóa " + target.getFullName() + " khỏi nhóm");
        return new GroupActionResult(saved, sys);
    }

    @Transactional
    public GroupActionResult transferAdmin(String username, Long conversationId, Integer newAdminId) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);

        ensureGroup(conv);
        ensureParticipant(conv, actor);
        ensureAdmin(conv, actor);

        if (newAdminId == null) throw new RuntimeException("newAdminId is required");
        if (Objects.equals(newAdminId, actor.getId())) throw new RuntimeException("Admin mới phải khác bạn");

        User newAdmin = userRepository.findById(newAdminId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = conv.getParticipants().stream().anyMatch(u -> Objects.equals(u.getId(), newAdminId));
        if (!isMember) throw new RuntimeException("Admin mới phải là thành viên trong nhóm");

        conv.setCreatedBy(newAdmin);
        Conversation saved = conversationRepository.save(conv);
        saved.getParticipants().size();

        notificationsService.sendGroupNotification(
                newAdminId,
                actor.getId(),
                "Bạn đã được chuyển quyền Admin trong nhóm \"" + (saved.getName() != null ? saved.getName() : "Nhóm chat") + "\"",
                saved.getId(),
                null
        );

        Message sys = createSystemMessage(saved, actor.getFullName() + " đã chuyển quyền Admin cho " + newAdmin.getFullName());
        return new GroupActionResult(saved, sys);
    }

    @Transactional
    public GroupActionResult leaveGroup(String username, Long conversationId, Integer newAdminIdIfNeeded) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);

        ensureGroup(conv);
        ensureParticipant(conv, actor);

        boolean isAdmin = conv.getCreatedBy() != null && Objects.equals(conv.getCreatedBy().getId(), actor.getId());

        if (isAdmin) {
            if (newAdminIdIfNeeded == null) {
                throw new RuntimeException("Admin rời nhóm phải chuyển quyền cho thành viên khác");
            }
            if (Objects.equals(newAdminIdIfNeeded, actor.getId())) {
                throw new RuntimeException("Admin mới phải khác bạn");
            }

            boolean isMember = conv.getParticipants().stream().anyMatch(u -> Objects.equals(u.getId(), newAdminIdIfNeeded));
            if (!isMember) throw new RuntimeException("Admin mới phải là thành viên trong nhóm");

            User newAdmin = userRepository.findById(newAdminIdIfNeeded)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            conv.setCreatedBy(newAdmin);

            notificationsService.sendGroupNotification(
                    newAdminIdIfNeeded,
                    actor.getId(),
                    "Bạn đã được chuyển quyền Admin trong nhóm \"" + (conv.getName() != null ? conv.getName() : "Nhóm chat") + "\"",
                    conv.getId(),
                    null
            );
        }

        // remove actor
        conv.getParticipants().removeIf(u -> Objects.equals(u.getId(), actor.getId()));

        Conversation saved = conversationRepository.save(conv);
        saved.getParticipants().size();

        // notify remaining members (ting)
        for (User u : saved.getParticipants()) {
            notificationsService.sendGroupNotification(
                    u.getId(),
                    actor.getId(),
                    actor.getFullName() + " đã rời nhóm \"" + (saved.getName() != null ? saved.getName() : "Nhóm chat") + "\"",
                    saved.getId(),
                    null
            );
        }

        Message sys = createSystemMessage(saved, actor.getFullName() + " đã rời nhóm");
        return new GroupActionResult(saved, sys);
    }

    @Transactional
    public void dissolveGroup(String username, Long conversationId) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);

        ensureGroup(conv);
        ensureParticipant(conv, actor);
        ensureAdmin(conv, actor);

        String groupName = conv.getName() != null ? conv.getName() : "Nhóm chat";

        // notify all members (ting)
        for (User u : conv.getParticipants()) {
            notificationsService.sendGroupNotification(
                    u.getId(),
                    actor.getId(),
                    actor.getFullName() + " đã giải tán nhóm \"" + groupName + "\"",
                    conv.getId(),
                    null
            );
        }

        // delete conversation (messages cascade/orphanRemoval)
        conversationRepository.delete(conv);
    }

    @Transactional
    public void updateMute(String username, Long conversationId, boolean muted) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);
        ensureParticipant(conv, actor);

        ConversationMute m = conversationMuteRepository
                .findByConversation_IdAndUser_Id(conversationId, actor.getId())
                .orElseGet(() -> new ConversationMute(null, conv, actor, false, null));

        m.setMuted(muted);
        conversationMuteRepository.save(m);
    }

    @Transactional(readOnly = true)
    public boolean isMuted(Integer userId, Long conversationId) {
        return conversationMuteRepository.existsByConversation_IdAndUser_IdAndMutedTrue(conversationId, userId);
    }

    // =========================
    // SEARCH
    // =========================
    @Transactional(readOnly = true)
    public List<Message> searchMessages(String username, Long conversationId, String q, int limit) {
        User actor = requireUser(username);
        Conversation conv = requireConversation(conversationId);
        ensureParticipant(conv, actor);

        if (q == null || q.trim().isEmpty()) return List.of();

        int safeLimit = Math.max(1, Math.min(limit, 50));
        return messageRepository
                .findByConversation_IdAndContentContainingIgnoreCase(
                        conversationId,
                        q.trim(),
                        PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"))
                )
                .getContent();
    }

    @Transactional
    public User markMessagesAsRead(String username, Long conversationId) {
        User reader = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int updatedCount = messageRepository.markAsRead(conversationId, reader.getId());
        log.info("Marked {} messages as read for conversation {}", updatedCount, conversationId);

        // Always return reader so broadcast happens (even if no new messages to mark)
        return reader;
    }

    @Transactional(readOnly = true)
    public Conversation getConversationById(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation != null) {
            // Force initialization of participants to avoid lazy loading issues
            conversation.getParticipants().size();
        }
        return conversation;
    }

}
