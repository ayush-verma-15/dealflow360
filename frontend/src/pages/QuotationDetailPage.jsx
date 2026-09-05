import React, { useEffect, useState } from 'react';
import { Button, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack, CheckCircleOutline, Download, Edit } from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PageFrame from '../components/common/PageFrame';

const QuotationDetailPage = () => {
	const { id } = useParams();
	const [quotation, setQuotation] = useState(null);
	useEffect(() => { axios.get(`/api/quotes/${id}`).then((response) => setQuotation(response.data.data)).catch(() => toast.error('Unable to load quotation')); }, [id]);
	if (!quotation) return <PageFrame eyebrow="Quotation detail" title="Loading quotation..." />;
	return (
		<PageFrame eyebrow="Quotation detail" title={quotation.quoteNumber} description="Commercial snapshot and approval trail."
			actions={<Button component={RouterLink} to="/quotations" startIcon={<ArrowBack />} variant="outlined">All quotations</Button>}>
			<Grid container spacing={2.5} className="responsive-grid">
				<Grid item xs={12} md={8}>
					<Paper className="surface-panel" elevation={0}>
						<Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
							<div><Typography className="panel-kicker">{quotation.customer?.name}</Typography><Typography variant="h5">Quotation details</Typography></div>
							<Chip label={quotation.status} color={quotation.status === 'confirmed' ? 'success' : 'warning'} variant="outlined" />
						</Stack>
						<Divider sx={{ my: 3 }} />
						{quotation.lines.map((line) => (
							<Stack key={line._id || line.productName} direction="row" justifyContent="space-between" className="line-item">
								<Typography>{line.productName} × {line.quantity}</Typography><Typography fontWeight={700}>₹{Number(line.total || line.unitPrice * line.quantity).toLocaleString()}</Typography>
							</Stack>
						))}
						<Divider sx={{ my: 2 }} />
						<Stack direction="row" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h6" color="primary">₹{Number(quotation.totalAmount || 0).toLocaleString()}</Typography></Stack>
					</Paper>
				</Grid>
				<Grid item xs={12} md={4}>
					<Paper className="surface-panel accent-panel" elevation={0}>
						<Typography className="panel-kicker">Approval trail</Typography>
						<Stack spacing={2.5} sx={{ mt: 2 }}>
							{quotation.approvalChain?.map((step) => <Stack direction="row" spacing={1.5} key={`${step.role}-${step._id}`}><CheckCircleOutline color={step.status === 'approved' ? 'success' : 'disabled'} /><Typography>{step.role}: {step.status}</Typography></Stack>)}
						</Stack>
						<Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 4 }}><Button startIcon={<Edit />} variant="contained">Edit quote</Button><Button startIcon={<Download />} variant="text">Export</Button></Stack>
					</Paper>
				</Grid>
			</Grid>
		</PageFrame>
	);
};

export default QuotationDetailPage;
