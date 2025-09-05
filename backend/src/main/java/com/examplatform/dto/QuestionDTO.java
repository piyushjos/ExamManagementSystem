package com.examplatform.dto;

import lombok.Data;

@Data
public class QuestionDTO {
    private Long examId;
    private String questionText;
    private String questionType;
    private int marks;
    private boolean isCodeQuestion;
    private String codeSnippet;
    private String options;       // This will be a JSON string of options
    private String correctAnswer; // The text of the correct option
}
