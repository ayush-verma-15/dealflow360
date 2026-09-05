import React, { useEffect, useState } from 'react';
import { Alert, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Inventory2, People, Settings, Warehouse } from '@mui/icons-material';
import axios from 'axios';
import PageFrame from '../components/common/PageFrame';

const AdminPage = () => {
	const [counts, setCounts] = useState({ users: 0, products: 0, warehouses: 0 });
	const [error, setError] = useState('');

	useEffect(() => {
		Promise.all([axios.get('/api/auth/users'), axios.get('/api/products'), axios.get('/api/warehouses')])
			.then(([users, products, warehouses]) => setCounts({
				users: users.data.count || 0,
				products: products.data.count || 0,
				warehouses: warehouses.data.count || 0
			}))
			.catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load admin configuration'));
	}, []);

	return <PageFrame eyebrow="Control center" title="Admin workspace" description="Manage the records that drive pricing, fulfillment, and access.">
		{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
		<Grid container spacing={2.5} className="responsive-grid">
			<Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><People /><Typography className="panel-kicker">Team members</Typography><Typography variant="h3">{counts.users}</Typography><Typography color="text.secondary">Managed access records</Typography></Paper></Grid>
			<Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><Inventory2 /><Typography className="panel-kicker">Products</Typography><Typography variant="h3">{counts.products}</Typography><Typography color="text.secondary">Catalog records</Typography></Paper></Grid>
			<Grid item xs={12} md={4}><Paper className="metric-panel" elevation={0}><Warehouse /><Typography className="panel-kicker">Warehouses</Typography><Typography variant="h3">{counts.warehouses}</Typography><Typography color="text.secondary">Fulfillment locations</Typography></Paper></Grid>
		</Grid>
		<Paper className="surface-panel section-panel" elevation={0}><Typography variant="h6">Configuration APIs</Typography><Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}><Button variant="outlined" href="/api/products">Products</Button><Button variant="outlined" href="/api/warehouses">Warehouses</Button><Button variant="outlined" href="/api/auth/users">Users</Button><Button variant="outlined" href="/api/auth/customers">Customers</Button><Button variant="outlined" disabled startIcon={<Settings />}>Discount rules</Button></Stack></Paper>
	</PageFrame>;
};

export default AdminPage;
