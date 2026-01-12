package ut.edu.uthhub_socket.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.uthhub_socket.dto.response.UserResponse;
import ut.edu.uthhub_socket.service.IUserService;
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private IUserService userService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @MessageMapping("/user/connect")
    public void connect(@Payload UserResponse userResponse) {
        UserResponse updatedUser = userService.connect(userResponse);
        messagingTemplate.convertAndSend(
                "/topic/active/"+ userResponse.getUsername(),userResponse
        );

    }
}
