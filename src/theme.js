import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {

  // 1. ألوان الأزرار والكلام خارج الأزرار (ألوان صلبة فقط)
  const buttonPrimaryColor = mode === 'light' ? 'rgb(13, 0, 79)' : '#ffffff'; 
  const buttonSecondaryColor = mode === 'light' ? '#000000' : '#90caf9';
  const textPrimaryColor = mode === 'light' ? '#000000' : '#f8fafc';
  const textSecondaryColor = mode === 'light' ? 'rgb(13, 0, 79)' : '#94a3b8';

  // 2. ألوان الكلام داخل الأزرار
  const buttonContrastText = mode === 'light' ? '#ffffff' : '#0f172a';

  // 3. ألوان الخلفيات للواجهات
  const backgroundDefault = mode === 'light' ? '#f4f6f8' : '#0f172a'; 
  const backgroundPaper = mode === 'light' ? '#ffffff' : '#1e293b'; 

  // 4. تعريف التدرجات (gradients) للاستخدام في components
  const primaryGradient = mode === 'light' 
    ? 'linear-gradient(135deg,rgb(5, 0, 145) 0%,rgb(10, 0, 62) 100%)'
    : 'linear-gradient(135deg,rgb(83, 83, 83) 0%,rgb(60, 60, 60) 100%)';

  const secondaryGradient = mode === 'light'
    ? 'linear-gradient(135deg,rgb(25, 0, 168) 0%,rgb(11, 0, 92) 100%)'
    : 'linear-gradient(135deg, #5a5a5a 0%, #1a1a1a 100%)';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: buttonPrimaryColor,  // لون صلب للاستخدام العادي
        contrastText: buttonContrastText,
      },
      secondary: {
        main: buttonSecondaryColor,
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimaryColor,
        secondary: textSecondaryColor,
      },
      charts: {
        male: mode === 'light' ? '#452bd6' : '#448dafe2',   
        female: mode === 'light' ? '#100263' : '#49c5ffe3', 
        adult: mode === 'light' ? '#2c13b9' : '#86ffc8e5' ,  
        child: mode === 'light' ? '#160a5c' : '#31a291dd' ,  
        local: mode === 'light' ? '#5743ca' : '#114477de',
        nonLocal: mode === 'light' ? '#1900a8' : '#67a0f1df',
      },
      custom: {
        mutedText: '#000000',
        navbarTitleLight: '#000000',
        switchThumbIcon: mode === 'light' ? '#ffffff' : '#000000',
        switchMoonIcon: '#000000',
        last24: '#ffffff',
        switchTrackLight: '#452bd6',
        switchTrackDark: '#000000',
        switchThumbShadow: '0 2px 4px rgba(0,0,0,0.2)',
        mapPanelBackground: '#000000',
        mapPreviewBackground: '#000000',
        dashedBorder: '#000000',
        panelNeutralBackground: '#000000',
        panelNeutralBorder: '#000000',
        videoBackground: '#000000',
        primaryGradient: primaryGradient,    // إضافة التدرج هنا
        secondaryGradient: secondaryGradient, // إضافة التدرج هنا
      },
      chartLegacy: {
        error: 'rgb(154, 2, 2)',

      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, marginBottom: '1rem' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
          }),
          // تطبيق التدرج على الزر الأساسي (contained)
          containedPrimary: ({ theme }) => ({
            background: theme.palette.custom.primaryGradient,
            color: '#ffffff',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg,rgb(24, 0, 118) 0%,rgb(3, 0, 91) 100%)'
                : 'linear-gradient(135deg, #333333 0%, #000000 100%)',
            },
          }),
          containedSecondary: ({ theme }) => ({
            background: theme.palette.custom.secondaryGradient,
            color: '#ffffff',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg,rgb(17, 0, 145) 0%,rgb(1, 6, 66) 100%)'
                : 'linear-gradient(135deg, #444444 0%, #000000 100%)',
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: backgroundPaper,
            color: textPrimaryColor,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: buttonPrimaryColor,
          },
        },
      },
    },
  });
};