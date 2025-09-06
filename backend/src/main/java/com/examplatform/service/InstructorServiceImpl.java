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
import lombok.extern.slf4j.Slf4j;                  // ✅ ADD THIS
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;

@Slf4j                                              // ✅ turns on `log` field
@Service
@Transactional
public class InstructorServiceImpl implements InstructorService {

    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final UserRepository userRepository;

    @Autowired
    public InstructorServiceImpl(CourseRepository courseRepository,
                                 ExamRepository examRepository,
                                 ExamResultRepository examResultRepository,
                                 UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.userRepository = userRepository;
    }

    /** Resolve current instructor from X-User-Email header */
    private User getCurrentInstructor() {
        log.debug("Resolving current instructor from X-User-Email header");
        ServletRequestAttributes attr =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attr != null) {
            String email = attr.getRequest().getHeader("X-User-Email");
            log.debug("Header X-User-Email='{}'", email);
            if (email != null && !email.isEmpty()) {
                User u = userRepository.findByEmail(email)
                        .orElseThrow(() -> {
                            log.debug("No instructor found for email={}", email);
                            return new ResourceNotFoundException(
                                    "Instructor not found with email: " + email);
                        });
                log.debug("Resolved instructor id={} email={}", u.getId(), u.getEmail());
                return u;
            }
        }
        log.debug("X-User-Email header missing");
        throw new ResourceNotFoundException("Instructor email not provided in request header.");
    }

    @Override
    public Course createCourse(Course course) {
        User currentInstructor = getCurrentInstructor();
        log.debug("createCourse: instructorId={} name='{}'", currentInstructor.getId(), course.getName());

        if (course.getInstructors() == null) {
            log.debug("createCourse: instructors list is null → creating new list");
            course.setInstructors(new ArrayList<>());
        }
        if (!course.getInstructors().contains(currentInstructor)) {
            log.debug("createCourse: adding instructorId={} to course", currentInstructor.getId());
            course.getInstructors().add(currentInstructor);
        }
        Course saved = courseRepository.save(course);
        log.debug("createCourse: saved courseId={}", saved.getId());
        return saved;
    }

    @Override
    public Course updateCourse(Long courseId, Course course) {
        log.debug("updateCourse: courseId={} newName='{}'", courseId, course.getName());
        Course existing = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.debug("updateCourse: course not found courseId={}", courseId);
                    return new ResourceNotFoundException("Course not found with id: " + courseId);
                });
        existing.setName(course.getName());
        existing.setDescription(course.getDescription());
        Course saved = courseRepository.save(existing);
        log.debug("updateCourse: updated courseId={}", saved.getId());
        return saved;
    }

    @Override
    public void deleteCourse(Long courseId) {
        log.debug("deleteCourse: courseId={}", courseId);
        if (!courseRepository.existsById(courseId)) {
            log.debug("deleteCourse: not found courseId={}", courseId);
            throw new RuntimeException("Course not found with id: " + courseId);
        }
        courseRepository.deleteById(courseId);
        log.debug("deleteCourse: deleted courseId={}", courseId);
    }

    @Override
    public Exam createExam(Exam exam) {
        User currentInstructor = getCurrentInstructor();
        Long courseId = exam.getCourseId();
        log.debug("createExam: instructorId={} courseId={} title='{}'",
                currentInstructor.getId(), courseId, exam.getTitle());

        if (courseId == null) {
            log.debug("createExam: courseId is null");
            throw new IllegalArgumentException("Course ID is required");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.debug("createExam: course not found courseId={}", courseId);
                    return new ResourceNotFoundException("Course not found with id: " + courseId);
                });

        if (course.getInstructors() == null || !course.getInstructors().contains(currentInstructor)) {
            log.debug("createExam: instructorId={} not authorized for courseId={}",
                    currentInstructor.getId(), courseId);
            throw new RuntimeException("You are not authorized for this course");
        }

        if (exam.getPassingScore() == 0) {
            int defaultPassing = (int) Math.ceil(exam.getTotalScore() * 0.3);
            log.debug("createExam: passingScore not set → defaulting to {}", defaultPassing);
            exam.setPassingScore(defaultPassing);
        }

        exam.setCourse(course);
        exam.setPublished(false);
        Exam saved = examRepository.save(exam);
        log.debug("createExam: saved examId={} courseId={}", saved.getId(), courseId);
        return saved;
    }

    @Override
    public Exam updateExam(Long examId, Exam exam) {
        log.debug("updateExam: examId={} title='{}' duration={} numQuestions={} passingScore={}",
                examId, exam.getTitle(), exam.getDuration(),
                exam.getNumberOfQuestions(), exam.getPassingScore());

        Exam existingExam = examRepository.findById(examId)
                .orElseThrow(() -> {
                    log.debug("updateExam: exam not found examId={}", examId);
                    return new ResourceNotFoundException("Exam not found with id: " + examId);
                });
        existingExam.setTitle(exam.getTitle());
        existingExam.setDuration(exam.getDuration());
        existingExam.setNumberOfQuestions(exam.getNumberOfQuestions());
        existingExam.setPassingScore(exam.getPassingScore());
        Exam saved = examRepository.save(existingExam);
        log.debug("updateExam: updated examId={}", saved.getId());
        return saved;
    }

    @Override
    public Exam publishExam(Long examId) {
        log.debug("publishExam: examId={}", examId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> {
                    log.debug("publishExam: exam not found examId={}", examId);
                    return new ResourceNotFoundException("Exam not found");
                });
        exam.setPublished(true);
        Exam saved = examRepository.save(exam);
        log.debug("publishExam: published examId={}", saved.getId());
        return saved;
    }

    @Override
    public Exam unpublishExam(Long examId) {
        log.debug("unpublishExam: examId={}", examId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> {
                    log.debug("unpublishExam: exam not found examId={}", examId);
                    return new ResourceNotFoundException("Exam not found");
                });
        exam.setPublished(false);
        Exam saved = examRepository.save(exam);
        log.debug("unpublishExam: unpublished examId={}", saved.getId());
        return saved;
    }

    @Override
    public List<ExamResult> getExamResults(Long examId) {
        log.debug("getExamResults: examId={}", examId);
        if (!examRepository.existsById(examId)) {
            log.debug("getExamResults: exam not found examId={}", examId);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
        List<ExamResult> results = examResultRepository.findByExamId(examId);
        log.debug("getExamResults: found {} results for examId={}", results.size(), examId);
        return results;
    }

    @Override
    public List<Course> getCoursesByInstructor() {
        User currentInstructor = getCurrentInstructor();
        log.debug("getCoursesByInstructor: instructorId={}", currentInstructor.getId());
        List<Course> courses = courseRepository.findByInstructorsContaining(currentInstructor);
        log.debug("getCoursesByInstructor: found {} courses", courses.size());
        return courses;
    }

    @Override
    public List<User> getEnrolledStudents(Long courseId) {
        log.debug("getEnrolledStudents: courseId={}", courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.debug("getEnrolledStudents: course not found courseId={}", courseId);
                    return new ResourceNotFoundException("Course not found with id: " + courseId);
                });
        User currentInstructor = getCurrentInstructor();
        if (course.getInstructors() == null || !course.getInstructors().contains(currentInstructor)) {
            log.debug("getEnrolledStudents: not authorized instructorId={} courseId={}",
                    currentInstructor.getId(), courseId);
            throw new RuntimeException("You are not authorized to view students for this course");
        }
        List<User> students = course.getEnrolledStudents();
        log.debug("getEnrolledStudents: found {} students for courseId={}", students.size(), courseId);
        return students;
    }

    /** List all exams for the current instructor */
    @Override
    public List<Exam> getAllExamsForInstructor() {
        User currentInstructor = getCurrentInstructor();
        log.debug("getAllExamsForInstructor: instructorId={}", currentInstructor.getId());
        List<Course> instructorCourses = courseRepository.findByInstructorsContaining(currentInstructor);
        log.debug("getAllExamsForInstructor: courses count={}", instructorCourses.size());

        List<Exam> allExams = new ArrayList<>();
        for (Course course : instructorCourses) {
            List<Exam> examsOfCourse = examRepository.findByCourse(course);
            log.debug("getAllExamsForInstructor: courseId={} exams added={}",
                    course.getId(), examsOfCourse.size());
            allExams.addAll(examsOfCourse);
        }
        log.debug("getAllExamsForInstructor: total exams={}", allExams.size());
        return allExams;
    }
}
