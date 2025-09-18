package com.examplatform.service;

import com.examplatform.projection.StudentCourseGpaRow;
import com.examplatform.repository.ExamResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {
    private final ExamResultRepository repo;
    public AnalyticsService(ExamResultRepository repo) { this.repo = repo; }

    public List<StudentCourseGpaRow> gpaAll() { return repo.findStudentCourseGpaWeighted(); }
    public List<StudentCourseGpaRow> gpaByStudent(Long studentId) { return repo.findStudentCourseGpaWeightedByStudent(studentId); }

}
