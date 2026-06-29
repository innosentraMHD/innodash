import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {

  // 1. ألوان الأزرار والكلام خارج الأزرار (ألوان صلبة فقط)
  const buttonPrimaryColor = '#0A3C5A';
  const buttonSecondaryColor = '#D32F2F';
  const textPrimaryColor = mode === 'light' ? '#000000' : '#f8fafc';
  const textSecondaryColor = mode === 'light' ? 'rgb(13, 0, 79)' : '#94a3b8';

  // 2. ألوان الكلام داخل الأزرار
  const buttonContrastText = '#ffffff';

  // 3. ألوان الخلفيات للواجهات
  const backgroundDefault = mode === 'light' ? '#f4f6f8' : '#0f172a';
  const backgroundPaper = mode === 'light' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(30, 41, 59, 0.65)';

  // 4. تعريف التدرجات (gradients) للاستخدام في components
  const primaryGradient = mode === 'light'
    ? 'linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%)'
    : 'linear-gradient(135deg, #1e1e2f 0%, #2c2c54 100%)';

  const secondaryGradient = mode === 'light'
    ? 'linear-gradient(135deg, #f3e5f5 0%, #e0f7fa 100%)'
    : 'linear-gradient(135deg, #2c2c54 0%, #1e1e2f 100%)';

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
        adult: mode === 'light' ? '#2c13b9' : '#86ffc8e5',
        child: mode === 'light' ? '#160a5c' : '#31a291dd',
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
            backgroundColor: '#0A3C5A',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#074242ff',
            },
          }),
          containedSecondary: ({ theme }) => ({
            backgroundColor: '#b71c1c',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#a70505ff',
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: backgroundPaper,
            color: textPrimaryColor,
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(12px)',
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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: backgroundPaper,
            backdropFilter: 'blur(12px)',
          },
        },
      },
    },
  });
};