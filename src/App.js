import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { jwtDecode } from "jwt-decode"; 

// 🔥 إضافات Capacitor للإشعارات
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

import { getTheme } from './theme';
import axiosInstance from './api';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Machiens from './components/Machiens';
import StatsReport from './components/StatsReport';
import EmailSettings from './components/EmailSettings';
import HeatMapPage from './components/HeatMapPage';
import UserManagement from './components/UserManagement';
import { LoginPage, SetupPage, RegisterPage } from './components/AuthPages';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [appState, setAppState] = useState('loading'); 

  // --- إعدادات الوضع الليلي/النهاري ---
  const [mode, setMode] = useState(localStorage.getItem('appThemeMode') || 'light');

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      // الـ exp يكون بالثواني، و Date.now() بالملي ثانية
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (e) {
      return true; // إذا فشل فك التشفير، نعتبرها منتهية/فاسدة
    }
  };

  const theme = useMemo(() => {
    if (getTheme && typeof getTheme === 'function') {
      return getTheme(mode);
    }
    console.warn("Using fallback theme. Please update 'theme.js' to export 'getTheme'.");
    return getTheme('light');
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('appThemeMode', mode);
  }, [mode]);
  // -----------------------------------

  // 1. عند التحميل، تحقق من الحالة
  useEffect(() => {
    checkAppState();
  }, [token]);

  const checkAppState = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('token');
    
    if (inviteToken && window.location.pathname === '/register') {
      setAppState('register');
      return;
    }

    let currentAccessToken = localStorage.getItem('access_token');
    const currentRefreshToken = localStorage.getItem('refresh_token');

    // إذا لم يكن هناك أي توكن، اذهب للـ auth
    if (!currentAccessToken && !currentRefreshToken) {
      setAppState('auth');
      return;
    }

    try {
      // إذا كانت التوكن موجودة ولكنها منتهية، حاول تجديدها
      if (isTokenExpired(currentAccessToken)) {
        if (!currentRefreshToken || isTokenExpired(currentRefreshToken)) {
          throw new Error("Refresh token is missing or expired");
        }

        // إرسال طلب التجديد للباك اند
        const response = await axiosInstance.post('/token/refresh/', {
          refresh: currentRefreshToken
        });

        // حفظ التوكن الجديدة
        currentAccessToken = response.data.access;
        localStorage.setItem('access_token', currentAccessToken);
        setToken(currentAccessToken); 
        
        // ملاحظة: إذا كان الباك اند يرسل refresh token جديد أيضاً، قم بحفظه:
        // if (response.data.refresh) localStorage.setItem('refresh_token', response.data.refresh);
      }

      // في هذه المرحلة، نضمن أن التوكن صالحة ومحدثة
      const decoded = jwtDecode(currentAccessToken);
      setUser({
        username: decoded.username,
        is_superuser: decoded.is_superuser,
        is_staff: decoded.is_staff
      });
      setAppState('app');

    } catch (e) {
      console.error("Token verification or refresh failed:", e);
      handleLogout(); // مسح التوكنز وتوجيه المستخدم لتسجيل الدخول
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); // 🔥 لا تنسَ مسح الريفريش توكن أيضاً
    setToken(null);
    setUser(null);
    setAppState('auth');
    // window.location.href = '/'; // يمكنك تفعيلها إذا أردت إعادة تحميل الصفحة بالكامل
  };

  // 🔥 2. تهيئة الإشعارات
  useEffect(() => {
    if (appState === 'app' && user.is_superuser && Capacitor.isNativePlatform() ) {
      setupPushNotifications();
    }
  }, [appState]);

  const setupPushNotifications = async () => {
    try {
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
      }

      PushNotifications.addListener('registration', async (fcmToken) => {
        console.log('FCM Token:', fcmToken.value);
        try {
          await axiosInstance.post('/accounts/save-device-token/', {
            device_token: fcmToken.value
          });
          console.log('Token saved to backend successfully');
        } catch (error) {
          console.error('Error saving device token to backend:', error);
        }
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed: ', action);
      });

    } catch (error) {
      console.error('Push Notification Setup Error:', error);
    }
  };

  const handleLoginSuccess = () => {
    const t = localStorage.getItem('access_token');
    setToken(t); 
  };

  // --- توجيه العرض (Render Logic) ---
  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
      case 'register':
        const urlParams = new URLSearchParams(window.location.search);
        return <RegisterPage token={urlParams.get('token')} />;
      case 'setup':
        return <SetupPage onSetupSuccess={() => setAppState('auth')} />;
      case 'auth':
        return (
          <Box>
            <LoginPage onLoginSuccess={handleLoginSuccess} />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setAppState('setup')}>
                    First time here? Initialize System
                </Typography>
            </Box>
          </Box>
        );
      case 'app':
        return (
          <>
            <Navbar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              user={user} 
              onLogout={handleLogout}
              mode={mode}
              setMode={setMode}
              authToken={token}
            />
            <Container maxWidth={false} disableGutters sx={{ p: 0, m: 0 }}>
              {renderViewBody()}
            </Container>
          </>
        );
      default:
        return null;
    }
  };

  const renderViewBody = () => {
    if (!user) return null;
    switch (currentView) {
      case 'machines': return user.is_superuser ? <Machiens onBackToDashboard={() => setCurrentView('dashboard')} /> : <Typography color="error">Access Denied</Typography>;
      case 'users': return user.is_superuser ? <UserManagement /> : <Typography color="error">Access Denied</Typography>;
      case 'statsReport': return <StatsReport />;
      case 'heatmaps': return <HeatMapPage />;
      case 'emailSettings': return (user.is_staff || user.is_superuser) ? <EmailSettings /> : <Typography color="error">Restricted Area</Typography>;
      case 'dashboard':
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* تغيير الخلفية بناءً على الوضع:
        - نهاري: لون رمادي 235 235 235
        - ليلي: استخدام لون خلفية الثيم الافتراضي 
      */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          minHeight: '100vh', 
          background: theme.palette.custom.primaryGradient, 
          color: 'text.primary' 
        }}
      >
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
}

export default App;


// import React, { useState, useEffect, useMemo } from 'react';
// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import { Container, Box, CircularProgress, Typography } from '@mui/material';
// import { jwtDecode } from "jwt-decode"; 

// // 🔥 إضافات Capacitor للإشعارات
// import { PushNotifications } from '@capacitor/push-notifications';
// import { Capacitor } from '@capacitor/core';

// import { getTheme } from './theme';
// import axiosInstance from './api';

// // 🖼️ استيراد صورة الخلفية
// import backgroundImage from './images/back.png';

// // Components
// import Navbar from './components/Navbar';
// import Dashboard from './components/Dashboard';
// import Machiens from './components/Machiens';
// import StatsReport from './components/StatsReport';
// import EmailSettings from './components/EmailSettings';
// import HeatMapPage from './components/HeatMapPage';
// import UserManagement from './components/UserManagement';
// import { LoginPage, SetupPage, RegisterPage } from './components/AuthPages';

// function App() {
//   const [token, setToken] = useState(localStorage.getItem('access_token'));
//   const [user, setUser] = useState(null);
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [appState, setAppState] = useState('loading'); 

//   // --- إعدادات الوضع الليلي/النهاري ---
//   const [mode, setMode] = useState(localStorage.getItem('appThemeMode') || 'light');

//   const theme = useMemo(() => {
//     if (getTheme && typeof getTheme === 'function') {
//       return getTheme(mode);
//     }
//     console.warn("Using fallback theme. Please update 'theme.js' to export 'getTheme'.");
//     return getTheme('light');
//   }, [mode]);

//   useEffect(() => {
//     localStorage.setItem('appThemeMode', mode);
//   }, [mode]);
//   // -----------------------------------

//   // 1. عند التحميل، تحقق من الحالة
//   useEffect(() => {
//     checkAppState();
//   }, [token]);

