package com.eazybyts.chatservice.config;

import com.eazybyts.chatservice.model.ERole;
import com.eazybyts.chatservice.model.Role;
import com.eazybyts.chatservice.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
            Role userRole = new Role(ERole.ROLE_USER);
            roleRepository.save(userRole);
        }

        if (roleRepository.findByName(ERole.ROLE_MODERATOR).isEmpty()) {
            Role modRole = new Role(ERole.ROLE_MODERATOR);
            roleRepository.save(modRole);
        }

        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
        }
    }
}
