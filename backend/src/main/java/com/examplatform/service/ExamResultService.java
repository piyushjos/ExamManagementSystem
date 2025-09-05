package com.examplatform.service;

import com.examplatform.model.ExamResult;
import java.util.List;

public interface ExamResultService {
    ExamResult saveExamResult(ExamResult examResult);
    List<ExamResult> getResultsByStudentId(Long studentId);
    List<ExamResult> getResultsByExamId(Long examId);
    boolean existsByStudentIdAndExamId(Long studentId, Long examId);
}
