package com.examplatform.service;

import com.examplatform.exception.ResourceNotFoundException;
import com.examplatform.model.*;
import com.examplatform.repository.*;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamResultRepository examResultRepository;

    @Autowired
    public StudentServiceImpl(UserRepository userRepository,
                              CourseRepository courseRepository,
                              ExamRepository examRepository,
                              QuestionRepository questionRepository,
                              ExamResultRepository examResultRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.examResultRepository = examResultRepository;
    }

    @Override
    public List<Course> getEnrolledCourses() {
        User student = getCurrentStudent();
        return courseRepository.findByEnrolledStudentsId(student.getId());
    }

    @Override
    public Course enrollInCourse(Long courseId) {
        User student = getCurrentStudent();
        log.info("Fetching enrolled courses for student: {}", student.getEmail());
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getEnrolledStudents().contains(student)) {
            throw new RuntimeException("Already enrolled in course");
        }
        course.getEnrolledStudents().add(student);
        log.debug("Student {} enrolled in ", student.getEmail());
        return courseRepository.save(course);
    }

    @Override
    public List<Exam> getAvailableExams() {

        User student = getCurrentStudent();
        log.info("Fetching available exams: {}", student.getEmail());
        List<Course> courses = courseRepository.findByEnrolledStudentsId(student.getId());
        return courses.stream()
                .flatMap(course -> examRepository.findByCourseId(course.getId()).stream())
                .filter(Exam::isPublished)
                .collect(Collectors.toList());
    }

    @Override
    public Exam getExamDetails(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    }

    @Override
    @Transactional
    public String submitExam(Long examId, List<String> answers, List<Long> questionIds) {
        User student = getCurrentStudent();
        log.info("Student {} submitting exam ID {}", student.getEmail(), examId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        long attempts = examResultRepository.countByStudentIdAndExamId(student.getId(), exam.getId());
        log.debug("Student {} has {} previous attempts for exam {}", student.getEmail(), attempts, examId);
        if (attempts >= exam.getMaxAttempts()) {
            throw new RuntimeException("Exam already submitted");
        }
        // Fetch only the randomized questions using the provided question IDs.
        List<Question> questions = new ArrayList<>(questionRepository.findAllById(questionIds));
        if (answers.size() != questions.size()) {
            throw new RuntimeException("Number of answers does not match questions");
        }
        // Calculate the count of correct answers
        int correctCount = calculateScore(questions, answers);
        // Each question is worth 5 points.
//        int pointsEarned = correctCount * 5;
        int pointsEarned = 0;
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            String givenAnswer = answers.get(i);
            if (q.getCorrectAnswer().equalsIgnoreCase(givenAnswer.trim())) {
                pointsEarned += q.getMarks(); // ✅ use dynamic marks
            }
        }

        ExamResult result = new ExamResult();
        result.setStudent(student);
        result.setExam(exam);
        result.setScore(pointsEarned);
        // Compare points earned to passingScore (which is stored in points as well)
        result.setStatus(pointsEarned >= exam.getPassingScore() ? "PASS" : "FAIL");
        examResultRepository.save(result);
        return String.format("Exam submitted successfully! Score: %d/%d", pointsEarned, exam.getTotalScore());
    }

    private int calculateScore(List<Question> questions, List<String> answers) {
        int correctCount = 0;
        for (int i = 0; i < questions.size(); i++){
            if (questions.get(i).getCorrectAnswer().equalsIgnoreCase(answers.get(i))){
                correctCount++;
            }
        }
        return correctCount;
    }


    @Override
    public List<ExamResult> getResults() {
        User student = getCurrentStudent();
        log.info("MDC userId in service: {}", MDC.get("userId"));
        log.info("Fetching results for student1111");
        return examResultRepository.findByStudentId(student.getId());
    }

    @Override
    public List<Course> getAvailableCourses() {
        User student = getCurrentStudent();
        List<Course> allCourses = courseRepository.findAll();
        return allCourses.stream()
                .filter(course -> !course.getEnrolledStudents().contains(student))
                .collect(Collectors.toList());
    }

    private User getCurrentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.equals("anonymousUser")) {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attr != null) {
                email = attr.getRequest().getHeader("X-User-Email");
            }
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not authenticated"));
    }
}
