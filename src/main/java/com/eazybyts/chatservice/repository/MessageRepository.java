package com.eazybyts.chatservice.repository;

import com.eazybyts.chatservice.model.ChatRoom;
import com.eazybyts.chatservice.model.Message;
import com.eazybyts.chatservice.model.MessageType;
import com.eazybyts.chatservice.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);
    
    Page<Message> findByChatRoomOrderBySentAtDesc(ChatRoom chatRoom, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) AND m.messageType = :messageType ORDER BY m.sentAt ASC")
    List<Message> findPrivateMessagesBetweenUsers(User user1, User user2, MessageType messageType);
    
    @Query("SELECT m FROM Message m WHERE m.recipient = :recipient AND m.isRead = false")
    List<Message> findUnreadMessagesByRecipient(User recipient);
    
    Long countByRecipientAndIsReadFalse(User recipient);
    
    @Query("SELECT m FROM Message m WHERE m.chatRoom = :chatRoom ORDER BY m.sentAt DESC")
    Page<Message> findLatestMessagesByChatRoom(ChatRoom chatRoom, Pageable pageable);
}
