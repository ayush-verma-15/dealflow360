import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Store } from '@mui/icons-material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  const demoAccounts = [
    { role: 'Sales Rep', email: 'ayush@dealflow.com', password: 'Test@123', color: '#1976d2' },
    { role: 'Sales Manager', email: 'manager@dealflow.com', password: 'Test@123', color: '#ed6c02' },
    { role: 'Finance', email: 'finance@dealflow.com', password: 'Test@123', color: '#2e7d32' },
    { role: 'Admin', email: 'admin@dealflow.com', password: 'Test@123', color: '#9c27b0' },
    { role: 'Customer', email: 'acme@dealflow.com', password: 'Test@123', color: '#0d9488' },
  ];

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 3,
            background: 'white'
          }}
        >
          {/* Logo */}
          <Box textAlign="center" mb={3}>
            <Store sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              DealFlow360
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Intelligent Sales Operations Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Chip label="Demo Accounts" size="small" />
            </Divider>

            <Box>
              <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                Click on any demo account to login instantly:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {demoAccounts.map((demo, idx) => (
                  <Chip
                    key={idx}
                    label={demo.role}
                    size="small"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword(demo.password);
                    }}
                    sx={{
                      bgcolor: demo.color + '20',
                      color: demo.color,
                      border: `1px solid ${demo.color}40`,
                      '&:hover': {
                        bgcolor: demo.color + '40',
                      },
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </form>

          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              DealFlow360 v1.0 • Odoo Hackathon 2026
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
