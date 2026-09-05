import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import PageFrame from '../components/common/PageFrame';

const content = {
  '/about': {
    eyebrow: 'About the platform',
    title: 'One workspace for every deal',
    description: 'DealFlow360 connects quoting, approvals, fulfillment, billing, and customer collaboration in one operational flow.',
    items: ['Authoritative backend pricing and totals', 'Explainable discount risk and approval workflows', 'Connected inventory, billing, and customer negotiation']
  },
  '/roles': {
    eyebrow: 'Roles & access',
    title: 'Everyone sees the work they own',
    description: 'Role-based access keeps internal operations focused and customer data isolated.',
    items: ['Admin: configuration and user management', 'Sales: quotations, customers, and pipeline', 'Finance and Operations: billing, approvals, and fulfillment', 'Customer: own quotations and negotiation portal']
  },
  '/features': {
    eyebrow: 'Platform features',
    title: 'From first quote to completed deal',
    description: 'The platform supports the full commercial workflow.',
    items: ['Quotation builder with discounts, taxes, and PDF export', 'Risk scoring, approvals, negotiation, and audit history', 'Warehouse allocation, subscriptions, invoices, notifications, and reports']
  }
};

const WorkspaceInfoPage = () => {
  const page = content[useLocation().pathname] || content['/about'];
  return <PageFrame eyebrow={page.eyebrow} title={page.title} description={page.description}>
    <Paper className="surface-panel" elevation={0} sx={{ maxWidth: 820 }}>
      <Stack spacing={2}>{page.items.map((item) => <Typography key={item} variant="h6">{item}</Typography>)}</Stack>
    </Paper>
  </PageFrame>;
};

export default WorkspaceInfoPage;
