package com.examplatform.controller;

import com.examplatform.dto.SubmitExamRequest;
import com.examplatform.exception.ResourceNotFoundException;
import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import com.examplatform.model.ExamResult;
import com.examplatform.repository.ExamRepository;
import com.examplatform.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExamRepository examRepository;

    @GetMapping("/courses")
    public List<Course> getEnrolledCourses() {
        return studentService.getEnrolledCourses();
    }

    @PostMapping("/courses/{courseId}/enroll")
    public Course enrollInCourse(@PathVariable Long courseId) {
        return studentService.enrollInCourse(courseId);
    }

    // New endpoint: list available courses (not yet enrolled)
    @GetMapping("/courses/available")
    public List<Course> getAvailableCourses() {
        return studentService.getAvailableCourses();
    }

    @GetMapping("/exams")
    public List<Exam> getAvailableExams() {
        return studentService.getAvailableExams();
    }

    @GetMapping("/exams/{examId}")
    public Exam getExamDetails(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        return exam.getRandomizedExam();  // Return only the randomized subset of questions
    }


    @PostMapping("/exams/{examId}/submit")
    public String submitExam(@PathVariable Long examId, @RequestBody SubmitExamRequest request) {
        return studentService.submitExam(examId, request.getAnswers(), request.getQuestionIds());
    }

    @GetMapping("/results")
    public List<ExamResult> getResults() {
        return studentService.getResults();
    }
}
