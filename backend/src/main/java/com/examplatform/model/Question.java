package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

//    @Column(nullable = false, columnDefinition = "TEXT")
//    private String options; // JSON string representing options
@Convert(converter = OptionListJsonConverter.class)
@Column(name = "options", columnDefinition = "JSON") // use "TEXT" if your column isn't JSON type
private List<OptionValue> options = new ArrayList<>();



    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(nullable = false)
    private int marks;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonBackReference   // Prevent infinite recursion when serializing
    private Exam exam;
}
