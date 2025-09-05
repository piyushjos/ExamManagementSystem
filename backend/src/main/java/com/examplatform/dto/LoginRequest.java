package com.examplatform.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String email;
    private String password;
    // For registration: STUDENT or INSTRUCTOR
    private String role;
    // Optional fields for name
    private String firstName;
    private String lastName;
}
