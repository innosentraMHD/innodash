import React from 'react';
import { Grid, Card, Typography, Box, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  People as UsersIcon, 
  Male as MaleIcon, 
  Female as FemaleIcon, 
  AccessibilityNew as AdultIcon, 
  ChildCare as ChildIcon,
  Timer as TimerIcon,
  ShoppingCart as CartIcon,
  RemoveShoppingCart as NoCartIcon,
  PointOfSale as CashierIcon
} from '@mui/icons-material';
import DoughnutCharts from './DoughnutCharts';

const formatTimeDisplay = (totalSeconds) => {
  const seconds = Math.floor(Number(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`; 
};

// مكون البطاقة للأوقات (مبسط جداً للموبايل)
const TimeStatCard = ({ icon: Icon, value, label, color }) => (
  <Card sx={{ 
    p: 1, 
    textAlign: 'center', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    borderTop: `4px solid ${color}` // خط ملون علوي لتمييز النوع بدلاً من الأيقونة الكبيرة
  }}>
    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.1rem' }, my: 0.5 }}>
      {value}
    </Typography>
    <Icon sx={{ color: color, fontSize: '1.7rem', opacity: 0.8 }} />
  </Card>
);

// مكون البطاقة العادي (للديموغرافيا)
const MainStatCard = ({ icon: Icon, value, label, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 1.5, height: '100%', width: '100%' }}>
    <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 1.5, width: 70, height: 70 }}>
      <Icon fontSize="small" />
    </Avatar>
    <Box >
      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  </Card>
);

const StatSummary = ({ processedStats }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      {/* 1. إجمالي العملاء */}
      <Box mb={2}>
        <MainStatCard icon={UsersIcon} value={processedStats.totalCustomers} label="Total Customers" color={theme.palette.primary.main} />
      </Box>

      {/* 2. الديموغرافيا - عرض كامل (2 في كل صف) */}
      <Box container spacing={1.5} mb={3}>
        <Box mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 , justifyContent: 'space-evenly' }}>
        <Grid item xs={6}><MainStatCard icon={MaleIcon} value={processedStats.totalMale} label="Male" color={theme.palette.primary.main} /></Grid>
        <Grid item xs={6}><MainStatCard icon={FemaleIcon} value={processedStats.totalFemale} label="Female" color={theme.palette.primary.main} /></Grid>
        </Box>
        <Box mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 , justifyContent: 'space-evenly' }}>
        <Grid item xs={6}><MainStatCard icon={AdultIcon} value={processedStats.totalAdult} label="Adult" color={theme.palette.primary.main} /></Grid>
        <Grid item xs={6}><MainStatCard icon={ChildIcon} value={processedStats.totalChild} label="Child" color={theme.palette.primary.main} /></Grid>
        </Box>

       
       
      </Box>

      {/* 3. الشارت (Doughnut) */}
      <Box mb={3} sx={{ display: 'flex', justifyContent: 'center' , backgroundColor: theme.palette.background.default, }}>
        <DoughnutCharts processedStats={processedStats} />
      </Box>

      {/* 4. الأوقات الثلاثة - متجاورة وعرض كامل */}
      <Typography variant="subtitle2" sx={{ mb:2 , mt:2 , fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimerIcon fontSize="small" /> Time Analytics
      </Typography>
      
      <Grid container spacing={0} justifyContent={'space-evenly'}>
        <Grid item xs={4}>
          <TimeStatCard 
            icon={CartIcon} 
            value={formatTimeDisplay(processedStats.avgTimePurchase)} 
            label="Purchase" 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={4}>
          <TimeStatCard 
            icon={NoCartIcon} 
            value={formatTimeDisplay(processedStats.avgTimeNotPurchase)} 
            label="No Pur." 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={4}>
          <TimeStatCard 
            icon={CashierIcon} 
            value={formatTimeDisplay(processedStats.avgTimeCashOut)} 
            label="Cash Out" 
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatSummary;