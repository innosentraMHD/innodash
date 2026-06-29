import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemText,
  useTheme, useMediaQuery, Chip, Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from './NotificationBell';
import logo from '../images/logo.png';
import logo2 from '../images/logo2.png';

// --- تصميم زر التبديل المخصص (شمس بيضاء على خلفية صفراء / قمر أبيض على خلفية داكنة) ---
const DayNightSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    transition: theme.transitions.create(['transform'], {
      duration: 500,
    }),

    '&.Mui-checked': {
      color: theme.palette.custom.switchThumbIcon,
      transform: 'translateX(22px)',

      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.background.default,
        width: 32,
        height: 32,
        boxShadow: 'none',
      },

      '& .MuiSwitch-thumb:before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 1,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24'><path fill='${encodeURIComponent(
          theme.palette.custom.switchMoonIcon
        )}' d='M9.37 5.51C9.19 6.15 9.1 6.82 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4 0.68 0 1.35-0.09 1.99-0.27C17.45 18.55 14.02 21 10 21c-4.42 0-8-3.58-8-8 0-4.02 2.45-7.45 7.37-7.49z'/></svg>")`
      },

      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.custom.switchTrackDark, // لون الليل
      },
    },
  },

  '& .MuiSwitch-thumb': {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.palette.custom.switchThumbShadow,
    position: 'relative',

    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url("data:image/svg+xml;utf8,
        <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24'>
          <circle cx='12' cy='12' r='10' fill='${encodeURIComponent(theme.palette.custom.switchThumbIcon)}' />
        </svg>")`
    },
  },

  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.custom.switchTrackLight,
    borderRadius: 20 / 2,
  },
}));


const Navbar = ({ currentView, setCurrentView, user, onLogout, mode, setMode, authToken }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeChange = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // --- منطق الصلاحيات للقائمة ---
  const baseViews = [
    { key: 'dashboard', text: 'Dashboard' },
    // { key: 'statsReport', text: 'Reports' },
    { key: 'heatmaps', text: 'Heat Maps' },
  ];

  // if (user?.is_staff || user?.is_superuser) {
  //   baseViews.push({ key: 'emailSettings', text: 'Alerts' });
  // }

  if (user?.is_superuser) {
    baseViews.push({ key: 'machines', text: 'Devices' });
    baseViews.push({ key: 'users', text: 'Team' });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ color: 'primary.main' }}>INNODASH</Typography>
      
      <List>
        {baseViews.map((view) => (
          <ListItem key={view.key} onClick={() => setCurrentView(view.key)} disablePadding>
            <ListItemText 
                primary={view.text} 
                sx={{ 
                    textAlign: 'center', 
                    color: currentView === view.key ? 'primary.main' : 'text.primary' 
                }} 
            />
          </ListItem>
        ))}
        {/* جرس الإشعارات في الموبايل */}
        
        {/* زر التبديل داخل القائمة الجانبية للموبايل */}
        <ListItem sx={{justifyContent: 'center'}}>
           <DayNightSwitch checked={mode === 'dark'} onChange={handleThemeChange} />
        </ListItem>
        <ListItem>
             <Button sx={{color:theme.palette.chartLegacy.error}} fullWidth onClick={onLogout}>Logout</Button>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static" sx={{mt: 0, borderBottom: `4px solid ${theme.palette.primary.main}`}}>
        <Toolbar>
          <Box component="img" src={theme.palette.mode === 'light' ? logo : logo2} alt="Innosentra" sx={{ height: 40, width: 'auto', mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: theme.palette.mode === 'light' ? theme.palette.text.secondary : 'primary.main', fontWeight: 700 }}>
            INNODASH
          </Typography>

          {!isMobile && user && (
            <Chip 
                label={user.is_superuser ? "Owner" : user.is_staff ? "Staff" : "Viewer"} 
                color={theme.palette.mode === 'light' ? 'primary' : 'secondary'} 
                size="small" 
                variant="outlined"
                sx={{ mr: 2 }}
            />
          )}

          {isMobile ? (
            <>
                <NotificationBell authToken={authToken} />
             
            <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* جرس الإشعارات */}
              {authToken && <NotificationBell authToken={authToken} />}

              {/* زر التبديل في الأعلى للشاشات الكبيرة */}
              <DayNightSwitch checked={mode === 'dark'} onChange={handleThemeChange} sx={{ mr: 1 }} />

              {baseViews.map((view) => (
                <Button 
                  key={view.key} 
                  onClick={() => setCurrentView(view.key)}
                  sx={{ 
                    color: currentView === view.key ? 'primary.main' : 'text.primary',
                    fontWeight: currentView === view.key ? 600 : 400,
                    borderBottom: currentView === view.key ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 0,
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {view.text}
                </Button>
              ))}
              <IconButton onClick={onLogout} color={theme.palette.primary.main} title="Logout">
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;