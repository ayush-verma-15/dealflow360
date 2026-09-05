import React from 'react';
import { Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';

const DealHealthCard = ({ score = 82, label = 'Healthy', subtitle = 'Pipeline momentum is on track' }) => (
	<Paper className="surface-panel deal-health-card" elevation={0}>
		<Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
			<div><Typography className="panel-kicker">Deal health</Typography><Typography variant="h6">{subtitle}</Typography></div>
			<Chip label={label} color={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'} size="small" />
		</Stack>
		<Typography variant="h3" sx={{ mt: 2 }}>{score}<Typography component="span" variant="h6" color="text.secondary">/100</Typography></Typography>
		<LinearProgress variant="determinate" value={score} sx={{ mt: 2, height: 8, borderRadius: 5 }} />
	</Paper>
);

export default DealHealthCard;
