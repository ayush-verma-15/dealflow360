import React from 'react';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Add, Inventory2, People, Settings } from '@mui/icons-material';
import PageFrame from '../components/common/PageFrame';

const AdminPage = () => <PageFrame eyebrow="Control center" title="Admin workspace" description="Keep the commercial engine clean, current, and ready for the team." actions={<Button startIcon={<Add />} variant="contained">Add user</Button>}>
	<Grid container spacing={2.5} className="responsive-grid"><Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><People /><Typography className="panel-kicker">Team members</Typography><Typography variant="h3">24</Typography><Typography color="text.secondary">3 awaiting access</Typography></Paper></Grid><Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><Inventory2 /><Typography className="panel-kicker">Products</Typography><Typography variant="h3">148</Typography><Typography color="text.secondary">12 need review</Typography></Paper></Grid><Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><Settings /><Typography className="panel-kicker">System health</Typography><Typography variant="h3">99.8%</Typography><Typography color="text.secondary">Last 30 days</Typography></Paper></Grid></Grid>
	<Paper className="surface-panel section-panel" elevation={0}><Typography variant="h6">Workspace tools</Typography><Stack className="tool-grid" direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}>{['Product management', 'Warehouse management', 'Discount tiers', 'User management', 'System settings'].map((tool) => <Button key={tool} variant="outlined">{tool}</Button>)}</Stack></Paper>
</PageFrame>;

export default AdminPage;
