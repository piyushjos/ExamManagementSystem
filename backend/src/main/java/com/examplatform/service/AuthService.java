package com.examplatform.service;

import com.examplatform.dto.LoginRequest;
import com.examplatform.dto.LoginResponse;

public interface AuthService {
    String registerUser(LoginRequest request);
    LoginResponse login(LoginRequest request);
}
