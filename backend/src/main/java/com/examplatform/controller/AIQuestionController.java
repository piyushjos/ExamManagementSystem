package com.examplatform.controller;

import com.examplatform.dto.AIQuestionDto;
import com.examplatform.dto.AIQuestionRequest;
import com.examplatform.service.AIQuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/ai")
public class AIQuestionController {


    private final AIQuestionService aiQuestionService ;

        public AIQuestionController(AIQuestionService aiQuestionService) {
            this.aiQuestionService = aiQuestionService;
        }

        @PostMapping("/generate-questions")
        public ResponseEntity<List<AIQuestionDto>> generate(@RequestBody AIQuestionRequest request) {
            List<AIQuestionDto> result = aiQuestionService.generateQuestions(request);
            return ResponseEntity.ok(result);
        }

}
