import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import DashboardLayout from "../shared/DashboardLayout";
import DashboardCard from "../shared/DashboardCard";
import SubjectIcon from "@mui/icons-material/Subject";
import DetailsIcon from "@mui/icons-material/Details";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import TakeExamDialog from "./TakeExamDialog";

function StudentDashboard() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableExams, setAvailableExams] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [openTakeExamDialog, setOpenTakeExamDialog] = useState(false);

    const navigate = useNavigate();

    const loadStudentData = async () => {
        try {
            setLoading(true);
            const enrolled = await api.student.getEnrolledCourses();
            const exams = await api.student.getAvailableExams();

            const available = await api.student.getAvailableCourses();
            const results = await api.student.getResults();
            setEnrolledCourses(Array.isArray(enrolled) ? enrolled : []);
            setAvailableExams(Array.isArray(exams) ? exams : []);
            setAvailableCourses(Array.isArray(available) ? available : []);
            setExamResults(Array.isArray(results) ? results : []);
        } catch (err) {
            console.error("Failed to load student data:", err);
            setError("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudentData();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            await api.student.enrollInCourse(courseId);
            setOpenEnrollDialog(false);
            await loadStudentData();
        } catch (err) {
            console.error("Failed to enroll in course:", err);
            setError("Failed to enroll in course");
        }
    };

    const handleAttemptExam = (exam) => {
        console.log("attempt exam",exam)
        // Check if result exists for this exam—if so, show the result and do not allow reattempt
        const existingResult = examResults.find(
            (result) => result.exam?.id === exam.id
        );
        if (existingResult) {
            alert(
                `You have already attempted this exam. Score: ${
                    existingResult.score * 5
                }/${exam.totalScore} (${existingResult.status}).`
            );
            return;
        }
        setSelectedExam(exam);
        setOpenTakeExamDialog(true);
    };

    if (loading) {
        return (
            <DashboardLayout title="Student Dashboard">
                <Box sx={{ textAlign: "center", py: 12 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>
                        Loading your dashboard...
                    </Typography>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Student Dashboard">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Your learning hub
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Track course progress, attempt exams, and review
                        outcomes in one intuitive space.
                    </Typography>
                </Box>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                {enrolledCourses.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: "1px dashed rgba(79, 70, 229, 0.3)",
                            textAlign: "center",
                            background:
                                "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(14,165,233,0.08))",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            No enrolled courses yet
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1.5, mb: 3 }}
                        >
                            Enroll in courses to start preparing for your
                            upcoming exams.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenEnrollDialog(true)}
                        >
                            Browse available courses
                        </Button>
                    </Paper>
                ) : (
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, mb: 2 }}
                        >
                            Enrolled Courses
                        </Typography>
                        <Grid container spacing={3}>
                            {enrolledCourses.map((course) => (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Card
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            background:
                                                "linear-gradient(155deg, rgba(255,255,255,0.95), rgba(255,255,255,0.78))",
                                            border: "1px solid rgba(79, 70, 229, 0.12)",
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {course.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {course.description ||
                                                    "No course description provided."}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ mt: 1 }}
                                            >
                                                Instructor
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {course.instructors &&
                                                course.instructors.length > 0
                                                    ? course.instructors[0].email
                                                    : "Not assigned"}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Grid container spacing={3}>
                    <DashboardCard
                        title="Available Courses"
                        description={`${availableCourses.length} Courses`}
                        buttonText="Enroll"
                        icon={<SubjectIcon />}
                        onClick={() => setOpenEnrollDialog(true)}
                        bgColor="linear-gradient(135deg, #6366F1, #818CF8)"
                    />
                    <DashboardCard
                        title="Exam Results"
                        description="View your exam results"
                        buttonText="View Results"
                        icon={<DetailsIcon />}
                        onClick={() => navigate("/student/results")}
                        bgColor="linear-gradient(135deg, #14B8A6, #22D3EE)"
                    />
                </Grid>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: "1px solid rgba(148, 163, 184, 0.25)",
                        background: "rgba(255,255,255,0.92)",
                    }}
                >
                    <Box
                        sx={{
                            px: { xs: 2.5, md: 3.5 },
                            py: { xs: 2.5, md: 3 },
                            borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            alignItems: { md: "center" },
                            justifyContent: "space-between",
                            gap: 1.5,
                            background:
                                "linear-gradient(120deg, rgba(79,70,229,0.08), rgba(6,182,212,0.08))",
                        }}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Available Exams
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Attempt exams when ready and monitor attempts at
                                a glance.
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {availableExams.length} exam
                            {availableExams.length === 1 ? "" : "s"} available
                        </Typography>
                    </Box>
                    {availableExams.length === 0 ? (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <Typography>
                                No exams available at the moment.
                            </Typography>
                        </Box>
                    ) : (
                        availableExams.map((exam, index) => {
                            const examResult = examResults.find(
                                (result) => result.exam?.id === exam.id
                            );
                            return (
                                <Box
                                    key={exam.id}
                                    sx={{
                                        px: { xs: 2.5, md: 3.5 },
                                        py: { xs: 2.5, md: 3 },
                                        borderBottom:
                                            index ===
                                            availableExams.length - 1
                                                ? "none"
                                                : "1px solid rgba(148, 163, 184, 0.18)",
                                        display: "grid",
                                        gap: 0.75,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {exam.title}
                                    </Typography>
                                    <Typography variant="body2">
                                        Duration: {exam.duration} minutes
                                    </Typography>
                                    <Typography variant="body2">
                                        Total Score: {exam.totalScore}
                                    </Typography>
                                    <Typography variant="body2">
                                        Attempts Allowed: {exam.maxAttempts}
                                    </Typography>
                                    {examResult ? (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color:
                                                    examResult.status === "PASS"
                                                        ? "success.main"
                                                        : "error.main",
                                                mt: 1,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Score: {examResult.score}/
                                            {exam.totalScore} —{" "}
                                            {examResult.status}
                                        </Typography>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            sx={{
                                                mt: 1.5,
                                                width: {
                                                    xs: "100%",
                                                    sm: "auto",
                                                },
                                            }}
                                            onClick={() =>
                                                handleAttemptExam(exam)
                                            }
                                        >
                                            Attempt Exam
                                        </Button>
                                    )}
                                </Box>
                            );
                        })
                    )}
                </Paper>

                <Dialog
                    open={openEnrollDialog}
                    onClose={() => setOpenEnrollDialog(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        Enroll in a Course
                    </DialogTitle>
                    <DialogContent dividers>
                        {availableCourses.length === 0 ? (
                            <Typography>
                                No courses available for enrollment.
                            </Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {availableCourses.map((course) => (
                                    <Box
                                        key={course.id}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 2,
                                            border: "1px solid rgba(148,163,184,0.2)",
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1.5,
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ fontWeight: 600 }}>
                                                {course.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {course.description || "No description provided"}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleEnroll(course.id)}
                                        >
                                            Enroll
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => setOpenEnrollDialog(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <TakeExamDialog
                    open={openTakeExamDialog}
                    examId={selectedExam ? selectedExam.id : null}
                    onClose={() => {
                        setOpenTakeExamDialog(false);
                        loadStudentData(); // refresh data so exam results update
                    }}
                />
            </Box>
        </DashboardLayout>
    );
}

export default StudentDashboard;
