package com.examplatform.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExamWithQuestionsDTO {
    private String title;
    private Integer duration;
    private Integer totalScore;
    private Integer numberOfQuestions;
    private Integer maxAttempts;
    private Boolean published;

    // all questions of this exam
    private List<QuestionItemDTO> questions;
}
