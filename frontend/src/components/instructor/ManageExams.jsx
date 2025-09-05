import React from "react";
import {
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import api from "../../services/api";

const ManageExams = ({ exams, refreshExams }) => {
  const handlePublish = async (examId) => {
    try {
      await api.instructor.publishExam(examId);
      refreshExams();
    } catch (error) {
      console.error("Failed to publish exam:", error);
    }
  };

  const handleUnpublish = async (examId) => {
    try {
      await api.instructor.unpublishExam(examId);
      refreshExams();
    } catch (error) {
      console.error("Failed to unpublish exam:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Exams
      </Typography>
      {exams && exams.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell># of Questions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>{exam.course?.name || "N/A"}</TableCell>
                  <TableCell>{exam.duration}</TableCell>
                  <TableCell>{exam.numberOfQuestions || "All"}</TableCell>
                  <TableCell>
                    {exam.published ? (
                      <Chip label="Live" color="success" />
                    ) : (
                      <Chip label="Not Live" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => console.log("Edit exam:", exam.id)}
                    >
                      Edit
                    </Button>
                    {exam.published ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleUnpublish(exam.id)}
                        sx={{ ml: 1 }}
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePublish(exam.id)}
                        sx={{ ml: 1 }}
                      >
                        Publish
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No exams found.</Typography>
      )}
    </Box>
  );
};

export default ManageExams;
