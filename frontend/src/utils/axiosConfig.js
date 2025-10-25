// src/api/axiosInstance.js
import axios from "axios";
import { getToken } from "../services/token.js";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
    timeout: 5000,
});

// ONE request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const t = getToken();
        if (t) config.headers.Authorization = `Bearer ${t}`;

        // Optional: only if your backend needs this legacy header
        const role = localStorage.getItem("role");
        const email = localStorage.getItem("email");
        if ((role === "INSTRUCTOR" || role === "STUDENT") && email) {
            config.headers["X-User-Email"] = email;
        } else {
            delete config.headers["X-User-Email"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ONE response interceptor
axiosInstance.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.code === "ECONNABORTED") {
            return Promise.reject(new Error("Request timeout - please try again"));
        }
        if (!error.response) {
            return Promise.reject(new Error("Network error - please check your connection"));
        }

        const { status, data } = error.response;
        if (status === 401) {
            // Token likely missing/expired
            console.error("401 Unauthorized");
            // Optional: redirect to login
            // if (window.location.pathname !== "/login") window.location.replace("/login");
        } else if (status >= 500) {
            console.error("Server Error:", data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
