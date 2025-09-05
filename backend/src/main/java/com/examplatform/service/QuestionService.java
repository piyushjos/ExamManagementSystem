package com.examplatform.service;

import com.examplatform.model.Question;
import java.util.List;

public interface QuestionService {
    Question createQuestion(Question question);
    List<Question> getQuestionsByExamId(Long examId);
}
