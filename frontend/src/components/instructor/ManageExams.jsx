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

const ManageExams = ({ exams, refreshExams, onEditExam }) => {
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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "rgba(255,255,255,0.94)",
        overflow: "hidden",
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
          background:
            "linear-gradient(120deg, rgba(79,70,229,0.1), rgba(37,99,235,0.08))",
          borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Manage Exams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control publication status and preview course alignment.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {exams?.length || 0} exam{exams?.length === 1 ? "" : "s"}
        </Typography>
      </Box>
      {exams && exams.length > 0 ? (
        <TableContainer component={Box}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell># of Questions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow
                  key={exam.id}
                  hover
                  sx={{
                    "&:last-of-type td, &:last-of-type th": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{exam.title}</TableCell>
                  <TableCell>{exam.course?.name || "N/A"}</TableCell>
                  <TableCell>{exam.duration}</TableCell>
                  <TableCell>{exam.numberOfQuestions || "All"}</TableCell>
                  <TableCell>
                    {exam.published ? (
                      <Chip
                        label="Live"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="Not Live"
                        color="default"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onEditExam && onEditExam(exam)}
                      disabled={!onEditExam}
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
        <Box sx={{ py: 5, textAlign: "center" }}>
          <Typography>No exams found.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ManageExams;
