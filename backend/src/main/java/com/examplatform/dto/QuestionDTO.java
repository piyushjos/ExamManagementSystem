package com.examplatform.dto;

import com.examplatform.model.OptionValue;
import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {
    private Long examId;
    private String questionText;
    private String questionType;
    private int marks;
    private boolean isCodeQuestion;
    private String codeSnippet;
    private List<OptionValue> options;       // This will be a JSON string of options
    private String correctAnswer; // The text of the correct option
}
