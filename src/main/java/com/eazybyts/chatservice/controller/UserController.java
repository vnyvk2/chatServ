package com.eazybyts.chatservice.controller;

import com.eazybyts.chatservice.model.User;
import com.eazybyts.chatservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Don't send password
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/online")
    public ResponseEntity<?> getOnlineUsers() {
        List<User> onlineUsers = userRepository.findByIsOnlineTrue();
        // Don't send passwords
        onlineUsers.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(onlineUsers);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.searchUsers(query);
        // Don't send passwords
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/update-status")
    public ResponseEntity<?> updateOnlineStatus(@RequestParam Boolean isOnline, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setIsOnline(isOnline);
        userRepository.save(user);

        return ResponseEntity.ok("Status updated successfully");
    }
}
