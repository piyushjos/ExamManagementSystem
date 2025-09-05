import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await api.student.getAvailableExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load available exams", err);
      setError("Failed to load available exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <CircularProgress />
        <Typography>Loading available exams...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Exams
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {exams.length === 0 ? (
        <Typography>No exams available at the moment.</Typography>
      ) : (
        <List>
          {exams.map((exam) => (
            <React.Fragment key={exam.id}>
              <ListItem 
                secondaryAction={
                  <Button variant="contained" onClick={() => navigate(`/student/exam/${exam.id}`)}>
                    Attempt Exam
                  </Button>
                }
              >
                <ListItemText 
                  primary={exam.title}
                  secondary={`Duration: ${exam.duration} minutes`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AvailableExams;
