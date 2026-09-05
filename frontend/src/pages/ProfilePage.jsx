import React, { useState } from 'react';
import { Alert, Avatar, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageFrame from '../components/common/PageFrame';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '' });
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update profile');
    }
  };

  return <PageFrame eyebrow="Account" title="Profile" description="View and update your DealFlow360 account details.">
    <Paper className="surface-panel" elevation={0} sx={{ maxWidth: 720 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}><Avatar sx={{ width: 56, height: 56 }}>{user?.name?.charAt(0) || 'U'}</Avatar><div><Typography variant="h6">{user?.name}</Typography><Typography color="text.secondary">{user?.role?.replace('_', ' ')}</Typography></div></Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack component="form" onSubmit={save} spacing={2}>
        <TextField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <TextField label="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <TextField label="Email" value={user?.email || ''} InputProps={{ readOnly: true }} />
        <TextField label="Role" value={user?.role?.replace('_', ' ') || ''} InputProps={{ readOnly: true }} />
        <TextField label="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
        <Button type="submit" variant="contained" startIcon={<Save />} sx={{ alignSelf: 'flex-start' }}>Save changes</Button>
      </Stack>
    </Paper>
  </PageFrame>;
};

export default ProfilePage;
