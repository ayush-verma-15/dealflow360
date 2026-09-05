// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
  Chip
  ,Avatar
  ,Grid
} from '@mui/material';
import { Email, Lock, RocketLaunch, Shield, Store, TrendingUp, Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const demoAccounts = [
    { role: 'Sales rep', email: 'ayush@dealflow.com', password: 'Test@123', icon: 'A' },
    { role: 'Manager', email: 'manager@dealflow.com', password: 'Test@123', icon: 'M' },
    { role: 'Admin', email: 'admin@dealflow.com', password: 'Test@123', icon: '!' },
  ];
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Login failed');
  };
  
  const chooseDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <Box className="login-page login-page-split">
      <Box className="login-shapes" aria-hidden="true">
        <span className="login-shape login-circle login-circle-one" />
        <span className="login-shape login-circle login-circle-two" />
        <span className="login-shape login-cloud login-cloud-one" />
        <span className="login-shape login-cloud login-cloud-two" />
      </Box>
      <Container maxWidth="lg" className="login-inner">
        <Grid container spacing={{ xs: 2, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6} className="login-intro-column">
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Box className="login-intro">
                <Box className="login-logo-row">
                  <Avatar className="login-logo"><Store /></Avatar>
                  <Typography className="login-wordmark">DealFlow360</Typography>
                </Box>
                <Typography className="login-headline">Move every deal forward.</Typography>
                <Typography className="login-lede">One calm workspace for quoting, approvals, fulfillment, and revenue visibility.</Typography>
                <Box className="login-feature-list">
                  {[
                    [<RocketLaunch />, 'Smart approval workflows'],
                    [<TrendingUp />, 'Live upsell intelligence'],
                    [<Shield />, 'Confident fulfillment control'],
                  ].map(([icon, text]) => <Box className="login-feature" key={text}>{icon}<Typography>{text}</Typography></Box>)}
                </Box>
              </Box>
            </motion.div>
          </Grid>
  
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
              <Paper className="login-panel login-glass" elevation={0}>
                <Box className="login-brand" mb={3}>
                  <Typography variant="h4">Welcome back</Typography>
                  <Typography color="text.secondary">Sign in to your operations workspace.</Typography>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} className="form-stack">
                  <TextField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
                  <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                  <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>{loading ? 'Signing in...' : 'Enter workspace'}</Button>
                </Box>
                <Box className="demo-access">
                  <Typography className="panel-kicker">Quick demo access</Typography>
                  <Box className="demo-chips">{demoAccounts.map((account) => <Chip key={account.email} avatar={<Avatar>{account.icon}</Avatar>} label={account.role} onClick={() => chooseDemo(account)} clickable />)}</Box>
                </Box>
                <Typography className="form-note">New to DealFlow360? <Link to="/register">Create an account</Link></Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;