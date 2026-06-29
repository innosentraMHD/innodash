import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Alert, Container, CircularProgress, useTheme 
} from '@mui/material';
import { LockOpen, PersonAdd, SettingsSystemDaydream } from '@mui/icons-material';
import axiosInstance, { API } from '../api';
import logo from '../images/logo.png'; // تأكد من المسار

// --- 1. صفحة تسجيل الدخول (Login) ---
export const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post(API.LOGIN, { username: email, password });
      // حفظ التوكن
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      
      // نفترض أن التوكن مفكوك التشفير (أو نقوم بطلب للمستخدم) لمعرفة الصلاحيات
      // هنا سنمرر التوكن للأب ليفك تشفيره أو يطلب بيانات المستخدم
      onLoginSuccess();
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={0} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <img src={logo} alt="Logo" style={{ height: 60, marginBottom: 20 }} />
        <Typography component="h1" variant="h5">Sign In</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal" required fullWidth label="Email Address"
            autoComplete="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth label="Password" type="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

// --- 2. صفحة الإعداد الأولي (Setup Wizard) ---
export const SetupPage = ({ onSetupSuccess }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API.SETUP, formData);
      alert("System Owner Created! Please Log in.");
      onSetupSuccess(); // يعيدنا لصفحة الدخول
    } catch (err) {
      setError(err.response?.data?.error || "Setup failed. System might be already initialized.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={0} sx={{ mt: 8, p: 4, borderTop: `6px solid ${theme.palette.primary.main}`, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <SettingsSystemDaydream fontSize="large" color="primary" />
          <Typography variant="h4">System Initialization</Typography>
        </Box>
        <Typography variant="body1" paragraph>
          Welcome to Innosentra. This is the first-time setup. The account created here will be the <strong>Super User (Owner)</strong>.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="First Name" required fullWidth 
            onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
          <TextField label="Last Name" required fullWidth 
            onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
          <TextField label="Email (will be your username)" type="email" required fullWidth 
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <TextField label="Master Password" type="password" required fullWidth 
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large">Initialize System</Button>
        </Box>
      </Paper>
    </Container>
  );
};

// --- 3. صفحة التسجيل عبر الدعوة (Register via Invite) ---
export const RegisterPage = ({ token }) => {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axiosInstance.post(API.REGISTER, { ...formData, token });
      setStatus('success');
      setMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => { window.location.href = '/'; }, 3000);
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.error || "Registration failed. Invalid or expired token.");
    }
  };

  if (status === 'success') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="success" variant="filled">{msg}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={0} sx={{ mt: 8, p: 4, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd /> Complete Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You have been invited to join the system. Please set up your details.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="First Name" required 
            onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
          <TextField label="Last Name" required 
            onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
          <TextField label="Create Password" type="password" required 
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          {status === 'error' && <Alert severity="error">{msg}</Alert>}
          
          <Button type="submit" variant="contained" disabled={status === 'loading'}>
            {status === 'loading' ? 'Registering...' : 'Create Account'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};