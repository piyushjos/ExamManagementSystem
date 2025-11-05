import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import DashboardLayout from "../shared/DashboardLayout";
import DashboardCard from "../shared/DashboardCard";
import QuizIcon from "@mui/icons-material/Quiz";
import SubjectIcon from "@mui/icons-material/Subject";
import api from "../../services/api";
import { EnhancedAddExamDialog } from "../instructor/EnhancedAddExamDialog";
import ManageExams from "../instructor/ManageExams";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function InstructorDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [examDialog, setExamDialog] = useState({
    open: false,
    mode: "create",
    exam: null,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { examId: routeExamId } = useParams();
  const examFromRouteState = location.state?.exam;
  const skipRouteSyncRef = useRef(false);

  const openCreateDialog = () => {
    skipRouteSyncRef.current = true;
    if (location.pathname !== "/instructor") {
      navigate("/instructor", { replace: true });
    }
    setExamDialog({ open: true, mode: "create", exam: null });
  };

  const handleDialogClose = () => {
    skipRouteSyncRef.current = true;
    setExamDialog({ open: false, mode: "create", exam: null });
    if (routeExamId) {
      navigate("/instructor", { replace: true });
    }
  };

  const handleEditExam = (exam) => {
    if (!exam) {
      return;
    }
    navigate(`/instructor/exams/${exam.id}/edit`, { state: { exam } });
    setExamDialog({ open: true, mode: "edit", exam });
  };

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

  useEffect(() => {
    if (!routeExamId) {
      if (skipRouteSyncRef.current) {
        skipRouteSyncRef.current = false;
      }
      setExamDialog((prev) => {
        if (!prev.open || prev.mode !== "edit") {
          return prev;
        }
        return { open: false, mode: "create", exam: null };
      });
      return;
    }

    if (skipRouteSyncRef.current) {
      return;
    }

    const matchedExam =
      examFromRouteState ||
      myExams.find((exam) => String(exam.id) === String(routeExamId));

    if (!matchedExam) {
      return;
    }

    setExamDialog((prev) => {
      if (prev.open && prev.mode === "edit" && prev.exam?.id === matchedExam.id) {
        return prev;
      }
      return { open: true, mode: "edit", exam: matchedExam };
    });
  }, [routeExamId, examFromRouteState, myExams]);

  // When an exam is added, reload the exams list.
  const handleAddExam = async (examData) => {
    try {
      const newExam = await api.instructor.createExam(examData);
      await loadExams(); // Refresh exams list after creation.
      setError("");
      return newExam.id;
    } catch (error) {
      console.error("Failed to create exam:", error);
      setError("Failed to create exam");
    }
  };

  const handleUpdateExam = async (examId, examData) => {
    try {
      const updatedExam = await api.instructor.updateExamWithQuestions(examId, examData);
      await loadExams();
      setError("");
      return updatedExam;
    } catch (error) {
      console.error("Failed to update exam:", error);
      setError("Failed to update exam");
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
            onClick={openCreateDialog}
            bgColor="linear-gradient(135deg, #F97316, #FB923C)"
          />
        </Grid>
        <ManageExams exams={myExams} refreshExams={loadExams} onEditExam={handleEditExam} />
        <EnhancedAddExamDialog
          open={examDialog.open}
          onClose={handleDialogClose}
          onAddExam={handleAddExam}
          onUpdateExam={handleUpdateExam}
          courses={myCourses}
          mode={examDialog.mode}
          initialExam={examDialog.exam}
        />
      </Box>
    </DashboardLayout>
  );
}

export default InstructorDashboard;
