package com.examplatform.service;

import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import com.examplatform.model.ExamResult;
import com.examplatform.model.User;

import java.util.List;

public interface InstructorService {
    Course createCourse(Course course);
    Course updateCourse(Long courseId, Course course);
    void deleteCourse(Long courseId);
    Exam createExam(Exam exam);
    Exam updateExam(Long examId, Exam exam);
    Exam publishExam(Long examId);
    List<ExamResult> getExamResults(Long examId);

    List<Course> getCoursesByInstructor();
    List<User> getEnrolledStudents(Long courseId);

    // New: List all exams for current instructor.
    List<Exam> getAllExamsForInstructor();
    Exam unpublishExam(Long examId);

}
