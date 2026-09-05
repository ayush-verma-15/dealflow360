import React from 'react';
import { CheckCircle, LocalShipping, Warehouse as WarehouseIcon } from '@mui/icons-material';
import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';

const shipments = [
  { name: 'Mumbai Warehouse', location: 'Maharashtra', items: 'Laptop Pro × 6', cost: '₹1,240', progress: 82 },
  { name: 'Delhi Warehouse', location: 'Delhi NCR', items: 'Laptop Pro × 4 · Server Rack × 2', cost: '₹2,100', progress: 64 },
];

const WarehouseSplit = () => (
  <Box className="warehouse-split">
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}><Box><Typography className="panel-kicker">Optimized fulfillment</Typography><Typography variant="h6">2 shipments · ₹3,340 total cost</Typography></Box><Chip color="success" icon={<CheckCircle />} label="100% fulfillable" /></Stack>
    <Stack spacing={1.5}>{shipments.map((shipment) => <Paper className="warehouse-card" elevation={0} key={shipment.name}><Stack direction="row" justifyContent="space-between" gap={2}><Stack direction="row" spacing={1.5}><WarehouseIcon color="primary" /><Box><Typography fontWeight={700}>{shipment.name}</Typography><Typography variant="caption" color="text.secondary">{shipment.location} · {shipment.items}</Typography></Box></Stack><Typography fontWeight={700}>{shipment.cost}</Typography></Stack><LinearProgress variant="determinate" value={shipment.progress} sx={{ mt: 2, height: 7, borderRadius: 5 }} /></Paper>)}</Stack>
    <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 2 }}><Button startIcon={<LocalShipping />} variant="outlined">Manual override</Button><Button variant="contained">Accept split</Button></Stack>
  </Box>
);

export default WarehouseSplit;
