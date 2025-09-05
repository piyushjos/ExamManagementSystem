package com.examplatform.service;

import com.examplatform.model.Course;
import java.util.List;

public interface CourseService {
    Course createCourse(Course course);
    List<Course> getAllCourses();
    Course getCourseById(Long courseId);
}
