package com.examplatform.service;

import com.examplatform.model.ExamResult;
import com.examplatform.repository.ExamResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExamResultServiceImpl implements ExamResultService {

    @Autowired
    private ExamResultRepository examResultRepository;

    @Override
    public ExamResult saveExamResult(ExamResult examResult) {
        return examResultRepository.save(examResult);
    }

    @Override
    public List<ExamResult> getResultsByStudentId(Long studentId) {
        return examResultRepository.findByStudentId(studentId);
    }

    @Override
    public List<ExamResult> getResultsByExamId(Long examId) {
        return examResultRepository.findByExamId(examId);
    }

    @Override
    public boolean existsByStudentIdAndExamId(Long studentId, Long examId) {
        return examResultRepository.existsByStudentIdAndExamId(studentId, examId);
    }
}
