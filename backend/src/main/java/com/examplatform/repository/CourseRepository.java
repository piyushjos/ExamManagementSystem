package com.examplatform.repository;

import com.examplatform.model.Course;
import com.examplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorsContaining(User instructor);
    List<Course> findByNameContainingIgnoreCase(String keyword);
    List<Course> findByEnrolledStudentsId(Long studentId);
    boolean existsByIdAndEnrolledStudentsId(Long courseId, Long studentId);
}
