import React, { useEffect, useState } from 'react';
import { Add, AutoAwesome } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import api from '../../services/api';

const UpsellPanel = ({ productIds = [], onAdd }) => {
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    if (!productIds.length) return setRecommendations([]);
    api.post('/products/recommendations', { productIds }).then((response) => setRecommendations(response.data.data || [])).catch(() => setRecommendations([]));
  }, [productIds.join(',')]);

  return (
  <Box className="upsell-panel">
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
      <Box><Typography className="panel-kicker">Smart recommendations</Typography><Typography variant="h6">Complete the package</Typography></Box>
      <AutoAwesome color="primary" />
    </Stack>
    <Stack spacing={1} sx={{ mt: 2 }}>
      {recommendations.map((item) => <Box className="upsell-row" key={item.product._id}><Box flex={1}><Typography fontWeight={700}>{item.product.name}</Typography><Typography variant="caption" color="text.secondary">{item.reason}</Typography></Box><Chip label={`₹${Number(item.product.basePrice || 0).toLocaleString()}`} size="small" variant="outlined" /><Button aria-label={`Add ${item.product.name}`} size="small" onClick={() => onAdd?.(item.product)}><Add /></Button></Box>)}
    </Stack>
  </Box>
  );
};

export default UpsellPanel;
