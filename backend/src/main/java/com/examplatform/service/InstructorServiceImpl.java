package com.examplatform.service;

import com.examplatform.exception.ResourceNotFoundException;
import com.examplatform.model.Course;
import com.examplatform.model.Exam;
import com.examplatform.model.ExamResult;
import com.examplatform.model.User;
import com.examplatform.repository.CourseRepository;
import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.ExamResultRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class InstructorServiceImpl implements InstructorService {

    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final UserRepository userRepository;

    @Autowired
    public InstructorServiceImpl(CourseRepository courseRepository, ExamRepository examRepository,
                                 ExamResultRepository examResultRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentInstructor() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            String email = attr.getRequest().getHeader("X-User-Email");
            if (email != null && !email.isEmpty()) {
                return userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with email: " + email));
            }
        }
        throw new ResourceNotFoundException("Instructor email not provided in request header.");
    }


    @Override
    public Course createCourse(Course course) {
        User currentInstructor = getCurrentInstructor();
        if (course.getInstructors() == null) {
            course.setInstructors(new ArrayList<>());
        }
        if (!course.getInstructors().contains(currentInstructor)) {
            course.getInstructors().add(currentInstructor);
        }
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long courseId, Course course) {
        Course existing = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        existing.setName(course.getName());
        existing.setDescription(course.getDescription());
        return courseRepository.save(existing);
    }

    @Override
    public void deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found with id: " + courseId);
        }
        courseRepository.deleteById(courseId);
    }

    @Override
    public Exam createExam(Exam exam) {
        User currentInstructor = getCurrentInstructor();
        Long courseId = exam.getCourseId();
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID is required");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (course.getInstructors() == null || !course.getInstructors().contains(currentInstructor)) {
            throw new RuntimeException("You are not authorized for this course");
        }
        if (exam.getPassingScore() == 0) {
            exam.setPassingScore((int) Math.ceil(exam.getTotalScore() * 0.3));
        }
        exam.setCourse(course);
        exam.setPublished(false);
        return examRepository.save(exam);
    }


    @Override
    public Exam updateExam(Long examId, Exam exam) {
        Exam existingExam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        existingExam.setTitle(exam.getTitle());
        existingExam.setDuration(exam.getDuration());
        existingExam.setNumberOfQuestions(exam.getNumberOfQuestions());
        existingExam.setPassingScore(exam.getPassingScore());
        return examRepository.save(existingExam);
    }

    @Override
    public Exam publishExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setPublished(true);
        return examRepository.save(exam);
    }

    @Override
    public Exam unpublishExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setPublished(false);
        return examRepository.save(exam);
    }

    @Override
    public List<ExamResult> getExamResults(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
        return examResultRepository.findByExamId(examId);
    }

    @Override
    public List<Course> getCoursesByInstructor() {
        User currentInstructor = getCurrentInstructor();
        return courseRepository.findByInstructorsContaining(currentInstructor);
    }

    @Override
    public List<User> getEnrolledStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        User currentInstructor = getCurrentInstructor();
        if (course.getInstructors() == null || !course.getInstructors().contains(currentInstructor)) {
            throw new RuntimeException("You are not authorized to view students for this course");
        }
        return course.getEnrolledStudents();
    }

    // New: List all exams for the current instructor.
    @Override
    public List<Exam> getAllExamsForInstructor() {
        User currentInstructor = getCurrentInstructor();
        List<Course> instructorCourses = courseRepository.findByInstructorsContaining(currentInstructor);
        System.out.println("Instructor courses: " + instructorCourses);
        List<Exam> allExams = new ArrayList<>();
        for (Course course : instructorCourses) {
            List<Exam> examsOfCourse = examRepository.findByCourse(course);
            allExams.addAll(examsOfCourse);
        }
        System.out.println("Total exams for instructor: " + allExams.size());
        return allExams;
    }

}
