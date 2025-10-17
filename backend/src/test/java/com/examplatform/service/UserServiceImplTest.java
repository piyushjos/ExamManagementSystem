package com.examplatform.service;

import com.examplatform.dto.LoginRequest;
import com.examplatform.model.Role;
import com.examplatform.model.User;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock PasswordEncoder passwordEncoder;

    // This is the class that contains registerUser(...)
    @InjectMocks AuthServiceImpl userService;

    @Test
    void registerUser_instructor_success_whenEmailIsNew() {
        // Arrange (inputs)
        LoginRequest req = new LoginRequest();
        req.setRole("INSTRUCTOR");
        req.setEmail("teach@example.com");
        req.setPassword("rawPass");
        req.setFirstName("Ada");
        req.setLastName("Lovelace");



        // Arrange (collaborators behavior)
        when(userRepository.existsByEmail("teach@example.com")).thenReturn(false);

        Role instructorRole = new Role();
        instructorRole.setRoleName("INSTRUCTOR");
        when(roleRepository.findByRoleName("INSTRUCTOR"))
                .thenReturn(Optional.of(instructorRole));

        when(passwordEncoder.encode("rawPass")).thenReturn("ENC(rawPass)");

        // capture the User we save to assert its fields later
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        String result = userService.registerUser(req);

        // Assert (return value)
        assertEquals("Registration successful", result);

        // Assert (interactions)
        verify(userRepository).existsByEmail("teach@example.com");
        verify(roleRepository).findByRoleName("INSTRUCTOR");
        verify(passwordEncoder).encode("rawPass");
        verify(userRepository).save(userCaptor.capture());

        // Assert (saved entity fields)
        User saved = userCaptor.getValue();
        assertEquals("teach@example.com", saved.getEmail());
        assertEquals("ENC(rawPass)", saved.getPassword());
        assertEquals(instructorRole, saved.getRole());
        assertEquals("Ada", saved.getFirstName());
        assertEquals("Lovelace", saved.getLastName());
    }

    @Test
    void registerUser_instructor_throws_whenEmailExists() {
        // --- Arrange (YOUR TURN) ---
        // 1) Build a LoginRequest with role=INSTRUCTOR, email=dup@x.com, some password/name.
        // 2) Stub userRepository.existsByEmail("dup@x.com") to return true.
        //    (No stubs for roleRepository or save — they shouldn't be called in this path.)

         LoginRequest req = new LoginRequest();
         req.setRole("INSTRUCTOR");
         req.setEmail("dup@x.com");
         req.setPassword("secret");
         req.setFirstName("Test");
         req.setLastName("User");

         when(userRepository.existsByEmail("dup@x.com")).thenReturn(true);

//         --- Act + Assert (we'll add together after you finish Arrange) ---
         assertThrows(IllegalStateException.class, () -> userService.registerUser(req));
         verify(userRepository).existsByEmail("dup@x.com");
         verify(userRepository, never()).save(any());
         verifyNoInteractions(passwordEncoder, roleRepository);
    }




}
