import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
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
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 2,
            backdropFilter: 'blur(20px)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Online Examination Portal
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 4 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
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
              margin="normal"
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
                  margin="normal"
                  required
                  fullWidth
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
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
              sx={{ mt: 3, mb: 2, py: 1.5 }}
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
