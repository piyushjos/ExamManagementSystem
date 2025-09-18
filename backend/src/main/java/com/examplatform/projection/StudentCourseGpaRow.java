package com.examplatform.projection;

public interface StudentCourseGpaRow {
    Long   getStudentId();
    String getStudentName();
    int   getCourseId();
    String getCourseName();
    Double getAvgPercent();
    Double getGpa();

}
