import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import DashboardLayout from "../shared/DashboardLayout";
import DashboardCard from "../shared/DashboardCard";
import QuizIcon from "@mui/icons-material/Quiz";
import SubjectIcon from "@mui/icons-material/Subject";
import api from "../../services/api";
import { EnhancedAddExamDialog } from "../instructor/EnhancedAddExamDialog";
import ManageExams from "../instructor/ManageExams";
import { useNavigate } from "react-router-dom";

function InstructorDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [openAddExam, setOpenAddExam] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load instructor's courses
  const loadCourses = async () => {
    try {
      const coursesData = await api.instructor.getCourses();
      // coursesData is already the array from the backend
      setMyCourses(coursesData || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError("Failed to load courses");
    }
  };

  // Load exams created by the instructor
  const loadExams = async () => {
    try {
      const examsData = await api.instructor.getMyExams();
      console.log("Loaded exams:", examsData);
      setMyExams(examsData || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
      setError("Failed to load exams");
    }
  };

  useEffect(() => {
    loadCourses();
    loadExams();
  }, []);

  // When an exam is added, reload the exams list.
  const handleAddExam = async (examData) => {
    try {
      const newExam = await api.instructor.createExam(examData);
      await loadExams(); // Refresh exams list after creation.
      return newExam.id;
    } catch (error) {
      console.error("Failed to create exam:", error);
      setError("Failed to create exam");
    }
  };

  return (
    <DashboardLayout title="Instructor Dashboard">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Empower your classes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Organize course content, publish exams, and monitor student readiness with streamlined tools.
          </Typography>
        </Box>
        {error && (
          <Typography color="error">
            {error}
          </Typography>
        )}
        <Grid container spacing={3}>
          <DashboardCard
            title="My Courses"
            description={`${myCourses.length} Courses Assigned`}
            buttonText="View Courses"
            icon={<SubjectIcon />}
            onClick={() => navigate("/instructor/courses")}
            bgColor="linear-gradient(135deg, #6366F1, #818CF8)"
          />
          <DashboardCard
            title="Create Exam"
            description="Create a new exam for one of your courses"
            buttonText="Create Exam"
            icon={<QuizIcon />}
            onClick={() => setOpenAddExam(true)}
            bgColor="linear-gradient(135deg, #F97316, #FB923C)"
          />
        </Grid>
        <ManageExams exams={myExams} refreshExams={loadExams} />
        <EnhancedAddExamDialog
          open={openAddExam}
          onClose={() => setOpenAddExam(false)}
          onAddExam={handleAddExam}
          courses={myCourses}
        />
      </Box>
    </DashboardLayout>
  );
}

export default InstructorDashboard;
