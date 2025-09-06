package com.examplatform.service;

import com.examplatform.dto.LoginRequest;
import com.examplatform.dto.LoginResponse;
import com.examplatform.model.Role;
import com.examplatform.model.User;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service

public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Autowired
    public AuthServiceImpl(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String registerUser(LoginRequest request) {
        log.info("Starting process");
        String roleFromRequest = request.getRole();
        if (roleFromRequest == null || roleFromRequest.isEmpty()) {
            log.error("Failed to process");

            throw new RuntimeException("Role must be provided");
        }
        // Now allow instructors to register just like students.
        if ("INSTRUCTOR".equalsIgnoreCase(roleFromRequest)) {
            if(userRepository.existsByEmail(request.getEmail())){
                throw new RuntimeException("Email already exists");
            }
            Role instructorRole = roleRepository.findByRoleName("INSTRUCTOR")
                    .orElseThrow(() -> new RuntimeException("Role INSTRUCTOR not found"));
            User instructor = new User();
            instructor.setEmail(request.getEmail());
            instructor.setPassword(passwordEncoder.encode(request.getPassword()));
            instructor.setRole(instructorRole);
            instructor.setFirstName(request.getFirstName());
            instructor.setLastName(request.getLastName());
            userRepository.save(instructor);
            return "Registration successful";
        } else if ("STUDENT".equalsIgnoreCase(roleFromRequest)) {
            if(userRepository.existsByEmail(request.getEmail())){
                throw new RuntimeException("Email already exists");
            }
            Role studentRole = roleRepository.findByRoleName("STUDENT")
                    .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));
            User student = new User();
            student.setEmail(request.getEmail());
            student.setPassword(passwordEncoder.encode(request.getPassword()));
            student.setRole(studentRole);
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            userRepository.save(student);
            return "Registration successful";
        } else {
            throw new RuntimeException("Invalid role provided");
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Starting process for id");
        log.info("Lombok @Slf4j working for email={}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            log.error("Failed to process id");
            throw new RuntimeException("Invalid password");
        }
        LoginResponse response = new LoginResponse();
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getRoleName());
        response.setMessage("Login successful");
        return response;
    }
}
