package com.examplatform.dto;

import java.util.List;

public class AIQuestionDto {
    private String question;
    private List<String> options;
    private Integer correctOption;
    private Integer marks;

    public String getQuestion() {
        return question;
    }
    public void setQuestion(String question) {
        this.question = question;
    }
    public List<String> getOptions() {
        return options;
    }
    public void setOptions(List<String> options) {
        this.options = options;
    }
    public Integer getCorrectOption() {
        return correctOption;
    }
    public void setCorrectOption(Integer correctOption) {
        this.correctOption = correctOption;
    }
    public Integer getMarks() {
        return marks;
    }
    public void setMarks(Integer marks) {
        this.marks = marks;
    }
}
