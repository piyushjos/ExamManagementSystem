package com.examplatform.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String role;
    private String email;
    private String message;
    private String accessToken;
    private String tokenType = "Bearer";
}