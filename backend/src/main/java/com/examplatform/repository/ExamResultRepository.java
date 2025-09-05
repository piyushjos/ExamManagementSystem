package com.examplatform.repository;

import com.examplatform.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByStudentId(Long studentId);
    List<ExamResult> findByExamId(Long examId);
    boolean existsByStudentIdAndExamId(Long studentId, Long examId);

    long countByStudentIdAndExamId(Long studentId, Long examId);
}
