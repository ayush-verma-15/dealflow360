import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Download, TrendingUp } from '@mui/icons-material';
import PageFrame from '../components/common/PageFrame';
import { exportReport } from '../services/reportService';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [exporting, setExporting] = useState(false);
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  const download = async (format) => {
    try {
      setExporting(true);
      const response = await exportReport({}, format);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dealflow360-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to export report');
    } finally {
      setExporting(false);
    }
  };

  return <PageFrame eyebrow="Decision support" title="Reports" description="A quick read on pipeline movement, revenue, and commercial health." actions={<Button startIcon={<Download />} variant="contained" onClick={() => download('pdf')} disabled={exporting}>Export PDF</Button>}>
    <Grid container spacing={2.5} className="responsive-grid">
      {view && <Grid item xs={12}><Paper className="surface-panel" elevation={0}><Typography className="panel-kicker">Selected dashboard view</Typography><Typography variant="h5">{view === 'conversion' ? 'Conversion rate report' : 'Total revenue report'}</Typography><Typography color="text.secondary">This report is opened from the dashboard KPI you selected.</Typography></Paper></Grid>}
      <Grid item xs={12} md={8}><Paper className="surface-panel chart-panel" elevation={0}><Stack direction="row" justifyContent="space-between"><div><Typography className="panel-kicker">Revenue trend</Typography><Typography variant="h5">Sales performance</Typography></div><TrendingUp color="success" /></Stack><div className="chart-bars">{[42, 58, 48, 72, 66, 88, 78, 96].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div></Paper></Grid>
      <Grid item xs={12} md={4}><Paper className="surface-panel" elevation={0}><Typography className="panel-kicker">Exports</Typography><Typography variant="h6">Download report data</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Use CSV for spreadsheets or PDF for sharing.</Typography><Stack direction="row" spacing={1} sx={{ mt: 3 }}><Button startIcon={<Download />} variant="outlined" onClick={() => download('csv')} disabled={exporting}>CSV</Button><Button startIcon={<Download />} variant="contained" onClick={() => download('pdf')} disabled={exporting}>PDF</Button></Stack></Paper></Grid>
    </Grid>
    <Paper className="surface-panel section-panel" elevation={0}><Typography variant="h6">Report library</Typography><Stack spacing={1} sx={{ mt: 2 }}>{['Pipeline velocity', 'Discount risk review', 'Warehouse fulfillment', 'Subscription revenue'].map((item) => <Stack key={item} className="report-row" direction="row" justifyContent="space-between" alignItems="center"><Typography>{item}</Typography><Button size="small" startIcon={<Download />} onClick={() => download('csv')} disabled={exporting}>CSV</Button></Stack>)}</Stack></Paper>
  </PageFrame>;
};

export default ReportsPage;
