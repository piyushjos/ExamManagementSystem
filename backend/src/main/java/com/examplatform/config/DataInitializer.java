package com.examplatform.config;

import com.examplatform.model.Role;
import com.examplatform.model.User;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("INSTRUCTOR");
        createRoleIfNotFound("STUDENT");

        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
            admin.setRole(adminRole);
            userRepository.save(admin);
        }
    }

    private void createRoleIfNotFound(String roleName) {
        if (!roleRepository.findByRoleName(roleName).isPresent()) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
        }
    }
}
