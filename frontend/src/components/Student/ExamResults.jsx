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
  CircularProgress
} from '@mui/material';
import api from '../../services/api';

function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await api.student.getResults();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load exam results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Your Exam Results
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title</TableCell>
              <TableCell>Course</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Taken</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.exam?.title || 'N/A'}</TableCell>
                <TableCell>{result.exam?.course?.name || 'N/A'}</TableCell>
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
                <TableCell colSpan={5} align="center">
                  <Typography>No exam results found</Typography>
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
