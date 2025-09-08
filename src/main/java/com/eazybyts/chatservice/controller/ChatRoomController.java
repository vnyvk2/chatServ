package com.eazybyts.chatservice.controller;

import com.eazybyts.chatservice.model.ChatRoom;
import com.eazybyts.chatservice.model.User;
import com.eazybyts.chatservice.payload.response.MessageResponse;
import com.eazybyts.chatservice.repository.ChatRoomRepository;
import com.eazybyts.chatservice.repository.MessageRepository;
import com.eazybyts.chatservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chatrooms")
@PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
public class ChatRoomController {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicChatRooms() {
        List<ChatRoom> publicRooms = chatRoomRepository.findByIsPrivateFalse();
        return ResponseEntity.ok(publicRooms);
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<?> getUserChatRooms(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<ChatRoom> userRooms = chatRoomRepository.findChatRoomsByUser(user);
        return ResponseEntity.ok(userRooms);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createChatRoom(@RequestBody ChatRoom chatRoomData, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(chatRoomData.getName());
        chatRoom.setDescription(chatRoomData.getDescription());
        chatRoom.setIsPrivate(chatRoomData.getIsPrivate() != null ? chatRoomData.getIsPrivate() : false);
        chatRoom.setCreatedBy(user);

        // Add creator as a member
        chatRoom.setMembers(Set.of(user));

        chatRoomRepository.save(chatRoom);

        return ResponseEntity.ok(new MessageResponse("Chat room created successfully!"));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinChatRoom(@PathVariable Long roomId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElse(null);

        if (user == null || chatRoom == null) {
            return ResponseEntity.badRequest().body("User or Chat room not found");
        }

        if (chatRoom.getIsPrivate()) {
            return ResponseEntity.badRequest().body("Cannot join private chat room");
        }

        chatRoom.getMembers().add(user);
        chatRoomRepository.save(chatRoom);

        return ResponseEntity.ok(new MessageResponse("Joined chat room successfully!"));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveChatRoom(@PathVariable Long roomId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElse(null);

        if (user == null || chatRoom == null) {
            return ResponseEntity.badRequest().body("User or Chat room not found");
        }

        chatRoom.getMembers().remove(user);
        chatRoomRepository.save(chatRoom);

        return ResponseEntity.ok(new MessageResponse("Left chat room successfully!"));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getChatRoomMessages(@PathVariable Long roomId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElse(null);
        if (chatRoom == null) {
            return ResponseEntity.badRequest().body("Chat room not found");
        }

        List<com.eazybyts.chatservice.model.Message> messages = messageRepository.findByChatRoomOrderBySentAtAsc(chatRoom);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchChatRooms(@RequestParam String query) {
        List<ChatRoom> chatRooms = chatRoomRepository.searchChatRoomsByName(query);
        return ResponseEntity.ok(chatRooms);
    }
}
