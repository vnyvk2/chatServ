package com.eazybyts.chatservice.repository;

import com.eazybyts.chatservice.model.ChatRoom;
import com.eazybyts.chatservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByIsPrivateFalse();
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m = :user")
    List<ChatRoom> findChatRoomsByUser(User user);
    
    List<ChatRoom> findByCreatedBy(User createdBy);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.name LIKE %:searchTerm%")
    List<ChatRoom> searchChatRoomsByName(String searchTerm);
}
