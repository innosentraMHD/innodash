import React, { useState, useEffect } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem, ListItemText,
  ListItemIcon, Divider, Button, CircularProgress, Chip, Tab, Tabs, Dialog,
  DialogTitle, DialogContent, DialogActions, CardMedia
} from '@mui/material';

import {
  Notifications as NotificationsIcon, Circle as CircleIcon, CheckCircle as CheckCircleIcon,
  Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon,
  DeleteOutline as DeleteIcon, Store as StoreIcon
} from '@mui/icons-material';

import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import useNotifications from '../hooks/useNotifications';

const NotificationBell = ({ authToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: Recent, 1: Old
  const theme = useTheme();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openImageView, setOpenImageView] = useState(false);
  
  // استدعاء الخصائص الخاصة بالغير مقروء من الـ Hook
  const {
    notifications, unreadCount, loading, loadingMore, hasMore,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification
  } = useNotifications(authToken);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  const getIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type?.toLowerCase()) {
      case 'success': return <CheckCircleIcon color="success" {...iconProps} />;
      case 'error': return <ErrorIcon color="error" {...iconProps} />;
      case 'warning': return <WarningIcon color="warning" {...iconProps} />;
      default: return <InfoIcon color="info" {...iconProps} />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = { 'info': 'Info', 'success': 'Success', 'warning': 'Warning', 'error': 'Error' };
    return labels[type?.toLowerCase()] || type || 'Info';
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!loading) {
      fetchNotifications(1);
      
      // +++ التعديل هنا: تصفير العدد بمجرد فتح القائمة +++
      if (unreadCount > 0) {
        markAllAsRead();
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(Math.ceil(notifications.length / 10) + 1, true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // +++ التعديل هنا: تصفير العدد إذا عاد المستخدم لتبويب Recent New +++
    if (newValue === 0 && unreadCount > 0) {
      markAllAsRead();
    }

    // استدعاء الصفحة الثانية عند فتح التبويبة القديمة (المنطق السابق)
    if (newValue === 1 && notifications.length <= 10 && hasMore && !loadingMore) {
      fetchNotifications(2, true); 
    }
  };

  const handleNotificationClick = (notification) => {
    // تعليم كـ مقروء عند النقر
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedAlert(notification);
    setDialogOpen(true);
  };

  // تقسيم المصفوفة إلى 10 عناصر حديثة، وما تبقى كعناصر قديمة
  const recentNotifications = notifications.slice(0, 10);
  const oldNotifications = notifications.slice(10);
  const displayedNotifications = tabValue === 0 ? recentNotifications : oldNotifications;

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} aria-describedby={id} sx={{ position: 'relative' }}>
        <Badge
          badgeContent={unreadCount} // إظهار عداد الإشعارات غير المقروءة
          color="error"
          sx={{
            '& .MuiBadge-badge': { right: 8, top: 8, border: `2px solid ${theme.palette.background.paper}`, padding: '0 4px', fontSize: '0.75rem', fontWeight: 'bold' },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id} open={open} anchorEl={anchorEl} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 450, maxHeight: 650, overflow: 'hidden', boxShadow: theme.shadows[8] } }}
      >
        <Box sx={{
          p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            🔔 Notifications
          </Typography>
          {/* زر التحديد ككل مقروء */}
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} disabled={loading} sx={{ textTransform: 'none' }}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Tabs
          value={tabValue} onChange={handleTabChange} variant="fullWidth"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default }}
        >
          <Tab label="Recent (New)" />
          <Tab label="Old Notifications" />
        </Tabs>

        <List
          sx={{
            overflow: 'auto', maxHeight: 480, '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: theme.palette.action.hover },
            '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: '4px' },
          }}
          onScroll={(e) => {
            const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
            if (bottom && hasMore && !loadingMore && tabValue === 1) {
              handleLoadMore();
            }
          }}
        >
          {displayedNotifications.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, color: 'text.secondary' }}>
              <NotificationsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">
                {tabValue === 0 ? 'No recent notifications' : 'No old notifications'}
              </Typography>
            </Box>
          ) : (
            <>
              {displayedNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      // تلوين الخلفية إذا كان الإشعار غير مقروء
                      backgroundColor: !notification.is_read ? theme.palette.action.hover : 'transparent',
                      '&:hover': { backgroundColor: theme.palette.action.selected },
                      cursor: 'pointer', transition: 'all 0.2s ease', py: 1.5, px: 1.5
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getIcon(notification.notification_type)}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                              {notification.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              <Chip label={getTypeLabel(notification.notification_type)} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                              {notification.store_name && (
                                <Chip icon={<StoreIcon sx={{ fontSize: 14 }} />} label={notification.store_name} size="small" variant="filled" sx={{ height: 20, fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: enUS })}
                          </Typography>
                        </>
                      }
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {/* الدائرة الزرقاء للإشعارات غير المقروءة */}
                      {!notification.is_read && (
                        <CircleIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </ListItem>

                  {index < displayedNotifications.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ my: 0 }} />
                  )}
                </React.Fragment>
              ))}
              
              {loadingMore && tabValue === 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}

          {loading && !displayedNotifications.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={32} />
            </Box>
          )}
        </List>
      </Popover>

      {/* نافذة عرض تفاصيل الإشعار (الصور/الفيديو) كما هي */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getIcon(selectedAlert.notification_type)}
              <Typography variant="h6">{selectedAlert.title}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              {selectedAlert.media_file && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', borderRadius: 1, overflow: 'hidden', bgcolor: 'black' }}>
                  {isVideo(selectedAlert.media_file) ? (
                    <CardMedia component="video" controls src={selectedAlert.media_file} sx={{ maxHeight: 400, width: 'auto', maxWidth: '100%' }} />
                  ) : (
                    <>
                      <CardMedia component="img" src={selectedAlert.media_file} alt="Alert visual" onClick={() => setOpenImageView(true)} sx={{ maxHeight: 400, width: 'auto', maxWidth: '100%', objectFit: 'contain', cursor: 'zoom-in' }} />
                      <Dialog open={openImageView} onClose={() => setOpenImageView(false)} maxWidth="lg" fullWidth PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' } }}>
                        <img src={selectedAlert.media_file} alt="Enlarged alert visual" onClick={() => setOpenImageView(false)} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', cursor: 'zoom-out' }} />
                      </Dialog>
                    </>
                  )}
                </Box>
              )}
              <Typography variant="body1" sx={{ mt: 1 }}>{selectedAlert.message}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                <Chip label={getTypeLabel(selectedAlert.notification_type)} size="small" variant="outlined" />
                {selectedAlert.store_name && (
                  <Chip icon={<StoreIcon sx={{ fontSize: 14 }} />} label={selectedAlert.store_name} size="small" color="primary" variant="outlined" />
                )}
                <br/>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mt: 0.5 }}>From: {selectedAlert.store}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mt: 0.5 }}>{formatDistanceToNow(new Date(selectedAlert.timestamp), { addSuffix: true, locale: enUS })}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="primary">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default NotificationBell;