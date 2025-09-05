package com.examplatform.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class ExamResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private String status; // e.g., PASS or FAIL
}
