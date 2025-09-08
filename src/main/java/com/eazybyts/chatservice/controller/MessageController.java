package com.eazybyts.chatservice.controller;

import com.eazybyts.chatservice.model.Message;
import com.eazybyts.chatservice.model.MessageType;
import com.eazybyts.chatservice.model.User;
import com.eazybyts.chatservice.repository.MessageRepository;
import com.eazybyts.chatservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
@PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/private/{username}")
    public ResponseEntity<?> getPrivateMessages(@PathVariable String username, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        User otherUser = userRepository.findByUsername(username).orElse(null);

        if (currentUser == null || otherUser == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Message> messages = messageRepository.findPrivateMessagesBetweenUsers(
                currentUser, otherUser, MessageType.PRIVATE);

        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Message> unreadMessages = messageRepository.findUnreadMessagesByRecipient(user);
        return ResponseEntity.ok(unreadMessages);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadMessageCount(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Long count = messageRepository.countByRecipientAndIsReadFalse(user);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/mark-read/{messageId}")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId, Principal principal) {
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            return ResponseEntity.badRequest().body("Message not found");
        }

        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null || !message.getRecipient().equals(currentUser)) {
            return ResponseEntity.badRequest().body("Unauthorized");
        }

        message.setIsRead(true);
        messageRepository.save(message);

        return ResponseEntity.ok("Message marked as read");
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getRoomMessages(@PathVariable Long roomId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Note: We'll need to add ChatRoom lookup here
        // For now, returning empty response
        return ResponseEntity.ok("Room messages endpoint - to be implemented with ChatRoom lookup");
    }
}
