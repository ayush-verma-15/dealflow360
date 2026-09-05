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
  ,Drawer
  ,List
  ,ListItemButton
  ,ListItemIcon
  ,ListItemText
  ,Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Person,
  Settings,
  Logout,
  Dashboard,
  ShoppingCart,
  Store
  ,Info
  ,Groups
  ,AutoGraph
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const goTo = (path) => {
    setDrawerOpen(false);
    navigate(path);
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
    <AppBar className="app-navbar" position="sticky" color="default" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => { setDrawerOpen(true); onMenuClick?.(); }}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box component={Link} to="/dashboard" display="flex" alignItems="center" flex={1} sx={{ textDecoration: 'none' }} aria-label="DealFlow360 dashboard">
          <Store sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary" fontWeight="bold">DealFlow360</Typography>
          <Chip
            label="v1.0"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>

        {/* Navigation Links */}
        <Box className="nav-links" display={{ xs: 'none', md: 'flex' }} gap={1} mr={2}>
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
          <Button component={Link} to="/reports" size="small">Reports</Button>
          <Button component={Link} to="/billing" size="small">Billing</Button>
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
          <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
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
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: 300, sm: 340 }, p: 2 }} role="presentation">
          <Box sx={{ px: 1, pb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight={800}>DealFlow360</Typography>
            <Typography variant="body2" color="text.secondary">Sales operations workspace</Typography>
          </Box>
          <Divider />
          <List>
            <ListItemButton onClick={() => goTo('/dashboard')}><ListItemIcon><Dashboard color="primary" /></ListItemIcon><ListItemText primary="Home / Dashboard" secondary="Your daily command center" /></ListItemButton>
            <ListItemButton onClick={() => goTo('/quotations')}><ListItemIcon><ShoppingCart color="primary" /></ListItemIcon><ListItemText primary="Quotations" secondary="Create and manage deals" /></ListItemButton>
            <ListItemButton onClick={() => goTo('/reports')}><ListItemIcon><AutoGraph color="primary" /></ListItemIcon><ListItemText primary="Reports" secondary="Revenue and pipeline insights" /></ListItemButton>
            <ListItemButton onClick={() => goTo('/profile')}><ListItemIcon><Person color="primary" /></ListItemIcon><ListItemText primary="My Profile" secondary="Account details and role" /></ListItemButton>
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={() => goTo('/about')}><ListItemIcon><Info color="primary" /></ListItemIcon><ListItemText primary="About DealFlow360" secondary="What this workspace does" /></ListItemButton>
            <ListItemButton onClick={() => goTo('/roles')}><ListItemIcon><Groups color="primary" /></ListItemIcon><ListItemText primary="Roles & Access" secondary="Who can do what" /></ListItemButton>
            <ListItemButton onClick={() => goTo('/features')}><ListItemIcon><AutoGraph color="primary" /></ListItemIcon><ListItemText primary="Platform Features" secondary="Quoting, risk, billing and fulfillment" /></ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;