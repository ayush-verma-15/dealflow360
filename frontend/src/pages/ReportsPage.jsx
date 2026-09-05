import React from 'react';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Download, TrendingUp } from '@mui/icons-material';
import PageFrame from '../components/common/PageFrame';

const ReportsPage = () => <PageFrame eyebrow="Decision support" title="Reports" description="A quick read on pipeline movement, revenue, and commercial health." actions={<Button startIcon={<Download />} variant="contained">Export report</Button>}>
	<Grid container spacing={2.5} className="responsive-grid"><Grid item xs={12} md={8}><Paper className="surface-panel chart-panel" elevation={0}><Stack direction="row" justifyContent="space-between"><div><Typography className="panel-kicker">Revenue trend</Typography><Typography variant="h5">₹42.8L</Typography></div><TrendingUp color="success" /></Stack><div className="chart-bars">{[42, 58, 48, 72, 66, 88, 78, 96].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><Stack direction="row" justifyContent="space-between" color="text.secondary"><Typography variant="caption">Jan</Typography><Typography variant="caption">Aug</Typography></Stack></Paper></Grid><Grid item xs={12} md={4}><Paper className="surface-panel" elevation={0}><Typography className="panel-kicker">Conversion</Typography><Typography variant="h3">34.6%</Typography><Typography color="text.secondary">+6.2% from last period</Typography><div className="progress-ring"><span>Healthy</span></div></Paper></Grid></Grid>
	<Paper className="surface-panel section-panel" elevation={0}><Typography variant="h6">Report library</Typography><Stack spacing={1} sx={{ mt: 2 }}>{['Pipeline velocity', 'Discount risk review', 'Warehouse fulfillment', 'Subscription revenue'].map((item) => <Stack key={item} className="report-row" direction="row" justifyContent="space-between" alignItems="center"><Typography>{item}</Typography><Button size="small" startIcon={<Download />}>CSV</Button></Stack>)}</Stack></Paper>
</PageFrame>;

export default ReportsPage;
