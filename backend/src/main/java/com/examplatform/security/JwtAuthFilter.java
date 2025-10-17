// src/main/java/com/examplatform/security/JwtAuthFilter.java
package com.examplatform.security;
import org.slf4j.MDC;
import jakarta.servlet.FilterChain;
import org.springframework.security.core.Authentication;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    public JwtAuthFilter(JwtService jwt) { this.jwt = jwt; }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        try{
            String auth = req.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                if (jwt.isValid(token)) {
                    String subject = jwt.subject(token);     // email or id
                    List<String> roles = jwt.roles(token);   // ["STUDENT"], ["ADMIN"], ...

                    var authorities = roles.stream()
                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r)) // Spring expects ROLE_*
                            .toList();

                    var authentication = new UsernamePasswordAuthenticationToken(subject, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    SecurityContextHolder.getContext().getAuthentication();

                    if (authentication.isAuthenticated()) {
                        // Usually username = email or userId from token
                        String username = authentication.getName();
                        MDC.put("userId", username);
                }
            }
            chain.doFilter(req, res);
        }

        }finally{
            MDC.clear();
        }

        }


}
