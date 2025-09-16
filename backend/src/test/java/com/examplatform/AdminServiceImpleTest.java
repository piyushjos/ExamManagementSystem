package com.examplatform;

import com.examplatform.model.Role;
import com.examplatform.model.User;
import com.examplatform.repository.CourseRepository;
import com.examplatform.repository.ExamResultRepository;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import com.examplatform.service.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    UserRepository userRepository;
    @Mock
    RoleRepository roleRepository;
    @Mock
    CourseRepository courseRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    ExamResultRepository examResultRepository;

    AdminServiceImpl service;

    @BeforeEach
    void setUp() {
        // ← pure unit test: no Spring context needed
        service = new AdminServiceImpl(userRepository, roleRepository, courseRepository,
                passwordEncoder, examResultRepository);
    }

    @Test
    void addInstructor_encodesPassword_setsRole_andSaves() {
        // Arrange (given)
        User input = new User();
        input.setEmail("alice@x.com");
        input.setPassword("plain");

        Role instructor = new Role();
        instructor.setRoleName("INSTRUCTOR");

        when(userRepository.existsByEmail("alice@x.com")).thenReturn(false);
        when(roleRepository.findByRoleName("INSTRUCTOR")).thenReturn(Optional.of(instructor));
        when(passwordEncoder.encode("plain")).thenReturn("ENC(plain)");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(100L);
            return u;
        });

        // Act (when)
        User saved = service.addInstructor(input);

        // Assert (then)
        assertEquals(100L, saved.getId());
        assertEquals("ENC(plain)", saved.getPassword());
        assertEquals(instructor, saved.getRole());

        // Also verify we called collaborators correctly
        verify(userRepository).existsByEmail("alice@x.com");
        verify(roleRepository).findByRoleName("INSTRUCTOR");
        verify(passwordEncoder).encode("plain");
        verify(userRepository).save(any(User.class));
        verifyNoMoreInteractions(userRepository, roleRepository, passwordEncoder);
    }
}

