// VAIBHAV - Dashboard Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon
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
  People,
  Store,
  Assessment,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import DealHealthCard from '../components/dashboard/DealHealthCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingApprovals: 0,
    activeDeals: 0,
    revenue: 0,
    approvalRate: 0,
    stalledDeals: [],
    anomalies: [],
    recentActivity: []
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

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%', position: 'relative', borderRadius: 2 }}>
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
            {trend && (
              <Chip
                size="small"
                label={trend}
                icon={trend.includes('+') ? <TrendingUp /> : <TrendingDown />}
                color={trend.includes('+') ? 'success' : 'error'}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Navbar />

      <Box sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {user?.name}! 👋
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Here's what's happening with your deals today
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={isConnected ? '🟢 Live' : '🔴 Offline'}
              size="small"
              color={isConnected ? 'success' : 'error'}
            />
            <IconButton onClick={fetchDashboardData} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Deals"
              value={stats.activeDeals}
              icon={<ShoppingCart />}
              color="#1976d2"
              subtitle="Total active quotations"
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
              title="Revenue"
              value={`₹${(stats.revenue / 100000).toFixed(1)}L`}
              icon={<AttachMoney />}
              color="#2e7d32"
              subtitle="This month"
              trend="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approval Rate"
              value={`${stats.approvalRate || 0}%`}
              icon={<CheckCircle />}
              color="#9c27b0"
              subtitle="Last 30 days"
              trend="+5.2%"
            />
          </Grid>
        </Grid>

        {/* Alerts Section */}
        <Grid container spacing={3}>
          {stats.stalledDeals?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Stalled Deals ({stats.stalledDeals.length})
                </Typography>
                {stats.stalledDeals.map((deal, idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    alignItems="center"
                    p={1.5}
                    bgcolor="#fff3e0"
                    borderRadius={1}
                    mb={1}
                  >
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
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚨 Discount Anomalies ({stats.anomalies.length})
                </Typography>
                {stats.anomalies.map((anomaly, idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    alignItems="center"
                    p={1.5}
                    bgcolor="#ffebee"
                    borderRadius={1}
                    mb={1}
                  >
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

        {/* Recent Activity */}
        <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📋 Recent Activity
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {stats.recentActivity?.length > 0 ? (
            <List>
              {stats.recentActivity.map((activity, idx) => (
                <ListItem key={idx} divider={idx < stats.recentActivity.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: activity.color || '#1976d2' }}>
                      {activity.icon || <Store />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.timestamp}
                  />
                  <Chip
                    label={activity.status}
                    size="small"
                    color={activity.statusColor || 'default'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="textSecondary">
                No recent activity
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Quick Actions */}
        <Box mt={3} display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => window.location.href = '/quotations'}
          >
            New Quotation
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => window.location.href = '/reports'}
          >
            View Reports
          </Button>
          {user?.role === 'admin' && (
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => window.location.href = '/admin'}
            >
              Admin Panel
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;