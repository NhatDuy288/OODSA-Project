package ut.edu.uthhub_socket.service;

import ut.edu.uthhub_socket.dto.response.FriendResponse;

import java.util.List;

public interface IFriendService {
    void sendFriendRequestByUsername(Integer senderId, String receiverUsername);

    void acceptFriend(Integer requestId, Integer userId);

    void rejectFriend(Integer requestId, Integer userId);

    List<FriendResponse> getFriendRequests(Integer userId);

    List<FriendResponse> getFriends(Integer userId);
}
