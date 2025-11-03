import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import api from '../../services/api';

function Login() {
  const [tab, setTab] = useState(0); // 0 for login, 1 for register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Default to STUDENT; user can change to INSTRUCTOR (Faculty)
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setSelectedRole('STUDENT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 1) { // Registration
        const response = await api.auth.register({
          email,
          password,
          role: selectedRole, // "STUDENT" or "INSTRUCTOR"
          firstName,
          lastName
        });
        if (response) {
          setTab(0);
          setError('Registration successful! Please login.');
        }
      } else { // Login
        const response = await api.auth.login({
          email,
          password
        });
        if (!response || !response.role) {
          throw new Error('Invalid login response');
        }
        const { role } = response;
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', role);

        // Redirect based on role
        switch (role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'INSTRUCTOR':
            navigate('/instructor/dashboard');
            break;
          case 'STUDENT':
            navigate('/student/dashboard');
            break;
          default:
            throw new Error('Invalid role received');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0f7fa 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.25), transparent 70%)',
          top: '-160px',
          left: '-120px',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.18), transparent 75%)',
          bottom: '-140px',
          right: '-120px',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 5,
              p: 5,
              background: 'linear-gradient(155deg, rgba(79,70,229,0.9), rgba(6,182,212,0.85))',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Box>
              <SchoolIcon sx={{ fontSize: 52, mb: 3 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Exam Management System
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, maxWidth: 380, opacity: 0.9 }}>
                Manage exams, automate grading, and deliver seamless experiences for administrators, instructors, and students.
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5, mt: 6 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Why teams love EMS
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                - Centralized exam creation and assignment
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                - Real-time analytics for student performance
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                - Guided workflows for every role
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 5,
                p: { xs: 3.5, md: 5 },
                background: 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(255,255,255,0.85))',
                boxShadow: '0 28px 60px rgba(15, 23, 42, 0.12)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
              }}
            >
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary' }}>
                  Welcome to EMS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {tab === 0 ? 'Sign in to continue' : 'Create your account'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tab === 0
                    ? 'Enter your credentials to access your personalized dashboard.'
                    : 'Register to start managing courses, exams, and results.'}
                </Typography>
              </Box>

              <Tabs
                value={tab}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTabs-flexContainer': { gap: 1 },
                  '& .MuiTab-root': {
                    flex: 1,
                    borderRadius: 999,
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'text.secondary',
                  },
                  '& .Mui-selected': {
                    color: 'primary.main !important',
                    backgroundColor: 'rgba(99,102,241,0.12)',
                  },
                  '& .MuiTabs-indicator': { display: 'none' },
                }}
              >
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {tab === 1 && (
                  <>
                    <TextField
                      required
                      fullWidth
                      label="First Name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Last Name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <FormControl fullWidth>
                      <InputLabel id="role-select-label">Register as</InputLabel>
                      <Select
                        labelId="role-select-label"
                        value={selectedRole}
                        label="Register as"
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="INSTRUCTOR">Faculty</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 1, py: 1.4 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    tab === 0 ? 'Sign In' : 'Register'
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={error.includes('successful') ? 'success' : 'error'} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;
