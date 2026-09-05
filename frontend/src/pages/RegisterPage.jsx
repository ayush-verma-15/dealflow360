import React, { useState } from 'react';
import { Alert, Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: 'sales_rep', tier: 'Bronze' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		const result = await register(form);
		setLoading(false);
		if (result.success) navigate('/login');
		else setError(result.error || 'Unable to create account');
	};

	return (
		<Container component="main" maxWidth={false} className="login-page" disableGutters>
			<Paper className="login-panel" elevation={0}>
				<Box className="login-brand" mb={3}>
					<Typography variant="h4">Create your workspace</Typography>
					<Typography color="text.secondary">Start managing deals with clarity.</Typography>
				</Box>
				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
				<Box component="form" onSubmit={submit} className="form-stack">
					<TextField label="Full name" value={form.name} onChange={update('name')} required fullWidth />
					<TextField label="Work email" type="email" value={form.email} onChange={update('email')} required fullWidth />
										<FormControl fullWidth required><InputLabel>Account role</InputLabel><Select value={form.role} label="Account role" onChange={update('role')}><MenuItem value="admin">Admin</MenuItem><MenuItem value="sales_rep">Sales Rep</MenuItem><MenuItem value="sales_manager">Sales Manager</MenuItem><MenuItem value="finance">Finance / Operations</MenuItem><MenuItem value="customer">Customer</MenuItem></Select></FormControl>
										<TextField label="Company" value={form.company} onChange={update('company')} fullWidth />
										{form.role === 'customer' && <FormControl fullWidth><InputLabel>Customer tier</InputLabel><Select value={form.tier} label="Customer tier" onChange={update('tier')}><MenuItem value="Bronze">Bronze</MenuItem><MenuItem value="Silver">Silver</MenuItem><MenuItem value="Gold">Gold</MenuItem></Select></FormControl>}
					<TextField label="Password" type="password" value={form.password} onChange={update('password')} required fullWidth inputProps={{ minLength: 6 }} />
					<Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
					<Typography className="form-note">Already have an account? <Link to="/login">Sign in</Link></Typography>
				</Box>
			</Paper>
		</Container>
	);
};

export default RegisterPage;
