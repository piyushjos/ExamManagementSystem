package com.examplatform.service;

import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import com.examplatform.model.ExamResult;

import java.util.List;

public interface StudentService {
    List<Course> getEnrolledCourses();
    Course enrollInCourse(Long courseId);
    List<Exam> getAvailableExams();
    Exam getExamDetails(Long examId);
    String submitExam(Long examId, List<String> answers, List<Long> questionIds);
    List<ExamResult> getResults();
    List<Course> getAvailableCourses();
}
