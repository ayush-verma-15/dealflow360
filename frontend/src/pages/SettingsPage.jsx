import React from 'react';
import { Button, Divider, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import PageFrame from '../components/common/PageFrame';

const SettingsPage = () => <PageFrame eyebrow="Workspace preferences" title="Settings" description="Tune notifications and your workspace identity.">
	<Paper className="surface-panel settings-panel" elevation={0}><Typography variant="h6">Profile details</Typography><Typography color="text.secondary" sx={{ mt: .5, mb: 3 }}>These details appear across customer-facing documents.</Typography><Stack className="settings-fields" direction={{ xs: 'column', sm: 'row' }} gap={2}><TextField label="Workspace name" defaultValue="DealFlow Corp" fullWidth /><TextField label="Default currency" defaultValue="INR · ₹" fullWidth /></Stack><Divider sx={{ my: 3 }} /><Typography variant="h6">Notifications</Typography><Stack sx={{ mt: 1 }}>{['Approval requests', 'Inventory warnings', 'Weekly performance digest'].map((label, index) => <FormControlLabel key={label} control={<Switch defaultChecked={index !== 2} />} label={label} />)}</Stack><Button variant="contained" sx={{ mt: 3 }}>Save changes</Button></Paper>
</PageFrame>;

export default SettingsPage;
