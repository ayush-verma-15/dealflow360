import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Navbar from './Navbar';

const PageFrame = ({ eyebrow, title, description, actions, children }) => (
  <Box className="app-page">
    <Navbar />
    <main className="page-content">
      <Box className="page-heading">
        <Breadcrumbs aria-label="breadcrumb" className="page-breadcrumbs">
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
            Workspace
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
        <Box className="page-heading-row">
          <Box>
            {eyebrow && <Typography className="page-eyebrow">{eyebrow}</Typography>}
            <Typography className="page-title" component="h1">{title}</Typography>
            {description && <Typography className="page-description">{description}</Typography>}
          </Box>
          {actions && <Box className="page-actions">{actions}</Box>}
        </Box>
      </Box>
      {children}
    </main>
  </Box>
);

export default PageFrame;
