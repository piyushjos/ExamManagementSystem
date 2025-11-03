import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import DashboardLayout from "../shared/DashboardLayout";
import DashboardCard from "../shared/DashboardCard";
import PersonIcon from "@mui/icons-material/Person";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [instructors, setInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [courses, setCourses] = useState([]); // courses available for assignment
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const navigate = useNavigate();

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getAllUsers();
      const users = Array.isArray(response) ? response : response.data || [];
      // Filter instructors by role.roleName
      const instructorUsers = users.filter(
        (user) => user.role && user.role.roleName === "INSTRUCTOR"
      );
      setInstructors(instructorUsers);
    } catch (err) {
      console.error("Load instructors error:", err);
      setError(err.message || "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      const response = await api.courses.getAllCourses();
      const courseList = Array.isArray(response) ? response : response.data || [];
      setAllCourses(courseList);
    } catch (err) {
      console.error("Load courses error:", err);
      setError(err.message || "Failed to load courses");
    }
  };

  // Load instructors and all courses on mount
  useEffect(() => {
    loadInstructors();
    loadAllCourses();
  }, []);

  const filteredInstructors = instructors.filter((instructor) => {
    const fullName = `${instructor.firstName} ${instructor.lastName}`.toLowerCase();
    const email = instructor.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const openAssignDialogForInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setSelectedCourseId(""); // reset selection
    // For assignment, show only courses that don't already have an instructor assigned
    const availableCourses = allCourses.filter(
      (course) => !course.instructors || course.instructors.length === 0
    );
    setCourses(availableCourses);
    setAssignDialogOpen(true);
    setError("");
  };

  const handleAssignCourse = async () => {
    if (!selectedInstructor || !selectedCourseId) return;
    try {
      setAssignLoading(true);
      console.log("Assigning course", selectedCourseId, "to instructor", selectedInstructor);
      await api.admin.assignInstructorToCourse(selectedInstructor.id, selectedCourseId);
      setAssignDialogOpen(false);
      await loadInstructors();
      await loadAllCourses();
    } catch (err) {
      console.error("Assign course error:", err);
      setError(err.message || "Failed to assign course");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back, Admin 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Keep track of instructors, assign courses instantly, and dive into analytics with a refreshed modern layout.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <DashboardCard
            title="Manage Instructors"
            description={`${instructors.length} Registered Instructors`}
            buttonText="Refresh List"
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            onClick={() => {
              loadInstructors();
              loadAllCourses();
            }}
            bgColor="linear-gradient(135deg, #6366F1, #818CF8)"
          />
          <DashboardCard
            title="Analytics"
            description="Overview of system metrics"
            buttonText="View Analytics"
            icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
            onClick={() => navigate("/admin/viewAnalytics")}
            bgColor="linear-gradient(135deg, #14B8A6, #22D3EE)"
          />
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
            border: "1px solid rgba(99, 102, 241, 0.12)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search instructors by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 0,
            overflow: "hidden",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            background: "rgba(255,255,255,0.92)",
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 2.5, md: 3 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1.5,
              alignItems: { md: "center" },
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
              background: "linear-gradient(120deg, rgba(79,70,229,0.08), rgba(6,182,212,0.08))",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Instructors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assign instructors to courses and keep roles streamlined.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => {
                loadInstructors();
                loadAllCourses();
              }}
            >
              Refresh data
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 420, overflow: "auto" }}>
              {filteredInstructors.length > 0 ? (
                <List disablePadding sx={{ py: 1.5 }}>
                  {filteredInstructors.map((instructor) => {
                    // Find the course assigned to this instructor
                    const assignedCourse = allCourses.find(
                      (course) =>
                        course.instructors &&
                        course.instructors.some((instr) => instr.id === instructor.id)
                    );
                    return (
                      <React.Fragment key={instructor.id}>
                        <ListItem
                          sx={{
                            px: { xs: 2.5, md: 3 },
                            py: 1.5,
                          }}
                          secondaryAction={
                            assignedCourse ? (
                              <Chip
                                label={assignedCourse.name}
                                color="primary"
                                sx={{ fontWeight: 600, opacity: 0.85 }}
                              />
                            ) : (
                              <Button
                                variant="outlined"
                                onClick={() => openAssignDialogForInstructor(instructor)}
                              >
                                Assign Course
                              </Button>
                            )
                          }
                        >
                          <ListItemText
                            primary={`${instructor.firstName} ${instructor.lastName}`}
                            secondary={instructor.email}
                            primaryTypographyProps={{ fontWeight: 600 }}
                            secondaryTypographyProps={{ color: "text.secondary" }}
                          />
                        </ListItem>
                        <Divider component="li" sx={{ mx: { xs: 2.5, md: 3 } }} />
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  No instructors found.
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* Assign Course Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Assign Course</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>
              Assign a course to:{" "}
              {selectedInstructor && `${selectedInstructor.firstName} ${selectedInstructor.lastName}`}
            </Typography>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="course-select-label">Select Course</InputLabel>
              <Select
                labelId="course-select-label"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                label="Select Course"
              >
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} {course.description ? `- ${course.description}` : ""}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">
                    <em>No courses available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            {error && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2.5 }}>
            <Button onClick={() => setAssignDialogOpen(false)} disabled={assignLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignCourse}
              variant="contained"
              disabled={assignLoading || !selectedCourseId}
            >
              {assignLoading ? <CircularProgress size={24} color="inherit" /> : "Assign Course"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}

export default AdminDashboard;
