import React from 'react';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

const recommendations = [
  { name: 'Priority Support', detail: '12-month coverage', price: '₹18,000' },
  { name: 'Data Migration', detail: 'One-time service', price: '₹35,000' },
];

const UpsellPanel = ({ onAdd }) => (
  <Box className="upsell-panel">
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
      <Box><Typography className="panel-kicker">Smart recommendations</Typography><Typography variant="h6">Complete the package</Typography></Box>
      <AutoAwesome color="primary" />
    </Stack>
    <Stack spacing={1} sx={{ mt: 2 }}>
      {recommendations.map((item) => <Box className="upsell-row" key={item.name}><Box flex={1}><Typography fontWeight={700}>{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.detail}</Typography></Box><Chip label={item.price} size="small" variant="outlined" /><Button aria-label={`Add ${item.name}`} size="small" onClick={() => onAdd?.(item)}><Add /></Button></Box>)}
    </Stack>
  </Box>
);

export default UpsellPanel;
