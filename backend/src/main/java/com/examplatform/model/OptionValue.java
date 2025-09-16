package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class OptionValue {
    @JsonProperty("isCorrect")
    private boolean correct;     // use 'correct' to avoid isIsCorrect() getter quirks
    private String optionText;
}
