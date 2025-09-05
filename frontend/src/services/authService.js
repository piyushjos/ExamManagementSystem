// src/services/authService.js
import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};
