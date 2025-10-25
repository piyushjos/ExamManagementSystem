// src/auth/token.js
let accessToken = localStorage.getItem("accessToken");

export function setToken(token) {
    accessToken = token || null;
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
}

export function getToken() { return accessToken; }

export function clearToken() {
    accessToken = null;
    localStorage.removeItem("accessToken");
}
