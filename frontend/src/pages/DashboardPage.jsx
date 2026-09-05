// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart,
  Warning,
  CheckCircle,
  Schedule,
  Refresh,
  People
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingApprovals: 0,
    activeDeals: 0,
    revenue: 0,
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

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Here's what's happening with your deals today
            </Typography>
          </Box>
          <IconButton onClick={fetchDashboardData} color="primary">
            <Refresh />
          </IconButton>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Deals"
              value={stats.activeDeals}
              icon={<ShoppingCart />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<Schedule />}
              color="#ed6c02"
              subtitle={`${stats.pendingApprovals} need review`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₹${(stats.revenue / 100000).toFixed(1)}L`}
              icon={<AttachMoney />}
              color="#2e7d32"
              subtitle="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Quotations"
              value={stats.totalQuotes}
              icon={<TrendingUp />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

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
      </Box>
    </Box>
  );
};

export default DashboardPage;