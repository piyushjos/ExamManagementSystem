// src/main/java/com/examplatform/security/JwtService.java
package com.examplatform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        // HS256 requires 32+ chars
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Missing jwt.secret. Supply it via application properties or JWT_SECRET env var.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 bytes for HS256.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(String subject, List<String> roles, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)              // email or userId
                .claim("roles", roles)            // <-- put roles inside token
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(ttl)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try { parse(token); return true; } catch (JwtException | IllegalArgumentException e) { return false; }
    }
    public String subject(String token) { return parse(token).getBody().getSubject(); }

    @SuppressWarnings("unchecked")
    public List<String> roles(String token) {
        Object v = parse(token).getBody().get("roles");
        return v instanceof List<?> l ? (List<String>) l : List.of();
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}

//What do the methods do?
//
//        issue(subject, roles, ttl) → makes a token (adds user + roles + expiry, then signs).
//
//        isValid(token) → verifies the signature and expiry. If invalid/expired → reject.
//
//        subject(token) → reads the user id/email from the token.
//
//        roles(token) → reads the roles array from the token.
