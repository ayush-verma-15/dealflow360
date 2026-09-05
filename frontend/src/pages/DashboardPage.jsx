// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Button,
  LinearProgress,
  Container
} from '@mui/material';
import { 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart,
  Warning,
  CheckCircle,
  Schedule,
  Refresh,
  People,
  ArrowUpward,
  ArrowDownward,
  Assessment,
  RocketLaunch
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

const revenueData = [
  { month: 'Jan', revenue: 18 },
  { month: 'Feb', revenue: 24 },
  { month: 'Mar', revenue: 21 },
  { month: 'Apr', revenue: 31 },
  { month: 'May', revenue: 36 },
  { month: 'Jun', revenue: 42 },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingApprovals: 0,
    activeDeals: 0,
    revenue: 0,
    conversionRate: 68,
    stalledDeals: [],
    anomalies: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, growth }) => (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="stat-card dashboard-stat" sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <Box>
              <Typography variant="caption" color="textSecondary" fontWeight="600">{title}</Typography>
              <Typography variant="h4" fontWeight="800" sx={{ mt: 0.5 }}>{value}</Typography>
              {subtitle && <Typography variant="caption" color="textSecondary">{subtitle}</Typography>}
              {growth && <Chip size="small" label={growth} icon={growth.startsWith('+') ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />} color={growth.startsWith('+') ? 'success' : 'warning'} sx={{ mt: 1, fontWeight: 700 }} />}
            </Box>
            <Avatar className="stat-icon" sx={{ bgcolor: color, width: 54, height: 54, borderRadius: 2 }}>{icon}</Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box className="dashboard-page" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Container maxWidth="xl" className="dashboard-content" sx={{ flex: 1 }}>
        {/* Header */}
        <Box className="dashboard-header" display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography className="page-eyebrow">Daily command center</Typography>
            <Typography className="dashboard-greeting">Welcome back, {user?.name || 'there'}.</Typography>
            <Typography className="page-description">Here is what is moving across your deal pipeline today.</Typography>
          </Box>
          <Box className="dashboard-actions">
            <Badge color={isConnected ? 'success' : 'error'} variant="dot"><Chip label={isConnected ? 'Live' : 'Offline'} size="small" /></Badge>
            <IconButton onClick={fetchDashboardData} className="refresh-button" aria-label="Refresh dashboard"><Refresh /></IconButton>
            <Button variant="contained" startIcon={<RocketLaunch />} onClick={() => { window.location.href = '/quotations'; }}>New quotation</Button>
          </Box>
        </Box>

        {loading && <LinearProgress color="primary" sx={{ mb: 2, borderRadius: 4 }} />}

        {/* Stats Grid */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Deals"
              value={stats.activeDeals}
              icon={<ShoppingCart />}
              color="var(--primary)"
              growth="+8.2%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<Schedule />}
              color="var(--warning)"
              subtitle={`${stats.pendingApprovals} need review`}
              growth="-2.1%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₹${(stats.revenue / 100000).toFixed(1)}L`}
              icon={<AttachMoney />}
              color="var(--success)"
              subtitle="This month"
              growth="+22.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Conversion rate"
              value={`${stats.conversionRate}%`}
              icon={<Assessment />}
              color="var(--secondary)"
              subtitle="Quotes to deals"
              growth="+5.3%"
            />
          </Grid>
        </Grid>

        <Paper className="revenue-panel" elevation={0}>
          <Box className="chart-heading">
            <Box><Typography className="panel-kicker">Performance overview</Typography><Typography variant="h6">Revenue movement</Typography></Box>
            <Chip label="Last 6 months" size="small" variant="outlined" />
          </Box>
          <Box className="revenue-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.35} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="#e0f2fe" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}L`} />
                <Tooltip formatter={(value) => [`₹${value}L`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #bae6fd' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0284C7" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Alerts Section */}
        <Grid container spacing={3}>
          {stats.stalledDeals?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Stalled Deals
                </Typography>
                {stats.stalledDeals.map((deal, idx) => (
                  <Box key={idx} display="flex" alignItems="center" p={1} bgcolor="#fff3e0" borderRadius={1} mb={1}>
                    <Warning sx={{ color: '#ed6c02', mr: 1 }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {deal.customerName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Inactive for {deal.inactiveDays} days
                      </Typography>
                    </Box>
                    <Chip label="Action Required" size="small" color="warning" />
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}

          {stats.anomalies?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚨 Discount Anomalies
                </Typography>
                {stats.anomalies.map((anomaly, idx) => (
                  <Box key={idx} display="flex" alignItems="center" p={1} bgcolor="#ffebee" borderRadius={1} mb={1}>
                    <TrendingDown sx={{ color: '#d32f2f', mr: 1 }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {anomaly.repName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Avg: {anomaly.avgDiscount}% | Current: {anomaly.currentDiscount}%
                      </Typography>
                    </Box>
                    <Chip label="Review" size="small" color="error" />
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                icon={<ShoppingCart />} 
                label="New Quotation" 
                color="primary"
                onClick={() => window.location.href = '/quotations'}
                sx={{ fontSize: '1rem', p: 2 }}
              />
              <Chip 
                icon={<People />} 
                label="Pending Approvals" 
                color="warning"
                sx={{ fontSize: '1rem', p: 2 }}
              />
              <Chip 
                icon={<CheckCircle />} 
                label="My Deals" 
                color="success"
                sx={{ fontSize: '1rem', p: 2 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;