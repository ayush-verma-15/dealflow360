import React from 'react';
import { Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageFrame from '../components/common/PageFrame';

const NotFoundPage = () => (
	<PageFrame eyebrow="Navigation" title="Page not found" description="That workspace view does not exist or has moved.">
		<Paper className="empty-state" elevation={0}>
			<Typography className="empty-code">404</Typography>
			<Typography variant="h5">Nothing here yet</Typography>
			<Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mt: 3 }}>Back to dashboard</Button>
		</Paper>
	</PageFrame>
);

export default NotFoundPage;
