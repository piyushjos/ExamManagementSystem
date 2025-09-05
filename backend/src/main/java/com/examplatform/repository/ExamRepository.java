package com.examplatform.repository;

import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse(Course course);
    @Query("SELECT e FROM Exam e WHERE e.course.id = :courseId")
    List<Exam> findByCourseId(Long courseId);
    List<Exam> findByPublishedTrue();
}
