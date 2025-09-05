package com.examplatform.service;

import com.examplatform.model.Course;
import com.examplatform.model.ExamResult;
import com.examplatform.model.Role;
import com.examplatform.model.User;
import com.examplatform.repository.CourseRepository;
import com.examplatform.repository.ExamResultRepository;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExamResultRepository examResultRepository; // new

    @Autowired
    public AdminServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                            CourseRepository courseRepository, PasswordEncoder passwordEncoder,
                            ExamResultRepository examResultRepository) { // new param
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
        this.examResultRepository = examResultRepository; // assign new param
    }

    @Override
    public User addInstructor(User instructor) {
        if(userRepository.existsByEmail(instructor.getEmail())){
            throw new RuntimeException("Email already exists");
        }
        Role instructorRole = roleRepository.findByRoleName("INSTRUCTOR")
                .orElseThrow(() -> new RuntimeException("Role INSTRUCTOR not found"));
        // If a password is provided, encrypt it; otherwise, store an empty string.
        if (instructor.getPassword() != null && !instructor.getPassword().isEmpty()) {
            instructor.setPassword(passwordEncoder.encode(instructor.getPassword()));
        } else {
            instructor.setPassword("");
        }
        instructor.setRole(instructorRole);
        return userRepository.save(instructor);
    }


    @Override
    public void removeInstructor(Long instructorId) {
        userRepository.deleteById(instructorId);
    }

    @Override
    public User assignInstructorToCourse(Long instructorId, Long courseId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (course.getInstructors() == null) {
            course.setInstructors(new ArrayList<>());
        }
        // Add instructor if not already assigned
        if (!course.getInstructors().contains(instructor)) {
            course.getInstructors().add(instructor);
        }
        courseRepository.save(course);
        return instructor;
    }


    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public String getAnalytics() {
        // Compute overall average score from all exam results
        List<ExamResult> allResults = examResultRepository.findAll();
        if(allResults.isEmpty()){
            return "No exam results available for analytics";
        }
        double avgScore = allResults.stream()
                .mapToInt(ExamResult::getScore)
                .average()
                .orElse(0.0);
        return String.format("Total Exams: %d, Overall Average Score: %.2f", allResults.size(), avgScore);
    }
}
