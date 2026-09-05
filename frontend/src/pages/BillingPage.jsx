import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { CheckCircle, CreditCard, ReceiptLong } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import PageFrame from '../components/common/PageFrame';

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try { const response = await axios.get('/api/billing/invoices'); setInvoices(response.data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInvoices(); }, []);

  const pay = async (invoiceId) => {
    try { await axios.post(`/api/billing/payment/${invoiceId}`, { method }); toast.success('Payment recorded successfully'); await loadInvoices(); }
    catch (error) { toast.error(error.response?.data?.message || 'Payment failed'); }
  };

  return <PageFrame eyebrow="Revenue operations" title="Billing" description="Keep one-time invoices and recurring revenue visible in one place.">
    <Grid container spacing={2.5} className="responsive-grid"><Grid item xs={12} md={8}><Paper className="surface-panel" elevation={0}><Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><div><Typography className="panel-kicker">Invoice register</Typography><Typography variant="h5">{invoices.length} invoices</Typography></div><ReceiptLong color="primary" /></Stack>{loading ? <Typography sx={{ mt: 3 }}>Loading invoices...</Typography> : invoices.length === 0 ? <Box className="empty-dashboard"><ReceiptLong color="disabled" /><Typography variant="h6">No invoices yet</Typography><Typography color="text.secondary">Approved quotations will appear here.</Typography></Box> : <Stack spacing={1.5} sx={{ mt: 3 }}>{invoices.map((invoice) => <Box className="invoice-row" key={invoice._id}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Typography fontWeight={700}>{invoice.invoiceNumber}</Typography><Typography variant="caption" color="text.secondary">{invoice.customer?.name || 'Customer'} · {new Date(invoice.createdAt).toLocaleDateString()}</Typography></Box><Stack direction="row" alignItems="center" gap={1}><Typography fontWeight={700}>₹{Number(invoice.totalAmount || 0).toLocaleString()}</Typography><Chip label={invoice.status} size="small" color={invoice.status === 'paid' ? 'success' : 'warning'} /></Stack></Stack>{invoice.status !== 'paid' && <Button size="small" startIcon={<CreditCard />} onClick={() => pay(invoice._id)} sx={{ mt: 1 }}>Record payment</Button>}</Box>)}</Stack>}</Paper></Grid><Grid item xs={12} md={4}><Paper className="surface-panel accent-panel" elevation={0}><Typography className="panel-kicker">Payment method</Typography><Typography variant="h6">Simulated checkout</Typography><Typography sx={{ opacity: .75, mt: 1 }}>Choose a method for the demo payment flow.</Typography><Select fullWidth value={method} onChange={(event) => setMethod(event.target.value)} sx={{ mt: 3, background: 'white', borderRadius: 1 }}><MenuItem value="upi">UPI</MenuItem><MenuItem value="bank_transfer">Bank transfer</MenuItem><MenuItem value="credit_card">Credit card</MenuItem></Select><Stack direction="row" spacing={1} sx={{ mt: 3 }}><CheckCircle sx={{ color: 'var(--lime)' }} /><Typography variant="body2">Payment status updates the quotation.</Typography></Stack></Paper></Grid></Grid>
  </PageFrame>;
};

export default BillingPage;
