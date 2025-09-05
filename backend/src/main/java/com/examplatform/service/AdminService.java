package com.examplatform.service;

import com.examplatform.model.User;

import java.util.List;

public interface AdminService {
    User addInstructor(User instructor);
    void removeInstructor(Long instructorId);
    User assignInstructorToCourse(Long instructorId, Long courseId);
    List<User> getAllUsers();
    String getAnalytics();
}
