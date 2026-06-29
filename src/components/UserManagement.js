import React, { useState, useEffect } from 'react';
import axiosInstance, { API } from '../api';
import {
  Box, Paper, Typography, Chip, Button, Dialog, DialogTitle, DialogContent,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, IconButton,
  Tooltip, DialogActions, DialogContentText, useTheme, Stack
} from '@mui/material';
import { 
  Add, Delete, ContentCopy, Close, Security, VerifiedUser, 
  AdminPanelSettings, Person, Warning, Email, Edit
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const UserManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  
  // Invite System States
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('normal');
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading] = useState(false);

  // States for delete
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // State for edit role (حالة جديدة لتعديل الدور)
  const [openEditRole, setOpenEditRole] = useState(false);
  const [editRole, setEditRole] = useState('');

  // Fetch users on load
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API.USERS);
      let usersData = res.data;
      if (!Array.isArray(usersData)) {
        usersData = usersData.results || usersData.users || usersData.data || [];
      }
      if (!Array.isArray(usersData)) {
        usersData = [];
      }
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Generate invite link
  const handleGenerateInvite = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API.INVITE, { email: inviteEmail, role: inviteRole });
      setInviteToken(res.data.invite_token);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Check inputs"));
    }
    setLoading(false);
  };

  // Copy link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Open edit role dialog
  const handleOpenEditRole = (user) => {
    setSelectedUser(user);
    setEditRole(user.is_superuser ? 'owner' : user.is_staff ? 'manager' : 'viewer');
    setOpenEditRole(true);
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    
    let updates = {};
    if (editRole === 'owner') {
      updates = { is_superuser: true, is_staff: false };
    } else if (editRole === 'manager') {
      updates = { is_superuser: false, is_staff: true };
    } else {
      updates = { is_superuser: false, is_staff: false };
    }

    try {
      await axiosInstance.put(`${API.USERS}${selectedUser.id}/`, updates);
      fetchUsers();
      setOpenEditRole(false);
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
    setActionLoading(false);
  };

  // Open delete confirmation
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  // Execute delete
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await axiosInstance.delete(`${API.USERS}${selectedUser.id}/`);
      setOpenDelete(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Cannot delete user");
    }
    setActionLoading(false);
  };

  // Get role chip component
  const getRoleChip = (user) => {
    if (user.is_superuser) {
      return (
        <Chip 
          icon={<VerifiedUser />} 
          label="Owner" 
          color="secondary" 
          size="small"
          variant="outlined"
        />
      );
    } else if (user.is_staff) {
      return (
        <Chip 
          icon={<AdminPanelSettings />} 
          label="Manager" 
          color="primary" 
          size="small"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip 
          icon={<Person />} 
          label="Viewer" 
          size="small"
          variant="outlined"
        />
      );
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, mt: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2, backdropFilter: 'blur(12px)', backgroundColor: alpha(theme.palette.background.paper, 0.85) }}>
        <Box>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Team & Roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team members and their permissions
          </Typography>
        </Box>
        <Button 
          startIcon={<Add />} 
          variant="contained" 
          onClick={() => setOpenInvite(true)}
        >
          Invite New User
        </Button>
      </Paper>

      {/* Users List - نفس نمط الـ devices */}
      <Stack spacing={2}>
        {Array.isArray(users) && users.map((user) => (
          <Paper 
            key={user.id} 
            elevation={0}
            sx={{ p: 2, borderRadius: 2, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) }, backdropFilter: 'blur(12px)', backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}
          >
            <Stack spacing={2}>
              
              {/* القسم الأول: معلومات المستخدم متجاورة */}
              <Stack 
                direction="row" 
                alignItems="center" 
                flexWrap="wrap" 
                gap={2}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {user.username}
                </Typography>

                {getRoleChip(user)}


                <Typography variant="body2" color="text.secondary">
                  <Email fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {user.email || user.username}
                </Typography>
              </Stack>

              {/* القسم الثاني: الأزرار */}
              <Stack 
                direction="row" 
                spacing={1} 
                justifyContent="flex-end"
                sx={{ borderTop: '1px dashed #e0e0e0', pt: 1 }}
              >
                <Tooltip title="Change Role">
                  <IconButton 
                    sx={{
                      color: theme.palette.primary.contrastText,
                      backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark
                    }}  
                    onClick={() => handleOpenEditRole(user)}
                  >
                    <Security />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete User">
                  <IconButton 
                    sx={{
                      color: theme.palette.primary.contrastText,
                      backgroundColor: theme.palette.error.main
                    }} 
                    onClick={() => handleOpenDelete(user)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Stack>

            </Stack>
          </Paper>
        ))}

        {/* حالة عدم وجود مستخدمين */}
        {users.length === 0 && (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">
              No users found. Click "Invite New User" to add team members.
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* --- Invite Modal Dialog --- */}
      <Dialog open={openInvite} onClose={() => {setOpenInvite(false); setInviteToken('')}} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Invite New Member
          <IconButton onClick={() => setOpenInvite(false)}><Close/></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!inviteToken ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Email Address" 
                fullWidth 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                helperText="An invitation link will be generated for this email."
              />
              <FormControl fullWidth>
                <InputLabel>Initial Role</InputLabel>
                <Select value={inviteRole} label="Initial Role" onChange={(e) => setInviteRole(e.target.value)}>
                  <MenuItem value="normal">Viewer (Read Only)</MenuItem>
                  <MenuItem value="staff">Manager (Can Manage Stores)</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" size="large" onClick={handleGenerateInvite} disabled={loading}>
                {loading ? "Generating..." : "Generate Invite Link"}
              </Button>
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Invitation Link Generated Successfully!
              </Alert>
              <Typography variant="subtitle2" gutterBottom>Share this link with the user:</Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.grey[50], 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', mr: 2 }}>
                  {`${window.location.origin}/register?token=${inviteToken}`}
                </Typography>
                <Tooltip title="Copy to Clipboard">
                  <IconButton onClick={() => copyToClipboard(`${window.location.origin}/register?token=${inviteToken}`)} color="primary">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Edit Role Dialog --- */}
      <Dialog open={openEditRole} onClose={() => setOpenEditRole(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change role for user <strong>{selectedUser?.username}</strong>
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={editRole} label="Role" onChange={(e) => setEditRole(e.target.value)}>
              <MenuItem value="viewer">
                <Stack direction="row" alignItems="center" gap={1}>
                  <Person fontSize="small" />
                  <Box>
                    <Typography variant="body2">Viewer</Typography>
                    <Typography variant="caption" color="textSecondary">Read only access</Typography>
                  </Box>
                </Stack>
              </MenuItem>
              <MenuItem value="manager">
                <Stack direction="row" alignItems="center" gap={1}>
                  <AdminPanelSettings fontSize="small" />
                  <Box>
                    <Typography variant="body2">Manager</Typography>
                    <Typography variant="caption" color="textSecondary">Can manage stores</Typography>
                  </Box>
                </Stack>
              </MenuItem>
              <MenuItem value="owner">
                <Stack direction="row" alignItems="center" gap={1}>
                  <VerifiedUser fontSize="small" />
                  <Box>
                    <Typography variant="body2">Owner</Typography>
                    <Typography variant="caption" color="textSecondary">Full system access</Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditRole(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained" disabled={actionLoading}>
            {actionLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', gap: 1 }}>
          <Warning /> Delete User?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? 
            This action is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error" 
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;