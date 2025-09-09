package com.eazybyts.chatservice.controller;

import com.eazybyts.chatservice.model.*;
import com.eazybyts.chatservice.repository.ChatRoomRepository;
import com.eazybyts.chatservice.repository.MessageRepository;
import com.eazybyts.chatservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

@Controller
public class ChatController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        chatMessage.setSender(principal.getName());
        chatMessage.setTimestamp(LocalDateTime.now());

        // Save message to database
        User sender = userRepository.findByUsername(principal.getName()).orElse(null);
        if (sender != null && chatMessage.getChatRoomId() != null) {
            ChatRoom chatRoom = chatRoomRepository.findById(chatMessage.getChatRoomId()).orElse(null);
            if (chatRoom != null) {
                Message message = new Message();
                message.setContent(chatMessage.getContent());
                message.setSender(sender);
                message.setChatRoom(chatRoom);
                message.setMessageType(chatMessage.getType());
                messageRepository.save(message);

                chatMessage.setId(message.getId());
            }
        }

        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoomId(), chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage,
                        SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", principal.getName());

        // Get user details
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Determine if this is a new user or returning user
            boolean isNewUser = user.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(1));

            // Create appropriate join message
            ChatMessage joinMessage = new ChatMessage();
            joinMessage.setSender(principal.getName());
            joinMessage.setType(MessageType.JOIN);
            joinMessage.setChatRoomId(chatMessage.getChatRoomId());
            joinMessage.setTimestamp(LocalDateTime.now());

            if (isNewUser) {
                joinMessage.setContent(user.getFirstName() + " " + user.getLastName() + " (" + user.getUsername() + ") has joined as a new member! 🎉");
            } else {
                joinMessage.setContent(user.getFirstName() + " " + user.getLastName() + " (" + user.getUsername() + ") is now active 👋");
            }

            if (chatMessage.getChatRoomId() != null) {
                messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoomId(), joinMessage);
            }
        }
    }

    @MessageMapping("/chat.removeUser")
    public void removeUser(@Payload ChatMessage chatMessage, Principal principal) {
        // Get user details
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);

            // Create leave message
            ChatMessage leaveMessage = new ChatMessage();
            leaveMessage.setSender(principal.getName());
            leaveMessage.setType(MessageType.LEAVE);
            leaveMessage.setChatRoomId(chatMessage.getChatRoomId());
            leaveMessage.setTimestamp(LocalDateTime.now());
            leaveMessage.setContent(user.getFirstName() + " " + user.getLastName() + " (" + user.getUsername() + ") is no longer active 👋");

            if (chatMessage.getChatRoomId() != null) {
                messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoomId(), leaveMessage);
            }
        }
    }

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, Principal principal) {
        chatMessage.setSender(principal.getName());
        chatMessage.setTimestamp(LocalDateTime.now());

        // Save private message to database
        User sender = userRepository.findByUsername(principal.getName()).orElse(null);
        User recipient = userRepository.findByUsername(chatMessage.getRecipient()).orElse(null);

        if (sender != null && recipient != null) {
            Message message = new Message();
            message.setContent(chatMessage.getContent());
            message.setSender(sender);
            message.setRecipient(recipient);
            message.setMessageType(MessageType.PRIVATE);
            messageRepository.save(message);

            chatMessage.setId(message.getId());
        }

        // Send private message to specific user
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipient(),
                "/queue/messages",
                chatMessage
        );
    }
}