//   const checkAppState = async () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const inviteToken = urlParams.get('token');
//     if (inviteToken && window.location.pathname === '/register') {
//       setAppState('register');
//       return;
//     }

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUser({
//           username: decoded.username,
//           is_superuser: decoded.is_superuser,
//           is_staff: decoded.is_staff
//         });
//         setAppState('app');
//       } catch (e) {
//         handleLogout();
//       }
//       return;
//     }

//     setAppState('auth'); 
//   };

//   // 🔥 2. تهيئة الإشعارات (تعمل فقط إذا كان المستخدم مسجل دخول، والتطبيق يعمل على موبايل)
//   useEffect(() => {
//     if (appState === 'app' && user?.is_superuser && Capacitor.isNativePlatform() ) {
//       setupPushNotifications();
//     }
//   }, [appState, user]);

//   const setupPushNotifications = async () => {
//     try {
//       // طلب الإذن من المستخدم
//       const permStatus = await PushNotifications.requestPermissions();
//       if (permStatus.receive === 'granted') {
//         // تسجيل الجهاز في فايربيز للحصول على التوكن
//         await PushNotifications.register();
//       }

//       // الاستماع لنجاح التسجيل واستلام الـ Device Token
//       PushNotifications.addListener('registration', async (fcmToken) => {
//         console.log('FCM Token:', fcmToken.value);
//         // إرسال التوكن إلى جانغو لربطه بهذا المستخدم
//         try {
//           await axiosInstance.post('/accounts/save-device-token/', {
//             device_token: fcmToken.value
//           });
//           console.log('Token saved to backend successfully');
//         } catch (error) {
//           console.error('Error saving device token to backend:', error);
//         }
//       });

//       // الاستماع للإشعارات في حال كان التطبيق مفتوحاً (Foreground)
//       PushNotifications.addListener('pushNotificationReceived', (notification) => {
//         console.log('Push received: ', notification);
//         // يمكنك هنا عرض Alert أو تحديث بيانات الشاشة
//       });

//       // الاستماع لحدث النقر على الإشعار
//       PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
//         console.log('Push action performed: ', action);
//         // يمكنك هنا توجيه المستخدم لصفحة معينة بناءً على الإشعار
//       });

//     } catch (error) {
//       console.error('Push Notification Setup Error:', error);
//     }
//   };

//   const handleLoginSuccess = () => {
//     const t = localStorage.getItem('access_token');
//     setToken(t); 
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     setToken(null);
//     setUser(null);
//     setAppState('auth');
//     window.location.href = '/';
//   };

//   // --- توجيه العرض (Render Logic) ---
//   const renderContent = () => {
//     switch (appState) {
//       case 'loading':
//         return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
//       case 'register':
//         const urlParams = new URLSearchParams(window.location.search);
//         return <RegisterPage token={urlParams.get('token')} />;
//       case 'setup':
//         return <SetupPage onSetupSuccess={() => setAppState('auth')} />;
//       case 'auth':
//         return (
//           <Box>
//             <LoginPage onLoginSuccess={handleLoginSuccess} />
//             <Box sx={{ textAlign: 'center', mt: 2 }}>
//                 <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setAppState('setup')}>
//                     First time here? Initialize System
//                 </Typography>
//             </Box>
//           </Box>
//         );
//       case 'app':
//         return (
//           <>
//             <Navbar 
//               currentView={currentView} 
//               setCurrentView={setCurrentView} 
//               user={user} 
//               onLogout={handleLogout}
//               mode={mode}
//               setMode={setMode}
//               authToken={token}
//             />
//             <Container maxWidth="xl" sx={{ p: 0, mt: 0, mb: 4 }}>
//               {renderViewBody()}
//             </Container>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderViewBody = () => {
//     if (!user) return null;
//     switch (currentView) {
//       case 'machines': return user.is_superuser ? <Machiens onBackToDashboard={() => setCurrentView('dashboard')} /> : <Typography color="error">Access Denied</Typography>;
//       case 'users': return user.is_superuser ? <UserManagement /> : <Typography color="error">Access Denied</Typography>;
//       case 'statsReport': return <StatsReport />;
//       case 'heatmaps': return <HeatMapPage />;
//       case 'emailSettings': return (user.is_staff || user.is_superuser) ? <EmailSettings /> : <Typography color="error">Restricted Area</Typography>;
//       case 'dashboard':
//       default: return <Dashboard />;
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {/* 🖼️ إضافة صورة الخلفية الثابتة */}
//       <Box sx={{ 
//         p:1,
//         flexGrow: 1, 
//         minHeight: '100vh',
//         position: 'relative',
        
//         '&::before': {
//           content: '""',
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundImage:mode === 'dark' ?'none' : `url(${backgroundImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundRepeat: 'no-repeat',
//           backgroundAttachment: 'fixed',
          
//           zIndex: 0,
//           pointerEvents: 'none', // يسمح بالنقر عبر الخلفية
//         }
//       }}>
//         {/* المحتوى يظهر فوق الخلفية */}
//         <Box sx={{ position: 'relative', zIndex: 1 }}>
//           {renderContent()}
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }

// export default App;