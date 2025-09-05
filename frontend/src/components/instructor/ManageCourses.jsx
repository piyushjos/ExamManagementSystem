import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, course: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.instructor.getCourses();
      setCourses(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async () => {
    try {
      await api.instructor.updateCourse(editDialog.course.id, {
        name: editDialog.course.name,
        description: editDialog.course.description
      });
      setSnackbar({
        open: true,
        message: 'Course updated successfully',
        severity: 'success'
      });
      setEditDialog({ open: false, course: null });
      loadCourses();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update course',
        severity: 'error'
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.instructor.deleteCourse(courseId);
        setSnackbar({
          open: true,
          message: 'Course deleted successfully',
          severity: 'success'
        });
        loadCourses();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete course',
          severity: 'error'
        });
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Manage Courses
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Students Enrolled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditDialog({ open: true, course: { ...course } })}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteCourse(course.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography>No courses found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Course Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, course: null })}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            value={editDialog.course?.name || ''}
            onChange={(e) =>
              setEditDialog({
                ...editDialog,
                course: { ...editDialog.course, name: e.target.value }
              })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editDialog.course?.description || ''}
            onChange={(e) =>
              setEditDialog({
                ...editDialog,
                course: { ...editDialog.course, description: e.target.value }
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, course: null })}>
            Cancel
          </Button>
          <Button onClick={handleEditCourse} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ManageCourses;
