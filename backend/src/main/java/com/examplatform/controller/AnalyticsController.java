package com.examplatform.controller;

import com.examplatform.projection.StudentCourseGpaRow;
import com.examplatform.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;




@RestController
@RequestMapping("/api")
public class AnalyticsController {
    private final AnalyticsService service;
    public AnalyticsController(AnalyticsService service) { this.service = service; }

    @GetMapping("/gpa")
    public List<StudentCourseGpaRow> gpaAll() { return service.gpaAll(); }

    @GetMapping("/gpa/by-student")
    public List<StudentCourseGpaRow> gpaByStudent(@RequestParam Long studentId) {
        return service.gpaByStudent(studentId);
    }


}
