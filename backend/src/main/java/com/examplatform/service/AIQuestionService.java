package com.examplatform.service;



import com.examplatform.dto.AIQuestionDto;
import com.examplatform.dto.AIQuestionRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIQuestionService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AIQuestionDto> generateQuestions(AIQuestionRequest req) {
        // 1. build prompt
        String prompt = buildPrompt(req);

        // 2. call Groq
        String raw = callGroq(prompt);

        // 3. parse JSON coming back from model
        List<AIQuestionDto> questions = parseQuestions(raw);

        // 4. safety: fix marks + size
        questions.forEach(q -> {
            if (q.getMarks() == null) {
                q.setMarks(req.getMarksPerQuestion());
            }
        });

        if (questions.size() > req.getNumQuestions()) {
            questions = questions.subList(0, req.getNumQuestions());
        }

        return questions;
    }

    private String buildPrompt(AIQuestionRequest req) {
        return """
            You are an exam question generator.

            Generate exactly %d multiple-choice questions on the topic: "%s".

            Requirements:
            - Each question MUST have exactly 4 options.
            - Return the correct option as a zero-based index in field "correctOption".
            - Set "marks" = %d for every question.
            - Respond ONLY with a valid JSON array. No extra text. No explanation.
            Example:
            [
              {
                "question": "What is polymorphism?",
                "options": ["...","...","...","..."],
                "correctOption": 0,
                "marks": %d
              }
            ]
            """
                .formatted(
                        req.getNumQuestions(),
                        req.getTopic(),
                        req.getMarksPerQuestion(),
                        req.getMarksPerQuestion()
                );
    }

    private String callGroq(String prompt) {
        String url = "https://api.groq.com/openai/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.1-8b-instant"); // pick any Groq model available to you
        body.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));
        body.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        // Groq is OpenAI compatible:
        Map firstChoice = (Map) ((List) response.getBody().get("choices")).get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content"); // this should be the JSON array text
    }

    private List<AIQuestionDto> parseQuestions(String rawJson) {
        try {
            return objectMapper.readValue(rawJson, new TypeReference<List<AIQuestionDto>>() {});
        } catch (Exception e) {
            // if LLM added something weird, just return empty, frontend can handle it
            return Collections.emptyList();
        }
    }
}
