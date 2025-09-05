package com.examplatform.controller;

import com.examplatform.dto.QuestionDTO;
import com.examplatform.exception.ResourceNotFoundException;
import com.examplatform.model.Exam;
import com.examplatform.model.Question;
import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @PostMapping
    public Question createQuestion(@RequestBody QuestionDTO questionDTO) {
        // Look up the exam using examId from the DTO
        Exam exam = examRepository.findById(questionDTO.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + questionDTO.getExamId()));
        // Create and populate the Question entity
        Question question = new Question();
        question.setText(questionDTO.getQuestionText());
        question.setMarks(questionDTO.getMarks());
        question.setOptions(questionDTO.getOptions());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        // If your Question entity should store codeSnippet and isCodeQuestion,
        // you need to add these fields to the entity as well.
        question.setExam(exam);
        return questionRepository.save(question);
    }

    @GetMapping("/exam/{examId}")
    public java.util.List<Question> getQuestionsByExamId(@PathVariable Long examId) {
        return questionRepository.findByExamId(examId);
    }
}
