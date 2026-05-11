import React, { useState, useEffect } from 'react';
import axiosInstance, { API } from '../api'; 

import { 
  Box, Button, Typography, Paper, TextField, 
 Chip, Alert, 
  Stack, LinearProgress, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText,useTheme
} from '@mui/material';
import { 
  ArrowBack, AddCircle, Refresh, NetworkCheck, 
  Edit, Delete, Warning, VpnKey, ContentCopy 
} from '@mui/icons-material';

const DJANGO_URL = API.DEVICES; 

function Machiens({ onBackToDashboard }) {
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // States للإنشاء
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [creationResult, setCreationResult] = useState(null);
  const [creationError, setCreationError] = useState('');

  // States للنوافذ المنبثقة
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreds, setOpenCreds] = useState(false); // نافذة عرض الـ UUID
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editName, setEditName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    fetchAllStatus();
  }, []);

  const fetchAllStatus = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${DJANGO_URL}/devices/status_all/`);
      // Ensure response.data is always an array
      let devicesData = response.data;
      if (!Array.isArray(devicesData)) {
        devicesData = devicesData.results || devicesData.devices || devicesData.data || [];
      }
      if (!Array.isArray(devicesData)) {
        devicesData = [];
      }
      setDevices(devicesData);
      setMessage(devicesData.length > 0 ? 'Devices fetched successfully' : 'No devices registered yet');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      setMessage(`Error: ${errorMsg}`);
      if (error.response?.status === 401) setMessage("Unauthorized: Please login again.");
      setDevices([]);
    }
    setLoading(false);
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!newStoreName) {
      setCreationError('Please enter the new store name.');
      return;
    }
    setLoadingCreate(true);
    setCreationResult(null);
    setCreationError('');
    setMessage('');
    try {
      const response = await axiosInstance.post(`${DJANGO_URL}/register/`, { store_name: newStoreName });
      if (response.status === 201) {
        setCreationResult(response.data);
        setNewStoreName('');
        setMessage('Device created successfully.');
        fetchAllStatus();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.store_name?.[0] || error.response?.data?.detail || error.message;
      setCreationError(`Error: ${errorMsg}`);
    }
    setLoadingCreate(false);
  };

  

  // --- Handlers ---

  const handleOpenEdit = (device) => {
    setSelectedDevice(device);
    setEditName(device.store_name);
    setOpenEdit(true);
  };

  const handleUpdateDevice = async () => {
    if (!editName.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.patch(`${DJANGO_URL}/devices/${selectedDevice.id}/`, { store_name: editName });
      setMessage(`Device updated.`);
      setOpenEdit(false);
      fetchAllStatus();
    } catch (error) {
      alert("Update failed: " + error.message);
    }
    setActionLoading(false);
  };

  const handleOpenDelete = (device) => {
    setSelectedDevice(device);
    setOpenDelete(true);
  };

  const handleDeleteDevice = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.delete(`${DJANGO_URL}/devices/${selectedDevice.id}/`);
      setMessage(`Device deleted.`);
      setOpenDelete(false);
      fetchAllStatus();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
    setActionLoading(false);
  };

  // فتح نافذة بيانات الاعتماد (UUID)
  const handleOpenCreds = (device) => {
    setSelectedDevice(device);
    setOpenCreds(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <Box sx={{ p: 2 }} >
       <br/>
      <Stack direction="row" alignItems="center" justifyContent="space-between"  sx={{p:2, borderRadius:1, backgroundColor: theme.palette.mode === 'light' ? 'rgb(255,255,255)' : ""}}>
       
        <Typography variant="h6" color="primary">Devices</Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBackToDashboard}>
          Dashboard
        </Button>
      </Stack>

      {/* Create Section */}
      <Paper sx={{ p: 3, mb: 4 ,boxShadow:"none"}}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddCircle color="primary" /> Register New Device
        </Typography>
        <Box component="form" onSubmit={handleCreateDevice} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Store/Device Name" size="small"
            value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)}
            disabled={loadingCreate} sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="contained" disabled={loadingCreate}>
            {loadingCreate ? 'Creating...' : 'Generate UUID'}
          </Button>
        </Box>
        
        {creationError && <Alert severity="error" sx={{ mt: 2 }}>{creationError}</Alert>}
        
        {creationResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Created! Send these credentials to the Edge Device:</Typography>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>UUID:</strong> {creationResult.registration_uuid}</span>
              <IconButton size="small" onClick={() => copyToClipboard(creationResult.registration_uuid)}><ContentCopy fontSize="small"/></IconButton>
            </Box>
          </Alert>
        )}
      </Paper>

      {/* List Section */}
      <Box >
        <Stack direction="row" justifyContent="space-between" mb={2} sx={{p:1}}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NetworkCheck color="primary" /> Monitor Status
          </Typography>
          <Button startIcon={<Refresh />} sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,color: theme.palette.primary.contrastText }} onClick={fetchAllStatus} disabled={loading}>Refresh</Button>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 1 }} />}
        {message && !loading && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  {Array.isArray(devices) && devices.map((device) => (
    <Paper 
      key={device.id} 
      variant="outlined" 
      sx={{ p: 2, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Stack spacing={2}>
        
        {/* القسم الأول: البنود الثلاثة متجاورة */}
        <Stack 
          direction="row" 
          alignItems="center" 
          flexWrap="wrap" 
          gap={2}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {device.store_name}
          </Typography>

          <Chip 
            label={device.status} 
            color={device.status === 'connected' ? 'success' : 'error'} 
            size="small" 
            variant="outlined"
          />

          <Typography variant="body2" color="text.secondary">
          <Typography variant="body2" color="text.secondary">
            Last Seen: 
            </Typography>
            {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
          </Typography>
        </Stack>

        {/* القسم الثاني: الأزرار أسفلها ومحاذاتها لليمين */}
        <Stack 
          direction="row" 
          spacing={1} 
          justifyContent="flex-end" // هذه الخاصية تجعل الأزرار تذهب لليمين
          sx={{ borderTop: '1px dashed #e0e0e0',pt:1}} // خط فاصل خفيف اختياري للترتيب
        >
          <Tooltip title="View UUID (For Repair)">
            <IconButton  sx={{color:theme.palette.primary.contrastText,backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark}}  onClick={() => handleOpenCreds(device)}>
              <VpnKey />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Edit Name">
            <IconButton sx={{color:theme.palette.primary.contrastText,backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,}}  onClick={() => handleOpenEdit(device)}>
              <Edit />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton  sx={{color:theme.palette.primary.contrastText,backgroundColor:theme.palette.chartLegacy.error}} onClick={() => handleOpenDelete(device)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>

      </Stack>
    </Paper>
  ))}

  {/* حالة عدم وجود أجهزة */}
  {devices.length === 0 && !loading && (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
      <Typography color="text.secondary">
        No devices found.
      </Typography>
    </Paper>
  )}
</Box>
      </Box>

      {/* --- Credentials Dialog (View UUID) --- */}
      <Dialog open={openCreds} onClose={() => setOpenCreds(false)} fullWidth maxWidth="xs">
        <DialogTitle>Device Credentials</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Use this UUID to re-activate the device if the connection is lost.
          </DialogContentText>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">Store Name</Typography>
            <Typography variant="body1" fontWeight="bold" gutterBottom>{selectedDevice?.store_name}</Typography>
            
            <Typography variant="caption" color="textSecondary">Registration UUID</Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedDevice?.registration_uuid || "Hidden/Not Available"}
                </Typography>
                <IconButton onClick={() => copyToClipboard(selectedDevice?.registration_uuid)}>
                    <ContentCopy />
                </IconButton>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreds(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* --- Edit Dialog --- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Name</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Store Name" fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateDevice} variant="contained" disabled={actionLoading}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Dialog --- */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', gap: 1 }}><Warning /> Delete Device?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedDevice?.store_name}</strong>? This is permanent.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteDevice} variant="contained" color="error" disabled={actionLoading}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Machiens;