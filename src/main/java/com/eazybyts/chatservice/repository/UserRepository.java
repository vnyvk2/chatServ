package com.eazybyts.chatservice.repository;

import com.eazybyts.chatservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    List<User> findByIsOnlineTrue();
    
    @Modifying
    @Query("UPDATE User u SET u.isOnline = :isOnline WHERE u.id = :userId")
    void updateUserOnlineStatus(Long userId, Boolean isOnline);
    
    @Query("SELECT u FROM User u WHERE u.username LIKE %:searchTerm% OR u.firstName LIKE %:searchTerm% OR u.lastName LIKE %:searchTerm%")
    List<User> searchUsers(String searchTerm);
}
