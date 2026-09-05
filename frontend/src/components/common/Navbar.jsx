// VAIBHAV - Navbar Component
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  Badge,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Person,
  Settings,
  Logout,
  Dashboard,
  ShoppingCart,
  Assessment,
  Store
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#9c27b0';
      case 'sales_manager': return '#ed6c02';
      case 'finance': return '#2e7d32';
      case 'sales_rep': return '#1976d2';
      default: return '#757575';
    }
  };

  const notifications = [
    { id: 1, message: 'Quotation Q-1234 approved', time: '5 min ago' },
    { id: 2, message: 'New negotiation request from Acme Corp', time: '1 hour ago' },
    { id: 3, message: 'Warehouse stock low: Laptops', time: '3 hours ago' },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box display="flex" alignItems="center" flex={1}>
          <Store sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary" fontWeight="bold">
            DealFlow360
          </Typography>
          <Chip
            label="v1.0"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>

        {/* Navigation Links */}
        <Box display={{ xs: 'none', md: 'flex' }} gap={1} mr={2}>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<Dashboard />}
            size="small"
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/quotations"
            startIcon={<ShoppingCart />}
            size="small"
          >
            Quotations
          </Button>
          {user?.role === 'admin' && (
            <Button
              component={Link}
              to="/admin"
              startIcon={<Settings />}
              size="small"
            >
              Admin
            </Button>
          )}
        </Box>

        {/* Notifications */}
        <IconButton color="inherit" onClick={handleNotifications}>
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2" fontWeight="bold">
              Notifications
            </Typography>
          </MenuItem>
          {notifications.map((notif) => (
            <MenuItem key={notif.id} onClick={handleNotificationClose}>
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {notif.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="caption" color="primary">
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <IconButton onClick={handleMenu}>
          <Avatar
            sx={{
              bgcolor: getRoleColor(user?.role),
              width: 32,
              height: 32,
              fontSize: 14
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email} • {user?.role}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Person sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Dashboard sx={{ mr: 1 }} /> Dashboard
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Settings sx={{ mr: 1 }} /> Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1, color: 'error.main' }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
