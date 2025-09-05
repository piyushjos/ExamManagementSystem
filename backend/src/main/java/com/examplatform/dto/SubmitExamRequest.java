package com.examplatform.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmitExamRequest {
    private List<String> answers;
    private List<Long> questionIds;
}
