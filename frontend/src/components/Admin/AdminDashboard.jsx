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
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome, Admin
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <DashboardCard
            title="Manage Instructors"
            description={`${instructors.length} Registered Instructors`}
            buttonText="Refresh List"
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            onClick={() => {
              loadInstructors();
              loadAllCourses();
            }}
            bgColor="linear-gradient(135deg, #4CAF50, #81C784)"
          />
          <DashboardCard
            title="Analytics"
            description="Overview of system metrics"
            buttonText="View Analytics"
            icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
            onClick={() => {}}
            bgColor="linear-gradient(135deg, #FF9800, #FFB74D)"
          />
        </Grid>

        {/* Search Bar */}
        <Box sx={{ mt: 4 }}>
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
        </Box>

        {/* Instructors List */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Instructors List
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ maxHeight: 300, overflow: "auto", p: 2, borderRadius: 2 }}>
              {filteredInstructors.length > 0 ? (
                <List disablePadding>
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
                          secondaryAction={
                            assignedCourse ? (
                              <Chip label={assignedCourse.name} color="primary" />
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
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body1" align="center">
                  No instructors found.
                </Typography>
              )}
            </Paper>
          )}
        </Box>

        {/* Assign Course Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Assign Course</DialogTitle>
          <DialogContent>
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
          <DialogActions sx={{ px: 3, pb: 2 }}>
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
