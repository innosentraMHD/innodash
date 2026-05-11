import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotificationToast = ({ notification, onClose, duration = 5000 }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
    
    const timer = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification, duration, onClose]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    onClose?.();
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.notification_type || 'info'}
        sx={{ 
          width: '100%', 
          minWidth: 350,
          direction: 'ltr',
          textAlign: 'left',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <strong>{notification.title}</strong>
        <br />
        {notification.message}
        {notification.store_name && (
          <>
            <br />
            <small>From: {notification.store_name}</small>
          </>
        )}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;