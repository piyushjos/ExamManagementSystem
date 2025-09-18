package com.examplatform.repository;

import com.examplatform.projection.StudentCourseGpaRow;
import com.examplatform.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByStudentId(Long studentId);
    List<ExamResult> findByExamId(Long examId);
    boolean existsByStudentIdAndExamId(Long studentId, Long examId);

    long countByStudentIdAndExamId(Long studentId, Long examId);
    @Query("""
  select
    u.id                                   as studentId,
    concat(u.firstName, ' ', u.lastName)   as studentName,
    c.id                                   as courseId,
    c.name                                 as courseName,
    (sum(er.score) * 100.0) / sum(e.totalScore)  as avgPercent,
    (sum(er.score) * 4.0)   / sum(e.totalScore)  as gpa
  from ExamResult er
    join er.student u
    join er.exam e
    join e.course c
  where e.totalScore > 0
  group by u.id, u.firstName, u.lastName, c.id, c.name
  order by u.lastName, u.firstName, c.name
""")
    List<StudentCourseGpaRow> findStudentCourseGpaWeighted();

    @Query("""
  select
    u.id                                 as studentId,
    concat(u.firstName, ' ', u.lastName) as studentName,
    c.id                                 as courseId,
    c.name                               as courseName,
    (sum(er.score) * 100.0) / sum(e.totalScore) as avgPercent,
    (sum(er.score) * 4.0)   / sum(e.totalScore) as gpa
  from ExamResult er
    join er.student u
    join er.exam e
    join e.course c
  where u.id = :studentId and e.totalScore > 0
  group by u.id, u.firstName, u.lastName, c.id, c.name
  order by c.name
""")

    List<StudentCourseGpaRow> findStudentCourseGpaWeightedByStudent(@Param("studentId") Long studentId);
}
