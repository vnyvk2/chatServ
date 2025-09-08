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
        // Set the sender from the authenticated user
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

                // Set the message ID for the response
                chatMessage.setId(message.getId());
            }
        }

        // Send message to chat room
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoomId(), chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage,
                        SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", principal.getName());
        chatMessage.setSender(principal.getName());
        chatMessage.setTimestamp(LocalDateTime.now());

        if (chatMessage.getChatRoomId() != null) {
            messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoomId(), chatMessage);
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
