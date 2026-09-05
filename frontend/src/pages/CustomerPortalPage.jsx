import React, { useEffect, useState } from 'react';
import { Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { ChatBubble, CheckCircle, Download, ThumbUp } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PageFrame from '../components/common/PageFrame';

const CustomerPortalPage = () => {
	const { quoteId } = useParams();
	const [quotation, setQuotation] = useState(null);
	const [message, setMessage] = useState('');
	const [discount, setDiscount] = useState('');
	const [loading, setLoading] = useState(true);

	const loadQuotation = async () => {
		try { const response = await axios.get(`/api/quotes/${quoteId}`); setQuotation(response.data.data); }
		catch (error) { toast.error(error.response?.data?.message || 'Unable to load quotation'); }
		finally { setLoading(false); }
	};

	useEffect(() => { loadQuotation(); }, [quoteId]);

	const requestChanges = async () => {
		try { await axios.post(`/api/quotes/${quoteId}/negotiate`, { message, requestedDiscount: discount ? Number(discount) : undefined }); toast.success('Request sent to the sales team'); setMessage(''); await loadQuotation(); }
		catch (error) { toast.error(error.response?.data?.message || 'Unable to send request'); }
	};

	const confirm = async () => {
		try { const response = await axios.post(`/api/quotes/${quoteId}/confirm`); toast.success(response.data.message); await loadQuotation(); }
		catch (error) { toast.error(error.response?.data?.message || 'Unable to confirm quotation'); }
	};

	if (loading) return <PageFrame eyebrow="Customer portal" title="Loading proposal..." />;
	if (!quotation) return <PageFrame eyebrow="Customer portal" title="Proposal unavailable" description="This quotation could not be loaded." />;

	return <PageFrame eyebrow="Customer portal" title={`Proposal ${quotation.quoteNumber}`} description="Review the current terms, request a change, or confirm the quotation.">
		<Grid container spacing={2.5} className="responsive-grid">
			<Grid item xs={12} md={8}><Paper className="surface-panel" elevation={0}><Stack direction="row" justifyContent="space-between" gap={2}><div><Typography className="panel-kicker">{quotation.customer?.name || 'Customer'}</Typography><Typography variant="h5">Quotation details</Typography></div><Chip label={quotation.status} color={quotation.status === 'confirmed' ? 'success' : 'warning'} variant="outlined" /></Stack><Stack spacing={1} sx={{ mt: 3 }}>{quotation.lines.map((line) => <Stack className="line-item" direction="row" justifyContent="space-between" key={line._id || line.productName}><Typography>{line.productName} × {line.quantity}</Typography><Typography fontWeight={700}>₹{Number(line.total || line.unitPrice * line.quantity).toLocaleString()}</Typography></Stack>)}</Stack><div className="portal-total"><Typography variant="body2">Proposal total</Typography><Typography variant="h3">₹{Number(quotation.totalAmount || 0).toLocaleString()}</Typography></div><Button startIcon={<ThumbUp />} variant="contained" onClick={confirm} disabled={quotation.status === 'confirmed'}>Confirm quotation</Button></Paper></Grid>
			<Grid item xs={12} md={4}><Paper className="surface-panel" elevation={0}><Typography className="panel-kicker">Negotiation</Typography><Typography variant="h6">Need a change?</Typography><TextField label="Requested discount %" type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} fullWidth sx={{ mt: 2 }} inputProps={{ min: 0, max: 100 }} /><TextField label="Message to sales team" value={message} onChange={(event) => setMessage(event.target.value)} fullWidth multiline minRows={4} sx={{ mt: 2 }} /><Button startIcon={<ChatBubble />} fullWidth variant="outlined" sx={{ mt: 2 }} onClick={requestChanges} disabled={!message && !discount}>Submit request</Button><Button startIcon={<Download />} fullWidth sx={{ mt: 1 }} variant="text">Download PDF</Button><Stack spacing={1.5} sx={{ mt: 3 }}>{['Created', 'Sent', quotation.negotiation?.status === 'pending' ? 'Negotiation' : 'Awaiting response', 'Confirmed'].map((step, index) => <Stack direction="row" spacing={1} key={step}><CheckCircle color={index < 2 || quotation.status === 'confirmed' ? 'success' : 'disabled'} fontSize="small" /><Typography variant="body2">{step}</Typography></Stack>)}</Stack></Paper></Grid>
		</Grid>
	</PageFrame>;
};

export default CustomerPortalPage;
