import React, { useEffect, useState } from 'react';
import { Button, Chip, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PageFrame from '../components/common/PageFrame';

const CustomerPortalHome = () => {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    axios.get('/api/quotes').then((response) => setQuotations(response.data.data || []))
      .catch((error) => toast.error(error.response?.data?.message || 'Unable to load your quotations'));
  }, []);

  return <PageFrame eyebrow="Customer portal" title="Your quotations" description="Review proposals, request changes, and confirm approved terms.">
    <Paper className="surface-panel" elevation={0}>
      {quotations.length === 0 ? <Typography color="text.secondary">No quotations are available yet.</Typography> : <List disablePadding>{quotations.map((quotation) => <ListItem key={quotation._id} divider secondaryAction={<Button component={RouterLink} to={`/portal/${quotation._id}`} variant="outlined" size="small">Review</Button>}><ListItemText primary={quotation.quoteNumber} secondary={`₹${Number(quotation.totalAmount || 0).toLocaleString()}`} /><Chip label={quotation.status} size="small" variant="outlined" /></ListItem>)}</List>}
    </Paper>
  </PageFrame>;
};

export default CustomerPortalHome;
