import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./components/auth/Login";
import AdminDashboard from "./components/Admin/AdminDashboard";
import InstructorDashboard from "./components/instructor/InstructorDashBoard";
import StudentDashboard from "./components/Student/StudentDashBoard";
import AvailableExams from "./components/Student/AvailableExams";
import TakeExam from "./components/Student/TakeExamDialog";
import ExamResults from "./components/Student/ExamResults";

const ProtectedRoute = ({ children, allowedRole }) => {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/" replace />;
  if (role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/*"
            element={
              <ProtectedRoute allowedRole="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AvailableExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:examId"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <TakeExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <ExamResults />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
