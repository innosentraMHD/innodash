// src/components/EmailSettings.js
import React, { useState, useEffect } from 'react';
// 1. استيراد axiosInstance بدلاً من axios العادي
import axiosInstance, { API } from '../api'; 
import { 
  Box, Button, Typography, Paper, TextField, Grid, 
  Stack, Divider, Alert 
} from '@mui/material';
import { Save, Delete, Send, Email } from '@mui/icons-material';

const API_BASE_URL = API.EMAIL_CONFIG;

function EmailSettings() {
  const [currentEmail, setCurrentEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [testSubject, setTestSubject] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [sendResult, setSendResult] = useState('');

  useEffect(() => { fetchCurrentEmail(); }, []);

  const clearMessages = () => { setMessage(''); setError(''); setSendResult(''); };

  const fetchCurrentEmail = async () => {
    clearMessages(); setLoading(true);
    try {
      // استخدام axiosInstance
      const response = await axiosInstance.get(`${API_BASE_URL}/email-config/`);
      const email = response.data.email || '';
      setCurrentEmail(email); setEmailInput(email);
    } catch (err) { 
        console.error(err);
        // التعامل مع انتهاء الجلسة إذا حدث
        if (err.response?.status === 401) setError('Unauthorized. Please login.');
        else setError('Failed to fetch email settings.'); 
    }
    setLoading(false);
  };

  const handleSetEmail = async (e) => {
    e.preventDefault(); clearMessages(); setLoading(true);
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/email-config/`, { email: emailInput });
      setCurrentEmail(response.data.email); setMessage('Email updated successfully!');
    } catch (err) { setError('Failed to update email.'); }
    setLoading(false);
  };

  const handleDeleteEmail = async () => {
    if (!window.confirm('Are you sure?')) return;
    clearMessages(); setLoading(true);
    try {
      await axiosInstance.delete(`${API_BASE_URL}/email-config/`);
      setCurrentEmail(''); setEmailInput(''); setMessage('Email deleted successfully.');
    } catch (err) { setError('Failed to delete email.'); }
    setLoading(false);
  };

  const handleSendTest = async (e) => {
    e.preventDefault(); clearMessages();
    if (!currentEmail) { setError('No email set.'); return; }
    setLoadingSend(true);
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/email-config/send/`, { subject: testSubject, message: testMessage });
      setSendResult(response.data.success || 'Test email sent!');
    } catch (err) { setSendResult(err.response?.data?.error || 'Failed to send.'); }
    setLoadingSend(false);
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email /> Email Settings
        </Typography>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Notification Configuration</Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Current Email: <strong>{currentEmail || '(Not Set)'}</strong>
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box component="form" onSubmit={handleSetEmail}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth label="Email Address" value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} type="email" disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading || emailInput === currentEmail}>
                Save
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteEmail} disabled={loading || !currentEmail}>
                Delete
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Send Test Email</Typography>
        <Box component="form" onSubmit={handleSendTest} sx={{ mt: 2 }}>
           <Stack spacing={2}>
             <TextField fullWidth label="Subject" value={testSubject} onChange={(e) => setTestSubject(e.target.value)} disabled={!currentEmail} />
             <TextField fullWidth label="Message" multiline rows={3} value={testMessage} onChange={(e) => setTestMessage(e.target.value)} disabled={!currentEmail} />
             <Button type="submit" variant="contained" color="secondary" startIcon={<Send />} disabled={loadingSend || !currentEmail} sx={{ alignSelf: 'flex-start' }}>
               {loadingSend ? 'Sending...' : 'Send Test'}
             </Button>
           </Stack>
           {sendResult && <Alert severity={sendResult.includes('Failed') ? 'error' : 'success'} sx={{ mt: 2 }}>{sendResult}</Alert>}
        </Box>
      </Paper>
    </Box>
  );
}

export default EmailSettings;