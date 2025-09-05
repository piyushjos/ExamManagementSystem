package com.examplatform.controller;

import com.examplatform.model.User;
import com.examplatform.model.Role;
import com.examplatform.repository.RoleRepository;
import com.examplatform.repository.UserRepository;
import com.examplatform.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/instructors")
    public User addInstructor(@RequestBody User instructor) {
        return adminService.addInstructor(instructor);
    }

    @DeleteMapping("/instructors/{instructorId}")
    public void removeInstructor(@PathVariable Long instructorId) {
        adminService.removeInstructor(instructorId);
    }

    @PutMapping("/instructors/{instructorId}/assign-course/{courseId}")
    public User assignInstructorToCourse(@PathVariable Long instructorId, @PathVariable Long courseId) {
        return adminService.assignInstructorToCourse(instructorId, courseId);
    }

    // Existing endpoint to list all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    // New endpoint: list instructors only
    @GetMapping("/instructors")
    public List<User> getInstructors() {
        Role instructorRole = roleRepository.findByRoleName("INSTRUCTOR")
                .orElseThrow(() -> new RuntimeException("Role INSTRUCTOR not found"));
        return userRepository.findAllByRole(instructorRole);
    }

    // New endpoint: update instructor details
    @PutMapping("/instructors/{instructorId}")
    public User updateInstructor(@PathVariable Long instructorId, @RequestBody User updatedInstructor) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        instructor.setEmail(updatedInstructor.getEmail());
        if(updatedInstructor.getPassword() != null && !updatedInstructor.getPassword().isEmpty()){
            // If needed, ensure the password is encoded – or rely on a service layer method
            instructor.setPassword(updatedInstructor.getPassword());
        }
        return userRepository.save(instructor);
    }

    @GetMapping("/analytics")
    public String getAnalytics() {
        return adminService.getAnalytics();
    }
}
