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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import api from '../../services/api';

function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadExamResults(selectedExamId);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      // This endpoint needs to be added to the API service
      const response = await api.instructor.getExams();
      setExams(Array.isArray(response) ? response : []);
      if (response.length > 0) {
        setSelectedExamId(response[0].id);
      }
    } catch (err) {
      setError('Failed to load exams');
      console.error(err);
    }
  };

  const loadExamResults = async (examId) => {
    try {
      setLoading(true);
      const data = await api.instructor.getExamResults(examId);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load exam results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) return { avgScore: 0, passRate: 0 };
    
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const passedCount = results.filter(result => result.passed).length;
    
    return {
      avgScore: (totalScore / results.length).toFixed(2),
      passRate: ((passedCount / results.length) * 100).toFixed(1)
    };
  };

  const stats = calculateStats();

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
        Exam Results
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Exam</InputLabel>
        <Select
          value={selectedExamId}
          label="Select Exam"
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          {exams.map((exam) => (
            <MenuItem key={exam.id} value={exam.id}>
              {exam.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedExamId && results.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Statistics
          </Typography>
          <Typography>Average Score: {stats.avgScore}</Typography>
          <Typography>Pass Rate: {stats.passRate}%</Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submission Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.student?.email || 'N/A'}</TableCell>
                <TableCell align="right">{result.score}</TableCell>
                <TableCell>
                  <Typography
                    color={result.passed ? 'success.main' : 'error.main'}
                  >
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(result.submittedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography>No results found for this exam</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ExamResults;
