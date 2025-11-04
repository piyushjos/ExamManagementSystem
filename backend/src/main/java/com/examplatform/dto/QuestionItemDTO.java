package com.examplatform.dto;

import com.examplatform.model.OptionValue;
import lombok.Data;

import java.util.List;

@Data
public class QuestionItemDTO {
    private Long id;
    private String questionText;
    private Integer marks;
    private List<OptionValue> options;
    private String correctAnswer;
    // later you can add isCodeQuestion, codeSnippet if needed
}
