package com.examplatform.dto;

public class AIQuestionRequest {
    private String topic;
    private int numQuestions;
    private int marksPerQuestion;

    public String getTopic() {
        return topic;
    }
    public void setTopic(String topic) {
        this.topic = topic;
    }
    public int getNumQuestions() {
        return numQuestions;
    }
    public void setNumQuestions(int numQuestions) {
        this.numQuestions = numQuestions;
    }
    public int getMarksPerQuestion() {
        return marksPerQuestion;
    }
    public void setMarksPerQuestion(int marksPerQuestion) {
        this.marksPerQuestion = marksPerQuestion;
    }

}
