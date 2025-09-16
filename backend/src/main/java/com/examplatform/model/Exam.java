package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "number_Of_questions",nullable = false)
    private int  numberOfQuestions = 0;

    @JsonProperty
    @Transient
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Question> questions = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    private int totalScore;

    @Column(nullable = false)
    private int passingScore;

    @Column(nullable = false)
    private int maxAttempts = 1;

    @Column(nullable = false)
    private boolean published = false;

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
        this.passingScore = (int) Math.ceil(this.totalScore * 0.3);
        if (this.passingScore <= 0) {
            this.passingScore = (int) Math.ceil(totalScore * 0.3);
        }
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(Exam.class);
    @PrePersist
    @PreUpdate
    private void ensureNumberOfQuestions() {
        if (this.numberOfQuestions <= 0) {
            this.numberOfQuestions = (this.questions != null) ? this.questions.size() : 0;
        }
    }


    @JsonIgnore
    @Transient
    public Exam getRandomizedExam() {
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);
        int num;
        if (numberOfQuestions > 0) {
            num = numberOfQuestions;
        } else if (!shuffled.isEmpty()) {
            num = totalScore / shuffled.getFirst().getMarks();
        } else {
            num = 0;
        }
        if (num > 0 && num < shuffled.size()) {
            shuffled = new ArrayList<>(shuffled.subList(0, num));
        }
        Exam randomized = new Exam();
        randomized.setId(this.id);
        randomized.setTitle(this.title);
        randomized.setQuestions(shuffled);
        randomized.setCourse(this.course);
        randomized.setDuration(this.duration);
        randomized.setTotalScore(this.totalScore);
        randomized.setPassingScore(this.passingScore > 0 ? this.passingScore : (int) Math.ceil(this.totalScore * 0.3));
        randomized.setPublished(this.published);
        randomized.setNumberOfQuestions(this.numberOfQuestions);
        randomized.setMaxAttempts(this.maxAttempts);
        return randomized;
    }
}

