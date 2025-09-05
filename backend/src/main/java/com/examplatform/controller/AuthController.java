package com.examplatform.controller;

import com.examplatform.dto.LoginRequest;
import com.examplatform.dto.LoginResponse;
import com.examplatform.exception.ResourceNotFoundException;
import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import com.examplatform.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Handles registration for both STUDENT and INSTRUCTOR
    @PostMapping("/register")
    public String registerUser(@RequestBody LoginRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PutMapping("/profile")
    public User updateProfile(@RequestBody User updatedUser) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        currentUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()){
            currentUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        // Optionally update name fields here
        if (updatedUser.getFirstName() != null) {
            currentUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            currentUser.setLastName(updatedUser.getLastName());
        }
        return userRepository.save(currentUser);
    }
}
