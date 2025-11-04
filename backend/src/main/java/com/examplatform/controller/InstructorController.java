package com.examplatform.controller;

import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import com.examplatform.model.ExamResult;
import com.examplatform.model.User;
import com.examplatform.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.examplatform.dto.ExamWithQuestionsDTO;


import java.util.List;

@RestController
@RequestMapping("/api/instructor")
public class InstructorController {

    @Autowired
    private InstructorService instructorService;

    @PostMapping("/courses")
    public Course createCourse(@RequestBody Course course) {
        return instructorService.createCourse(course);
    }

    @GetMapping("/courses")
    public List<Course> getCoursesByInstructor() {
        return instructorService.getCoursesByInstructor();
    }

    @PutMapping("/courses/{courseId}")
    public Course updateCourse(@PathVariable Long courseId, @RequestBody Course course) {
        return instructorService.updateCourse(courseId, course);
    }

    @DeleteMapping("/courses/{courseId}")
    public void deleteCourse(@PathVariable Long courseId) {
        instructorService.deleteCourse(courseId);
    }

    @PostMapping("/exams")
    public Exam createExam(@RequestBody Exam exam) {
        return instructorService.createExam(exam);
    }

    @PutMapping("/exams/{examId}")
    public Exam updateExam(@PathVariable Long examId, @RequestBody Exam exam) {
        return instructorService.updateExam(examId, exam);
    }

    @PutMapping("/exams/{examId}/publish")
    public Exam publishExam(@PathVariable Long examId) {
        return instructorService.publishExam(examId);
    }

    @PutMapping("/exams/{examId}/unpublish")
    public Exam unpublishExam(@PathVariable Long examId) {
        return instructorService.unpublishExam(examId);
    }

    @GetMapping("/exams")
    public List<Exam> getMyExams() {
        return instructorService.getAllExamsForInstructor();
    }

    @GetMapping("/exams/{examId}/results")
    public List<ExamResult> getExamResults(@PathVariable Long examId) {
        return instructorService.getExamResults(examId);
    }

    @GetMapping("/courses/{courseId}/students")
    public List<User> getEnrolledStudents(@PathVariable Long courseId) {
        return instructorService.getEnrolledStudents(courseId);
    }
    @PutMapping("/exams/{examId}/full")
    public Exam updateExamWithQuestions(@PathVariable Long examId,
                                        @RequestBody ExamWithQuestionsDTO dto) {
        return instructorService.updateExamWithQuestions(examId, dto);
    }

}
