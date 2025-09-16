package com.examplatform.service;

import com.examplatform.model.Question;
import com.examplatform.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public Question createQuestion(Question question) {
        System.out.print(("my question" + question));
        return questionRepository.save(question);
    }

    @Override
    public List<Question> getQuestionsByExamId(Long examId) {
        System.out.println("question list");
        return questionRepository.findByExamId(examId);
    }
}
